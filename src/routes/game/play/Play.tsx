import { Board } from '../components/board/Board';
import './Play.css';
import LeftColumn from '../components/leftColumn/LeftColumn';
import RightColumn from '../components/rightColumn/RightColumn';
import HandZone from '../components/zones/handZone/HandZone';
import PlayerHand from '../components/zones/playerHand/PlayerHand';
import OptionsMenu from '../components/elements/optionsMenu/OptionsMenu';
import InventoryModal from '../components/elements/inventory/InventoryModal';
import EventsHandler from '../components/elements/eventsHandler/EventsHandler';
import PlayerInputPopUp from '../components/elements/playerInputPopUp/PlayerInputPopUp';
import CardPortal from '../components/elements/cardPortal/CardPortal';
import ChatCardDetail from '../components/elements/chatCardDetail/ChatCardDetail';
import CardListZone from '../components/zones/cardListZone/CardListZone';
import ChainLinkSummaryContainer from '../components/elements/chainLinkSummary/ChainLinkSummary';
import ActiveLayersZone from '../components/zones/activeLayersZone/ActiveLayersZone';
import GameStateHandler from 'app/GameStateHandler';
import HeroVsHeroIntro from '../components/elements/heroVsHeroIntro/HeroVsHeroIntro';
import OpponentInactive from '../components/elements/opponentInactive/OpponentInactive';
import { useCookies } from 'react-cookie';
import { useEffect, useRef } from 'react';
import { usePageTitle } from 'hooks/usePageTitle';
import { useAppDispatch, useAppSelector } from '../../../app/Hooks';
import {
  setIsRoguelike,
  setHeroInfo,
  getGameInfo
} from '../../../features/game/GameSlice';
import { fetchAllSettings, settingUpdated } from 'features/options/optionsSlice';
import { SHORTCUT_ATTACK_THRESHOLD, SKIP_AR_WINDOW, SKIP_DR_WINDOW } from 'features/options/constants';
import { Toaster } from 'react-hot-toast';
import { shallowEqual } from 'react-redux';
import { PanelProvider } from '../components/leftColumn/PanelContext';

function Play({ isRoguelike }: { isRoguelike: boolean }) {
  usePageTitle('In Game');
  const turnPhase = useAppSelector((state: any) => state.game.turnPhase?.turnPhase);
  const isGameOver = turnPhase === 'OVER';

  // Block ad scripts from redirecting the tab during active gameplay.
  useEffect(() => {
    if (isGameOver) return;

    const isSafe = (url: string) => {
      try {
        return new URL(url, window.location.href).hostname === window.location.hostname;
      } catch {
        return true;
      }
    };

    const origOpen = window.open.bind(window);
    window.open = () => null;

    const origAssign = window.location.assign.bind(window.location);
    const origReplace = window.location.replace.bind(window.location);
    (window.location as any).assign = (url: string) => { if (isSafe(url)) origAssign(url); };
    (window.location as any).replace = (url: string) => { if (isSafe(url)) origReplace(url); };

    const locProto = Location.prototype;
    const hrefDesc = Object.getOwnPropertyDescriptor(locProto, 'href');
    if (hrefDesc?.set) {
      const origSet = hrefDesc.set;
      Object.defineProperty(locProto, 'href', {
        configurable: true,
        enumerable: hrefDesc.enumerable,
        get: hrefDesc.get,
        set(url: string) {
          if (isSafe(url)) origSet.call(this, url);
        },
      });
    }

    return () => {
      window.open = origOpen;
      (window.location as any).assign = origAssign;
      (window.location as any).replace = origReplace;
      if (hrefDesc) Object.defineProperty(locProto, 'href', hrefDesc);
    };
  }, [isGameOver]);

  // Always hide anchor ads while the game view is mounted
  useEffect(() => {
    const ANCHOR_SELECTOR = '[data-ad="anchor"]';
    const hideAnchors = () => {
      document.querySelectorAll(ANCHOR_SELECTOR).forEach((el) => {
        (el as HTMLElement).style.display = 'none';
      });
    };
    hideAnchors();
    const observer = new MutationObserver(hideAnchors);
    observer.observe(document.documentElement, { childList: true, subtree: true });
    return () => observer.disconnect();
  }, []);
  const [cookies] = useCookies([
    'experimental',
    'cardSize',
    'transparencyIntensity',
    'hoverImageSize'
  ]);

  const dispatch = useAppDispatch();
  const gameState = useAppSelector((state: any) => state.game, shallowEqual);
  const heroIntroShown = useAppSelector(
    (state: any) => state.game.heroIntroShown
  );
  const gameInfo = useAppSelector(getGameInfo, shallowEqual);

  useEffect(() => {
    dispatch(setIsRoguelike(isRoguelike));
  }, [isRoguelike]);

  useEffect(() => {
    if (gameInfo.gameID) {
      dispatch(fetchAllSettings({ game: gameInfo }));
    }
  }, [gameInfo.gameID, dispatch]);

  const turnNo = useAppSelector((state: any) => state.game.gameDynamicInfo?.turnNo);
  const prevTurnNoRef = useRef<number | undefined>(undefined);
  useEffect(() => {
    if (prevTurnNoRef.current === undefined) {
      prevTurnNoRef.current = turnNo;
      return;
    }
    if (turnNo !== prevTurnNoRef.current) {
      prevTurnNoRef.current = turnNo;
      dispatch(settingUpdated({ name: SHORTCUT_ATTACK_THRESHOLD, value: '0' }));
      dispatch(settingUpdated({ name: SKIP_AR_WINDOW, value: '0' }));
      dispatch(settingUpdated({ name: SKIP_DR_WINDOW, value: '0' }));
    }
  }, [turnNo, dispatch]);

  // Dispatch hero info once game state is fully populated
  useEffect(() => {
    const playerID = gameState?.gameInfo?.playerID;
    const playerOneHero = gameState?.playerOne?.Hero;
    const playerTwoHero = gameState?.playerTwo?.Hero;

    if (playerID && playerOneHero?.cardNumber && playerTwoHero?.cardNumber) {
      // Get current hero names from gameInfo (may have been set from Lobby)
      const currentHeroName = gameState?.gameInfo?.heroName;
      const currentOpponentHeroName = gameState?.gameInfo?.opponentHeroName;

      // Only dispatch if we don't have opponent hero card number yet (first load)
      if (!gameState?.gameInfo?.opponentHeroCardNumber) {
        const yourCardNumber =
          playerID === 1 ? playerOneHero.cardNumber : playerTwoHero.cardNumber;
        const opponentCardNumber =
          playerID === 1 ? playerTwoHero.cardNumber : playerOneHero.cardNumber;

        dispatch(
          setHeroInfo({
            heroName: currentHeroName,
            yourHeroCardNumber: yourCardNumber,
            opponentHeroCardNumber: opponentCardNumber
          })
        );
      }
    }
  }, [
    gameState?.playerOne?.Hero?.cardNumber,
    gameState?.playerTwo?.Hero?.cardNumber,
    gameState?.gameInfo?.playerID,
    dispatch
  ]);

  useEffect(() => {
    if (cookies.cardSize) {
      document.documentElement.style.setProperty(
        '--card-scale',
        cookies.cardSize
      );
    } else {
      document.documentElement.style.setProperty('--card-scale', '1');
    }
  }, [cookies.cardSize]);

  useEffect(() => {
    if (cookies.transparencyIntensity) {
      document.documentElement.style.setProperty(
        '--transparency-intensity',
        cookies.transparencyIntensity
      );
    } else {
      document.documentElement.style.setProperty(
        '--transparency-intensity',
        '1'
      );
    }
  }, [cookies.transparencyIntensity]);

  useEffect(() => {
    if (cookies.hoverImageSize) {
      document.documentElement.style.setProperty(
        '--hover-img-scale',
        cookies.hoverImageSize
      );
    } else {
      document.documentElement.style.setProperty('--hover-img-scale', '1');
    }
  }, [cookies.hoverImageSize]);

  return (
    <PanelProvider>
      <div className="centering">
        <Toaster
          position="top-left"
          toastOptions={{
            style: {
              background: 'var(--theme-tertiary)',
              color: 'var(--white)',
              border: '2px solid var(--theme-border)',
              padding: '0.5rem',
              wordBreak: 'break-word',
              maxWidth: '100vh',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              userSelect: 'none',
              msUserSelect: 'none',
              WebkitUserSelect: 'none',
              MozUserSelect: 'none',
              zIndex: 10001
            }
          }}
        />
        <div className="app" key="app">
          <ChatCardDetail />
          <LeftColumn />
          <div className="gameZone">
            <HandZone isPlayer={false} />
            <Board />
            <ChainLinkSummaryContainer />
            <HandZone isPlayer />
            <PlayerHand />
          </div>
          <RightColumn />
        </div>
        {!heroIntroShown && <HeroVsHeroIntro />}
        <CardListZone />
        <ActiveLayersZone />
        <OptionsMenu />
        <InventoryModal />
        <PlayerInputPopUp />
        <OpponentInactive />
        <CardPortal />
        <GameStateHandler />
        <EventsHandler />
      </div>
    </PanelProvider>
  );
}

export default Play;

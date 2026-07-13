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
import { useTranslation } from 'react-i18next';
import { useAppDispatch, useAppSelector } from '../../../app/Hooks';
import {
  setIsRoguelike,
  setHeroInfo,
  getGameInfo,
  submitButton
} from '../../../features/game/GameSlice';
import { fetchAllSettings, settingUpdated } from 'features/options/optionsSlice';
import { SHORTCUT_ATTACK_THRESHOLD, SKIP_AR_WINDOW, SKIP_DR_WINDOW } from 'features/options/constants';
import { Toaster } from 'react-hot-toast';
import { shallowEqual } from 'react-redux';
import { PanelProvider } from '../components/leftColumn/PanelContext';
import { RootState } from 'app/Store';
import { PROCESS_INPUT } from 'appConstants';

const TOAST_STYLE: React.CSSProperties = {
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
};
const TOAST_OPTIONS = { style: TOAST_STYLE };

function Play({ isRoguelike }: { isRoguelike: boolean }) {
  const { t } = useTranslation();
  usePageTitle(t('PAGES.GAME_PLAY'));

  // Hide all floating ad overlays while in-game. Only the RightColumn ad slot
  // should ever show ads during gameplay.
  useEffect(() => {
    const FLOATING_AD_SELECTOR =
      '[data-ad="anchor"], [data-ad="video"], [id^="rev-"], [class*="revcontent"], [class*="rev-content"]';

    const hideFloatingAds = () => {
      document.querySelectorAll(FLOATING_AD_SELECTOR).forEach((el) => {
        (el as HTMLElement).style.setProperty('display', 'none', 'important');
      });
    };

    hideFloatingAds();
    const observer = new MutationObserver(hideFloatingAds);
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
  const playerOneHeroCardNumber = useAppSelector(
    (state: RootState) => state.game.playerOne?.Hero?.cardNumber
  );
  const playerTwoHeroCardNumber = useAppSelector(
    (state: RootState) => state.game.playerTwo?.Hero?.cardNumber
  );
  const heroIntroShown = useAppSelector(
    (state: any) => state.game.heroIntroShown
  );
  const gameInfo = useAppSelector(getGameInfo, shallowEqual);
  const canPassPhase = useAppSelector(
    (state: RootState) => state.game.canPassPhase
  );

  useEffect(() => {
    dispatch(setIsRoguelike(isRoguelike));
  }, [isRoguelike]);

  useEffect(() => {
    if (gameInfo.gameID) {
      dispatch(fetchAllSettings({ game: gameInfo }));
    }
  }, [gameInfo.gameID, dispatch]);

  const turnNo = useAppSelector((state: any) => state.game.gameDynamicInfo?.turnNo);
  const turnPlayer = useAppSelector((state: any) => state.game.turnPlayer);
  const prevTurnNoRef = useRef<number | undefined>(undefined);
  const prevTurnPlayerRef = useRef<number | undefined>(undefined);
  useEffect(() => {
    if (prevTurnNoRef.current === undefined) {
      prevTurnNoRef.current = turnNo;
      prevTurnPlayerRef.current = turnPlayer;
      return;
    }
    if (turnNo !== prevTurnNoRef.current || turnPlayer !== prevTurnPlayerRef.current) {
      prevTurnNoRef.current = turnNo;
      prevTurnPlayerRef.current = turnPlayer;
      dispatch(settingUpdated({ name: SHORTCUT_ATTACK_THRESHOLD, value: '0' }));
      dispatch(settingUpdated({ name: SKIP_AR_WINDOW, value: '0' }));
      dispatch(settingUpdated({ name: SKIP_DR_WINDOW, value: '0' }));
    }
  }, [turnNo, turnPlayer, dispatch]);

  // Dispatch hero info once game state is fully populated
  useEffect(() => {
    const playerID = gameInfo?.playerID;

    if (playerID && playerOneHeroCardNumber && playerTwoHeroCardNumber) {
      if (!gameInfo?.opponentHeroCardNumber) {
        const yourCardNumber =
          playerID === 1 ? playerOneHeroCardNumber : playerTwoHeroCardNumber;
        const opponentCardNumber =
          playerID === 1 ? playerTwoHeroCardNumber : playerOneHeroCardNumber;

        dispatch(
          setHeroInfo({
            heroName: gameInfo?.heroName,
            yourHeroCardNumber: yourCardNumber,
            opponentHeroCardNumber: opponentCardNumber
          })
        );
      }
    }
  }, [
    playerOneHeroCardNumber,
    playerTwoHeroCardNumber,
    gameInfo?.playerID,
    gameInfo?.opponentHeroCardNumber,
    gameInfo?.heroName,
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
        <Toaster position="top-left" toastOptions={TOAST_OPTIONS} />
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
        {gameInfo.isReplay && canPassPhase === true && (
          <button
            type="button"
            className="replayAdvanceButton"
            onClick={() =>
              dispatch(submitButton({ button: { mode: PROCESS_INPUT.PASS } }))
            }
          >
            Advance replay
          </button>
        )}
      </div>
    </PanelProvider>
  );
}

export default Play;

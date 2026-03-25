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
import InactivityWarning from '../components/elements/inactivityWarning/InactivityWarning';
import GameStateHandler from 'app/GameStateHandler';
import HeroVsHeroIntro from '../components/elements/heroVsHeroIntro/HeroVsHeroIntro';
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
import { SHORTCUT_ATTACK_THRESHOLD } from 'features/options/constants';
import { Toaster } from 'react-hot-toast';
import { shallowEqual } from 'react-redux';
import { PanelProvider } from '../components/leftColumn/PanelContext';
import useAdScript from 'hooks/useAdScript';
import { AdUnit } from 'components/ads';
import useAuth from 'hooks/useAuth';
import { useGetUserProfileQuery } from 'features/api/apiSlice';

function Play({ isRoguelike }: { isRoguelike: boolean }) {
  usePageTitle('In Game');
  useAdScript(false); // Purge any lingering ad scripts/elements from the landing page
  const { isLoggedIn } = useAuth();
  const { data: profileData, isLoading: isProfileLoading } = useGetUserProfileQuery(undefined, { skip: !isLoggedIn });
  const isSupporter = isLoggedIn ? (isProfileLoading ? true : (profileData?.isMetafySupporter ?? false)) : false;
  const showAds = !isSupporter;
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
        {showAds && (
          <div className="gameAdOverlay">
            <div className="gameAdHeader">
              <a
                href="https://metafy.gg/@talishar/tiers"
                target="_blank"
                rel="noopener noreferrer"
                className="gameRemoveAdsLink"
              >
                Remove ads
              </a>
            </div>
            <AdUnit placement="right-rail-1" />
            {import.meta.env.DEV && (
              <div className="gameAdPlaceholder">Ad · 220×260</div>
            )}
          </div>
        )}
        <CardListZone />
        <ActiveLayersZone />
        <OptionsMenu />
        <InventoryModal />
        <PlayerInputPopUp />
        <CardPortal />
        <InactivityWarning />
        <GameStateHandler />
        <EventsHandler />
      </div>
    </PanelProvider>
  );
}

export default Play;

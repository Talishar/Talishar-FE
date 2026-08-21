import { Board } from '../components/board/Board';
import '../GameViewport.css';
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
import LoadingScreen from 'components/LoadingScreen/LoadingScreen';
import SpectatorLoginRequired from 'components/SpectatorLoginRequired';
import HeroVsHeroIntro from '../components/elements/heroVsHeroIntro/HeroVsHeroIntro';
import OpponentInactive from '../components/elements/opponentInactive/OpponentInactive';
import React, {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState
} from 'react';
import { usePageTitle } from 'hooks/usePageTitle';
import { useTranslation } from 'react-i18next';
import { useAppDispatch, useAppSelector } from '../../../app/Hooks';
import { setIsRoguelike, getGameInfo } from '../../../features/game/GameSlice';
import { fetchAllSettings } from 'features/options/optionsSlice';
import { Toaster } from 'react-hot-toast';
import { shallowEqual } from 'react-redux';
import { PanelProvider } from '../components/leftColumn/PanelContext';
import usePlayerPresenceReporter from 'hooks/usePlayerPresenceReporter';
import useAdScript, { wasAdProviderLoadedInDocument } from 'hooks/useAdScript';
import {
  CardScaleVariables,
  HeroInfoSync,
  ReplayAdvanceButton,
  TurnChangeSettingsSync
} from './PlaySideEffects';
import { RootState } from 'app/Store';

const TOAST_STYLE: React.CSSProperties = {
  background: 'var(--theme-tertiary)',
  color: 'var(--white)',
  border: '1px solid var(--theme-border)',
  padding: '0.5rem',
  wordBreak: 'break-word',
  maxWidth: '100vw',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  userSelect: 'none',
  msUserSelect: 'none',
  WebkitUserSelect: 'none',
  MozUserSelect: 'none',
  zIndex: 10001
};
const TOAST_OPTIONS = { style: TOAST_STYLE };

const isLoadingErrorPreviewEnabled = () =>
  import.meta.env.DEV &&
  typeof window !== 'undefined' &&
  new URLSearchParams(window.location.search).get('loadingErrorTest') === '1';

const GameSurface = React.memo(function GameSurface() {
  return (
    <div className="app" key="app">
      <ChatCardDetail />
      <LeftColumn />
      <div className="gameZone">
        <Board />
        {/* Rendered after Board so the opponent's hand paints over the
            board zones instead of behind them. */}
        <HandZone isPlayer={false} />
        <ChainLinkSummaryContainer />
        <HandZone isPlayer />
        <PlayerHand />
      </div>
      <RightColumn />
    </div>
  );
});

const GameOverlays = React.memo(function GameOverlays() {
  return (
    <>
      <CardListZone />
      <ActiveLayersZone />
      <OptionsMenu />
      <InventoryModal />
      <PlayerInputPopUp />
      <OpponentInactive />
      <CardPortal />
    </>
  );
});

const HeroIntroGate = () => {
  const heroIntroShown = useAppSelector(
    (state: RootState) => state.game.heroIntroShown
  );
  return heroIntroShown ? null : <HeroVsHeroIntro />;
};

function Play({ isRoguelike }: { isRoguelike: boolean }) {
  const needsCleanDocument = useRef(wasAdProviderLoadedInDocument());
  useLayoutEffect(() => {
    if (needsCleanDocument.current) {
      window.location.reload();
    }
  }, []);

  useAdScript(false);
  const { t } = useTranslation();
  usePageTitle(t('PAGES.GAME_PLAY'));
  usePlayerPresenceReporter();

  const dispatch = useAppDispatch();
  const gameInfo = useAppSelector(getGameInfo, shallowEqual);
  const [loadedGameID, setLoadedGameID] = useState<number | null>(null);
  const developmentLoadingError = isLoadingErrorPreviewEnabled()
    ? t('GAME_STATE.GAME_ERROR', {
        message: 'Development preview: This game no longer exists.'
      })
    : null;
  const [loadingError, setLoadingError] = useState<string | null>(
    developmentLoadingError
  );
  const isGameStateLoading =
    gameInfo.gameID <= 0 || loadedGameID !== gameInfo.gameID;

  useEffect(() => {
    dispatch(setIsRoguelike(isRoguelike));
  }, [isRoguelike]);

  useEffect(() => {
    setLoadingError(developmentLoadingError);
  }, [gameInfo.gameID, developmentLoadingError]);

  useEffect(() => {
    if (gameInfo.gameID) {
      dispatch(fetchAllSettings({ game: gameInfo }));
    }
  }, [gameInfo.gameID, dispatch]);

  const handleInitialStateReceived = useCallback((receivedGameID: number) => {
    setLoadedGameID(receivedGameID);
    setLoadingError(null);
  }, []);

  if (needsCleanDocument.current) {
    return null;
  }

  return (
    <PanelProvider>
      <div className="centering">
        <Toaster position="top-left" toastOptions={TOAST_OPTIONS} />
        <GameSurface />
        <HeroIntroGate />
        <GameOverlays />
        <CardScaleVariables />
        <TurnChangeSettingsSync />
        <HeroInfoSync />
        <GameStateHandler
          onInitialStateReceived={handleInitialStateReceived}
          onLoadingError={setLoadingError}
        />
        {isGameStateLoading && (
          <LoadingScreen
            message={t('GAME_STATE.LOADING')}
            detail={loadingError}
          />
        )}
        <SpectatorLoginRequired />
        <EventsHandler />
        <ReplayAdvanceButton />
      </div>
    </PanelProvider>
  );
}

export default Play;

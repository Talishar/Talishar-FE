import { Board } from '../components/board/Board';
import './Play.css';
import LeftColumn from '../components/leftColumn/LeftColumn';
import RightColumn from '../components/rightColumn/RightColumn';
import HandZone from '../components/zones/handZone/HandZone';
import PlayerHand from '../components/zones/playerHand/PlayerHand';
import OptionsMenu from '../components/elements/optionsMenu/OptionsMenu';
import EventsHandler from '../components/elements/eventsHandler/EventsHandler';
import PlayerInputPopUp from '../components/elements/playerInputPopUp/PlayerInputPopUp';
import CardPortal from '../components/elements/cardPortal/CardPortal';
import ChatCardDetail from '../components/elements/chatCardDetail/ChatCardDetail';
import CardListZone from '../components/zones/cardListZone/CardListZone';
import ChainLinkSummaryContainer from '../components/elements/chainLinkSummary/ChainLinkSummary';
import ActiveLayersZone from '../components/zones/activeLayersZone/ActiveLayersZone';
import InactivityWarning from '../components/elements/inactivityWarning/InactivityWarning';
import ExperimentalGameStateHandler from 'app/ExperimentalGameStateHandler';
import HeroVsHeroIntro from '../components/elements/heroVsHeroIntro/HeroVsHeroIntro';
import { useCookies } from 'react-cookie';
import { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '../../../app/Hooks';
import { setIsRoguelike, setHeroInfo } from '../../../features/game/GameSlice';
import { Toaster } from 'react-hot-toast';
import { shallowEqual } from 'react-redux';
import { PanelProvider } from '../components/leftColumn/PanelContext';

function Play({ isRoguelike }: { isRoguelike: boolean }) {
  const [cookies] = useCookies([
    'experimental',
    'cardSize',
    'transparencyIntensity',
    'hoverImageSize'
  ]);

  const dispatch = useAppDispatch();
  const gameState = useAppSelector((state: any) => state.game, shallowEqual);
  const heroIntroShown = useAppSelector((state: any) => state.game.heroIntroShown);
  const gameError = useAppSelector((state: any) => state.game.gameError);

  useEffect(() => {
    dispatch(setIsRoguelike(isRoguelike));
  }, [isRoguelike]);

  // Handle game errors
  useEffect(() => {
    if (gameError) {
      console.error('[Play] Game error detected:', {
        errorType: gameError.type,
        errorMessage: gameError.message
      });
    }
  }, [gameError]);

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
        const yourCardNumber = playerID === 1 ? playerOneHero.cardNumber : playerTwoHero.cardNumber;
        const opponentCardNumber = playerID === 1 ? playerTwoHero.cardNumber : playerOneHero.cardNumber;
        
        dispatch(
          setHeroInfo({
            heroName: currentHeroName,
            yourHeroCardNumber: yourCardNumber,
            opponentHeroCardNumber: opponentCardNumber
          })
        );
      }
    }
  }, [gameState?.playerOne?.Hero?.cardNumber, gameState?.playerTwo?.Hero?.cardNumber, gameState?.gameInfo?.playerID, dispatch]);

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
      document.documentElement.style.setProperty('--transparency-intensity', '1');
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
              border: '1px solid var(--theme-tertiary-focus)',
              padding: '0.5rem',
              wordBreak: 'break-word',
              maxWidth: '100vh', 
              overflow: 'hidden', 
              textOverflow: 'ellipsis', 
              userSelect: 'none',
              msUserSelect: 'none',
              WebkitUserSelect: 'none',
              MozUserSelect: 'none',
              zIndex: 10001,
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
        <PlayerInputPopUp />
        <CardPortal />
        <InactivityWarning />
        <ExperimentalGameStateHandler />
        <EventsHandler />
      </div>
    </PanelProvider>
  );
}

export default Play;

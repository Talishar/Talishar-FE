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
import { useCookies } from 'react-cookie';
import { useEffect } from 'react';
import { useAppDispatch } from '../../../app/Hooks';
import { setIsRoguelike } from '../../../features/game/GameSlice';
import { Toaster } from 'react-hot-toast';

function Play({ isRoguelike }: { isRoguelike: boolean }) {
  const [cookies] = useCookies([
    'experimental',
    'cardSize',
    'transparencyIntensity',
    'hoverImageSize'
  ]);

  const dispatch = useAppDispatch();

  useEffect(() => {
    dispatch(setIsRoguelike(isRoguelike));
  }, [isRoguelike]);

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
    <div className="centering">
      <Toaster
        position="top-left"
        toastOptions={{
          style: {
            background: 'var(--dark-red)',
            color: 'var(--white)',
            border: '1px solid var(--primary)',
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
      <CardListZone />
      <ActiveLayersZone />
      <OptionsMenu />
      <PlayerInputPopUp />
      <CardPortal />
      <InactivityWarning />
      <ExperimentalGameStateHandler />
      <EventsHandler />
    </div>
  );
}

export default Play;

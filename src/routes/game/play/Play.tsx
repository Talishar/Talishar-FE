import React, { useEffect, useState } from 'react';
import { Board } from '../components/board/Board';
import './Play.module.css';
import GameStateHandler from '../../../app/GameStateHandler';
import LeftColumn from '../components/leftColumn/LeftColumn';
import RightColumn from '../components/rightColumn/RightColumn';
import HandZone from '../components/zones/handZone/HandZone';
import PlayerHand from '../components/zones/playerHand/PlayerHand';
import { useAppSelector } from 'app/Hooks';
import { RootState } from 'app/Store';
import OptionsOverlay from '../components/elements/optionsMenu/OptionsMenu';
import { Toaster } from 'react-hot-toast';
import EventsHandler from '../components/elements/eventsHandler/EventsHandler';
import PlayerInputPopUp from '../components/elements/playerInputPopUp/PlayerInputPopUp';
import CardPopUp from '../components/elements/cardPopUp/CardPopUp';
import ChatCardDetail from '../components/elements/chatCardDetail/ChatCardDetail';

function Play() {
  const [maxWidth, setMaxWidth] = useState(1920);
  const playerNo = useAppSelector(
    (state: RootState) => state.game.gameInfo.playerID
  );
  let isSpectator = false;

  if (playerNo === 3) {
    isSpectator = true;
  }

  useEffect(() => {
    const calculateRatio = () => {
      if (window.innerHeight < window.innerWidth) {
        setMaxWidth((window.innerHeight * 16) / 9);
      } else {
        setMaxWidth(window.innerWidth);
      }
    };
    window.addEventListener('resize', calculateRatio);
    calculateRatio();
  }, []);

  return (
    <div className="centering">
      <div className="app" style={{ maxWidth }}>
        <ChatCardDetail />
        <LeftColumn />
        <div className="gameZone">
          <HandZone isPlayer={false} />
          <Board />
          <HandZone isPlayer />
          <PlayerHand />
        </div>
        <RightColumn />
      </div>
      <OptionsOverlay />
      <PlayerInputPopUp />
      <CardPopUp />
      <GameStateHandler />
      <EventsHandler />
    </div>
  );
}

export default Play;

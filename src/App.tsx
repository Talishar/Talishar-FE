import React, { useEffect, useState } from 'react';
import { Board } from './game/board/Board';
import './App.css';
import GameStateHandler from './app/GameStateHandler';
import LeftColumn from './game/leftColumn/LeftColumn';
import RightColumn from './game/rightColumn/RightColumn';
import HandZone from './game/zones/handZone/HandZone';
import PlayerHand from './game/zones/playerHand/PlayerHand';
import { useAppSelector } from './app/Hooks';
import { RootState } from './app/Store';
import OptionsOverlay from './game/elements/optionsMenu/OptionsMenu';
import { Toaster } from 'react-hot-toast';
import EventsHandler from './game/elements/eventsHandler/EventsHandler';

function App() {
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
      <Toaster
        position="top-left"
        toastOptions={{
          style: {
            background: '#004225',
            color: '#fffdd0',
            border: '1px solid #fffdd0',
            padding: '0.5rem'
          }
        }}
      />
      <EventsHandler />
      <div
        id="cardDetail"
        style={{ display: 'none', position: 'absolute' }}
      ></div>
      <div className="app" style={{ maxWidth }}>
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
      <GameStateHandler />
    </div>
  );
}

export default App;

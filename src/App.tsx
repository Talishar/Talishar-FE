import React from 'react';
import { Board } from './game/board';
import './App.css';
import { GameStateHandler } from './app/gameStateHandler';
import { LeftColumn } from './game/leftColumn';
import { RightColumn } from './game/rightColumn';
import { HandZone } from './game/zones/handZone';

function App() {
  return (
    <div className="centering">
      <GameStateHandler />
      <div className="app">
        <LeftColumn />
        <div className="gameZone">
          <HandZone isPlayer={false} />
          <Board />
          <HandZone isPlayer={true} />
        </div>
        <RightColumn />
      </div>
    </div>
  );
}

export default App;

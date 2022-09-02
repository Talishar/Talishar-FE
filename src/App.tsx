import React, { useEffect, useState } from 'react';
import { Board } from './game/board';
import './App.css';
import { GameStateHandler } from './app/GameStateHandler';
import { LeftColumn } from './game/leftColumn';
import { RightColumn } from './game/rightColumn';
import { HandZone } from './game/zones/handZone';

function App() {
  const [maxWidth, setMaxWidth] = useState(1920);

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
      <GameStateHandler />
      <div className="app" style={{ maxWidth }}>
        <LeftColumn />
        <div className="gameZone">
          <HandZone isPlayer={false} />
          <Board />
          <HandZone isPlayer />
        </div>
        <RightColumn />
      </div>
    </div>
  );
}

export default App;

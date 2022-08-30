import React from 'react';
import { Board } from './game/board';
import './App.css';
import { GameStateHandler } from './app/gameStateHandler';
import { LeftColumn } from './game/leftColumn';
import { RightColumn } from './game/rightColumn';
import { HandZone } from './game/zones/handZone';

const maxWidth = 1370;
const maxHeight = 970;

function App() {
  const [dimension, setDimension] = React.useState(1.0);

  React.useEffect(() => {
    function handleResize() {
      let ratio = 0;
      if (
        window.innerHeight / maxHeight <
        (window.innerWidth - 75) / maxWidth
      ) {
        ratio = window.innerHeight / maxHeight;
      } else {
        ratio = (window.innerWidth - 75) / maxWidth;
      }
      setDimension(ratio);
    }
    window.addEventListener('resize', handleResize);
    handleResize();
  }, []);

  return (
    <div className="centering">
      <GameStateHandler />
      <div className="app">
        <LeftColumn />
        <div
          className="gameZone"
          // style={{ transform: 'scale(' + dimension + ')' }}
        >
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

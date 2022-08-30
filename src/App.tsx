import React from 'react';
import { Board } from './game/board';
import './App.css';
import { GameStateHandler } from './app/gameStateHandler';
import { LeftColumn } from './game/leftColumn';
import { RightColumn } from './game/rightColumn';
import { Hand } from './game/hand';

function App() {
  const [dimension, setDimension] = React.useState({
    height: window.innerHeight,
    width: window.innerWidth,
    maxDimension:
      window.innerHeight < window.innerWidth
        ? window.innerHeight
        : window.innerWidth
  });

  React.useEffect(() => {
    function handleResize() {
      setDimension({
        height: window.innerHeight,
        width: window.innerWidth,
        maxDimension:
          window.innerHeight < window.innerWidth
            ? window.innerHeight
            : window.innerWidth
      });
    }
    window.addEventListener('resize', handleResize);
    handleResize();
  }, []);

  return (
    <div className="centering">
      <GameStateHandler />
      <div className="app">
        <LeftColumn />
        <div className="gameZone" style={{ maxHeight: dimension.height }}>
          <Hand isPlayer={false} />
          <Board dimension={dimension.maxDimension} />
          <Hand isPlayer={true} />
        </div>
        <RightColumn />
      </div>
    </div>
  );
}

export default App;

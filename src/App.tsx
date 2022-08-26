import React from 'react';
import { Board } from './game/board';
import './App.css';
import { GameStateHandler } from './app/gameStateHandler';

function App() {
  const [dimension, setDimension] = React.useState({
    height: window.innerHeight,
    width: window.innerWidth,
    maxDimension:
      window.innerHeight > window.innerWidth
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
    <div className="App">
      <GameStateHandler />
      <div className="leftCol"></div>
      <div
        style={{
          height: dimension.maxDimension,
          width: dimension.maxDimension
        }}
      >
        <Board dimension={dimension.maxDimension} />
      </div>
      <div className="rightCol"></div>
    </div>
  );
}

export default App;

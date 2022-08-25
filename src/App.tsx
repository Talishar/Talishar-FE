import React from 'react';
import { Board } from './game/board';
import './App.css';

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
      console.log('inner Height', window.innerHeight);
      console.log('inner Width', window.innerWidth);
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
  }, [window.innerHeight, window.innerWidth]);

  return (
    <div className="App">
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

import React, { useEffect } from 'react';

const intervalLength = 2000;
// const hostURL = 'https://localhost/FaBOnline/';

export function GameStateHandler() {
  useEffect(() => {
    function getGameState() {
      console.log('Getting the game state!');
    }
    const intervalID = setInterval(getGameState, intervalLength);
    getGameState();
    return () => {
      clearInterval(intervalID);
    };
  }, []);

  return <></>;
}

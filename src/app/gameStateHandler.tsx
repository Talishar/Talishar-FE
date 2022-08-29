import React, { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import type { AppDispatch } from './store';
import { nextTurn } from '../features/game/gameSlice';

const intervalLength = 2000;
// const hostURL = 'https://localhost/FaBOnline/';

export function GameStateHandler() {
  const params = {
    gameID: 663,
    playerID: 3,
    authKey: '28df413b665604299807c461a7f3cae71c4176cb2b96afad04b84cf96d016258'
  };
  const dispatch = useDispatch<AppDispatch>();
  useEffect(() => {
    function getGameState() {
      dispatch(nextTurn(params));
    }
    const intervalID = setInterval(getGameState, intervalLength);
    getGameState();
    return () => {
      clearInterval(intervalID);
    };
  }, []);

  return <></>;
}

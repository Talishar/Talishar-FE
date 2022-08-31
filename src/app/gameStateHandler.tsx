import React, { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import type { AppDispatch } from './store';
import { useSelector } from 'react-redux';
import { RootState } from '../app/store';
import { nextTurn } from '../features/game/gameSlice';

const intervalLength = 2000;
// const hostURL = 'https://localhost/FaBOnline/';

export function GameStateHandler() {
  const params = useSelector((state: RootState) => state.game.gameInfo);

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

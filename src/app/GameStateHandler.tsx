import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import type { AppDispatch } from './Store';
import { RootState } from './Store';
import { nextTurn } from '../features/game/GameSlice';

const intervalLength = 2000;
// const hostURL = 'https://localhost/FaBOnline/';

export default function GameStateHandler() {
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
  }, [params, dispatch]);

  return null;
}

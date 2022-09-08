import { useEffect } from 'react';
import { useSelector } from 'react-redux';
import type { AppDispatch } from './Store';
import { RootState } from './Store';
import { nextTurn } from '../features/game/GameSlice';
import { useAppDispatch, useAppSelector } from './Hooks';

const intervalLength = 1000;
// const hostURL = 'https://localhost/FaBOnline/';

// set to true if you do not want redux being updated every second.
const DO_NOT_CALL = true;

export default function GameStateHandler() {
  const params = useAppSelector((state: RootState) => state.game.gameInfo);

  const dispatch = useAppDispatch();
  useEffect(() => {
    function getGameState() {
      if (DO_NOT_CALL) {
        return;
      }
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

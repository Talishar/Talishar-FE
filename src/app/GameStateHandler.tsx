import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import type { AppDispatch } from './Store';
import { RootState } from './Store';
import { nextTurn } from '../features/game/GameSlice';

const intervalLength = 2000;
// const hostURL = 'https://localhost/FaBOnline/';

// set to true if you do not want redux being updated every second.
const DO_NOT_CALL = false;

export default function GameStateHandler() {
  const params = useSelector((state: RootState) => state.game.gameInfo);

  const dispatch = useDispatch<AppDispatch>();
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

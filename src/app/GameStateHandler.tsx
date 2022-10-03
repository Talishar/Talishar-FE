import { useEffect } from 'react';
import { RootState } from './Store';
import { nextTurn, setGameStart } from '../features/game/GameSlice';
import { useAppDispatch, useAppSelector } from './Hooks';

const intervalLength = 1000;
// const hostURL = 'https://localhost/FaBOnline/';

// set to true if you do not want redux being updated every second.
const DO_NOT_CALL = false;

export default function GameStateHandler() {
  const QueryParam = new URLSearchParams(window.location.search);
  const params = useAppSelector((state: RootState) => state.game.gameInfo);
  const dispatch = useAppDispatch();

  // setup long poll
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

  // write the gameID etc to the params
  useEffect(() => {
    let gameID = QueryParam.get('gameName') ? QueryParam.get('gameName') : '0';
    if (typeof gameID != 'string') {
      gameID = '0';
    }
    let player = QueryParam.get('playerID');
    console.log(player);
    if (player === null) {
      player = '3';
    }
    let authKey = QueryParam.get('authKey');
    if (authKey === null) {
      authKey = '';
    }

    dispatch(
      setGameStart({
        gameID: parseInt(gameID),
        playerID: parseInt(player),
        authKey: authKey
      })
    );
  }, []);

  return null;
}

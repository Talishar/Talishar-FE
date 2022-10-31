import { useEffect } from 'react';
import { RootState } from './Store';
import { nextTurn, setGameStart } from '../features/game/GameSlice';
import { useAppDispatch, useAppSelector } from './Hooks';

const intervalLength = 1000;
// const hostURL = 'https://localhost/FaBOnline/';

// set to false if you do not want redux being updated every second.
const ENABLE_LONG_POLL = false;

export default function GameStateHandler() {
  const QueryParam = new URLSearchParams(window.location.search);
  const params = useAppSelector((state: RootState) => state.game.gameInfo);
  const isUpdateInProgress = useAppSelector(
    (state: RootState) => state.game.isUpdateInProgress
  );
  const dispatch = useAppDispatch();

  // setup long poll
  useEffect(() => {
    if (params.gameID == 0 || isUpdateInProgress) {
      return;
    }

    dispatch(nextTurn(params));
  }, [params, isUpdateInProgress, dispatch]);

  // write the gameID etc to the params
  useEffect(() => {
    let gameID = QueryParam.get('gameName') ? QueryParam.get('gameName') : '0';
    if (typeof gameID != 'string') {
      gameID = '0';
    }
    let player = QueryParam.get('playerID');
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

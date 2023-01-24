import React, { useRef } from 'react';
import { useEffect } from 'react';
import { RootState } from './Store';
import {
  nextTurn,
  setGameStart,
  setIsUpdateInProgressFalse
} from '../features/game/GameSlice';
import { useAppDispatch, useAppSelector } from './Hooks';
import { shallowEqual } from 'react-redux';

export const GameStateHandler = React.memo(() => {
  const abortRef = useRef<AbortController>();
  const QueryParam = new URLSearchParams(window.location.search);
  const params = useAppSelector(
    (state: RootState) => state.game.gameInfo,
    shallowEqual
  );
  const isUpdateInProgress = useAppSelector(
    (state: RootState) => state.game.isUpdateInProgress
  );
  const dispatch = useAppDispatch();

  // setup long poll
  useEffect(() => {
    if (params.gameID == 0 || isUpdateInProgress) {
      return;
    }
    dispatch(nextTurn({ game: params, signal: abortRef.current?.signal }));
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
    if (!authKey) {
      // TODO: Get authKey from lastAuthKey cookie.
      authKey = '';
    }
    abortRef.current = new AbortController();

    dispatch(
      setGameStart({
        gameID: parseInt(gameID),
        playerID: parseInt(player),
        authKey: authKey
      })
    );

    return () => {
      abortRef.current?.abort();
      dispatch(setIsUpdateInProgressFalse());
    };
  }, []);

  return null;
});

GameStateHandler.displayName = 'GameStateHandler';
export default GameStateHandler;

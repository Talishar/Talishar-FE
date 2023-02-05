import React, { useRef, useState } from 'react';
import { useEffect } from 'react';
import { RootState } from './Store';
import {
  nextTurn,
  setGameStart,
  setIsUpdateInProgressFalse
} from '../features/game/GameSlice';
import { useAppDispatch, useAppSelector } from './Hooks';
import { shallowEqual } from 'react-redux';
import { useKnownSearchParams } from 'hooks/useKnownSearchParams';

export const GameStateHandler = React.memo(() => {
  const abortRef = useRef<AbortController>();
  const [{ gameName = '0', playerID = '3', authKey = '' }] =
    useKnownSearchParams();
  const params = useAppSelector(
    (state: RootState) => state.game.gameInfo,
    shallowEqual
  );
  const [firstPoll, setFirstPoll] = useState(true);
  const isUpdateInProgress = useAppSelector(
    (state: RootState) => state.game.isUpdateInProgress
  );
  const dispatch = useAppDispatch();

  // setup long poll
  useEffect(() => {
    if (params.gameID == 0 || isUpdateInProgress || firstPoll) {
      return;
    }
    dispatch(nextTurn({ game: params, signal: abortRef.current?.signal }));
  }, [params, isUpdateInProgress, dispatch]);

  // write the gameID etc to the params
  useEffect(() => {
    abortRef.current = new AbortController();

    if (gameName != '0' && gameName != String(params.gameID)) {
      dispatch(
        setGameStart({
          gameID: parseInt(gameName),
          playerID: parseInt(playerID),
          authKey: authKey
        })
      );
    }

    setTimeout(() => {
      setFirstPoll(false);
      dispatch(nextTurn({ game: params, signal: abortRef.current?.signal }));
    }, 500);

    return () => {
      abortRef.current?.abort();
      dispatch(setIsUpdateInProgressFalse());
    };
  }, [params.gameID]);

  return null;
});

GameStateHandler.displayName = 'GameStateHandler';
export default GameStateHandler;

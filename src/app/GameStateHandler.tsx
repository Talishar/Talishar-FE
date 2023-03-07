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
import {
  redirect,
  useLocation,
  useNavigate,
  useParams
} from 'react-router-dom';
import { GameLocationState } from 'interface/GameLocationState';
import { toast } from 'react-hot-toast';
import { TimeoutId } from '@reduxjs/toolkit/dist/query/core/buildMiddleware/types';

export const GameStateHandler = React.memo(() => {
  const abortRef = useRef<AbortController>();
  const timeOutRef = useRef<TimeoutId>();
  const navigate = useNavigate();
  const location = useLocation();
  const locationState = location.state as GameLocationState | undefined;
  const [{ gameName = '0', playerID = '3', authKey = '' }] =
    useKnownSearchParams();
  const { gameID } = useParams();
  const gameInfo = useAppSelector(
    (state: RootState) => state.game.gameInfo,
    shallowEqual
  );
  const [firstPoll, setFirstPoll] = useState(true);
  const isUpdateInProgress = useAppSelector(
    (state: RootState) => state.game.isUpdateInProgress
  );
  const dispatch = useAppDispatch();

  if (gameID === undefined && gameName === '0') {
    navigate('/');
    toast.error('No GameID defined');
  }

  // setup long poll
  useEffect(() => {
    if (gameInfo.gameID == 0 || isUpdateInProgress) {
      return;
    }

    clearTimeout(timeOutRef.current);
    abortRef.current?.abort();

    abortRef.current = new AbortController();
    dispatch(nextTurn({ game: gameInfo, signal: abortRef.current?.signal }));

    // timeout if longer than 10 seconds. Will clear this interval on next poll
    timeOutRef.current = setTimeout(() => {
      abortRef.current?.abort;
      dispatch(setIsUpdateInProgressFalse());
    }, 10000);
  }, [gameInfo.gameID, isUpdateInProgress, dispatch]);

  // on mount, write gameID etc.
  useEffect(() => {
    abortRef.current = new AbortController();
    dispatch(
      setGameStart({
        gameID: parseInt(gameID ?? gameName),
        playerID: locationState?.playerID ?? parseInt(playerID),
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

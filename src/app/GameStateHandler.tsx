import React, { useRef, useState } from 'react';
import { useEffect } from 'react';
import { RootState } from './Store';
import {
  getGameInfo,
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
  const gameInfo = useAppSelector(getGameInfo, shallowEqual);
  const lastUpdate = useAppSelector(
    (state: RootState) => state.game.gameDynamicInfo.lastUpdate
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
    if (gameInfo.gameID == 0 || isUpdateInProgress || gameInfo.gameID === 101) {
      return;
    }

    clearTimeout(timeOutRef.current);
    abortRef.current?.abort();

    abortRef.current = new AbortController();
    dispatch(
      nextTurn({
        game: gameInfo,
        signal: abortRef.current?.signal,
        lastUpdate: lastUpdate ?? 0
      })
    );

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

    if (gameID === '101') {
      dispatch(
        nextTurn({
          game: {
            gameID: parseInt(gameID ?? gameName),
            playerID: 3,
            authKey: '',
            isPrivate: false
          },
          signal: abortRef.current?.signal,
          lastUpdate: 0
        })
      );

      return;
    }

    return () => {
      abortRef.current?.abort();
      dispatch(setIsUpdateInProgressFalse());
    };
  }, []);

  return null;
});

GameStateHandler.displayName = 'GameStateHandler';
export default GameStateHandler;

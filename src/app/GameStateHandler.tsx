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

export const GameStateHandler = React.memo(() => {
  const abortRef = useRef<AbortController>();
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

  if (gameID === undefined) {
    navigate('/');
    toast.error('No GameID defined');
  }

  // setup long poll
  useEffect(() => {
    if (gameInfo.gameID == 0 || isUpdateInProgress || firstPoll) {
      return;
    }
    dispatch(nextTurn({ game: gameInfo, signal: abortRef.current?.signal }));
  }, [gameInfo.gameID, isUpdateInProgress, dispatch]);

  // write the gameID etc to the params
  useEffect(() => {
    abortRef.current = new AbortController();

    setTimeout(() => {
      setFirstPoll(false);
      dispatch(nextTurn({ game: gameInfo, signal: abortRef.current?.signal }));
    }, 500);

    return () => {
      abortRef.current?.abort();
      dispatch(setIsUpdateInProgressFalse());
    };
  }, [gameInfo.gameID]);

  useEffect(() => {
    dispatch(
      setGameStart({
        gameID: parseInt(gameID ?? ''),
        playerID: locationState?.playerID ?? parseInt(playerID),
        authKey: authKey
      })
    );
  }, []);

  return null;
});

GameStateHandler.displayName = 'GameStateHandler';
export default GameStateHandler;

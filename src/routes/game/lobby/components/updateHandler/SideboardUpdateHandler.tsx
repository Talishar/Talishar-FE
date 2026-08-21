import React, { useRef } from 'react';
import { useEffect } from 'react';
import { RootState } from 'app/Store';
import {
  gameLobby,
  getGameInfo,
  setGameStart,
  setIsUpdateInProgressFalse
} from 'features/game/GameSlice';
import { useAppDispatch, useAppSelector } from 'app/Hooks';
import { shallowEqual } from 'react-redux';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { GameLocationState } from 'interface/GameLocationState';
import { useKnownSearchParams } from 'hooks/useKnownSearchParams';
import { toast } from 'react-hot-toast';
import { useTranslation } from 'react-i18next';

const LOBBY_POLL_TIMEOUT_MS = 12000;

export const LobbyUpdateHandler = React.memo(() => {
  // Initial stuff to allow the lang to change
  const { t } = useTranslation();
  const abortRef = useRef<AbortController>();
  const timeoutRef = useRef<ReturnType<typeof setTimeout>>();
  const gameInfo = useAppSelector(getGameInfo, shallowEqual);
  const isUpdateInProgress = useAppSelector(
    (state: RootState) => state.game.isUpdateInProgress
  );
  const lastUpdate = useAppSelector(
    (state: RootState) => state.game.gameDynamicInfo.lastUpdate
  );
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { gameID } = useParams();
  const location = useLocation();
  const locationState = location.state as GameLocationState | undefined;
  const [{ playerID = '3', authKey = '' }] = useKnownSearchParams();

  if (gameID === undefined) {
    navigate('/');
    toast.error(t('GAME_LOBBY.NO_GAMEID'));
  }

  // setup long poll
  useEffect(() => {
    if (isUpdateInProgress) {
      return;
    }

    if (!gameInfo.gameID) {
      return;
    }

    if (timeoutRef.current !== undefined) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = undefined;
    }

    const controller = new AbortController();
    abortRef.current = controller;

    dispatch(
      gameLobby({
        game: gameInfo,
        signal: controller.signal,
        lastUpdate: lastUpdate ?? 0
      })
    );

    // Allow the server's 8-second long poll a buffer for network/processing time.
    timeoutRef.current = setTimeout(() => {
      timeoutRef.current = undefined;
      controller.abort();
      dispatch(setIsUpdateInProgressFalse());
    }, LOBBY_POLL_TIMEOUT_MS);
  }, [gameInfo.gameID, isUpdateInProgress, dispatch]);

  useEffect(() => {
    return () => {
      abortRef.current?.abort();
      if (timeoutRef.current !== undefined) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = undefined;
      }
      dispatch(setIsUpdateInProgressFalse());
    };
  }, []);

  useEffect(() => {
    dispatch(
      setGameStart({
        gameID: parseInt(gameID ?? ''),
        playerID: locationState?.playerID ?? parseInt(playerID),
        authKey: locationState?.authKey ?? authKey
      })
    );
  }, []);

  return null;
});

LobbyUpdateHandler.displayName = 'LobbyUpdateHandler';
export default LobbyUpdateHandler;

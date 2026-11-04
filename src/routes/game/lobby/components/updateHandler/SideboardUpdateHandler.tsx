import React, { useRef } from 'react';
import { useEffect } from 'react';
import { RootState } from 'app/Store';
import {
  gameLobby,
  getGameInfo,
  LobbyRefreshError,
  setGameStart,
  setIsUpdateInProgressFalse
} from 'features/game/GameSlice';
import { useAppDispatch, useAppSelector } from 'app/Hooks';
import { shallowEqual } from 'react-redux';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { GameLocationState } from 'interface/GameLocationState';
import { useKnownSearchParams } from 'hooks/useKnownSearchParams';
import { loadGameAuthKey, loadGamePlayerID } from 'utils/LocalKeyManagement';
import { toast } from 'react-hot-toast';
import { useTranslation } from 'react-i18next';

const LOBBY_POLL_TIMEOUT_MS = 12000;
const MIN_SUCCESS_POLL_DELAY_MS = 250;
const INITIAL_RETRY_DELAY_MS = 1000;
const MAX_RETRY_DELAY_MS = 60000;

export const LobbyUpdateHandler = React.memo(() => {
  // Initial stuff to allow the lang to change
  const { t } = useTranslation();
  const abortRef = useRef<AbortController>();
  const requestTimeoutRef = useRef<ReturnType<typeof setTimeout>>();
  const retryTimerRef = useRef<ReturnType<typeof setTimeout>>();
  const gameInfo = useAppSelector(getGameInfo, shallowEqual);
  const lastUpdate = useAppSelector(
    (state: RootState) => state.game.gameDynamicInfo.lastUpdate
  );
  const lastUpdateRef = useRef(lastUpdate ?? 0);
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { gameID } = useParams();
  const location = useLocation();
  const locationState = location.state as GameLocationState | undefined;
  const [{ playerID = '3', authKey = '' }] = useKnownSearchParams();

  useEffect(() => {
    if (gameID !== undefined) return;
    toast.error(t('GAME_LOBBY.NO_GAMEID'));
    navigate('/');
  }, [gameID, navigate, t]);

  useEffect(() => {
    lastUpdateRef.current = lastUpdate ?? 0;
  }, [lastUpdate]);

  // Run exactly one long poll at a time. Successful polls restart after a
  // small floor; transient failures use exponential backoff with jitter.
  useEffect(() => {
    if (!gameInfo.gameID) {
      return;
    }

    let stopped = false;
    let failureCount = 0;
    let waitingForVisibility = false;
    const isSpectator = gameInfo.playerID === 3;

    const schedulePoll = (delayMs: number) => {
      if (stopped) return;
      if (isSpectator && document.hidden) {
        waitingForVisibility = true;
        return;
      }
      waitingForVisibility = false;
      retryTimerRef.current = setTimeout(runPoll, delayMs);
    };

    const stopForTerminalError = (error: LobbyRefreshError) => {
      stopped = true;
      if (
        isSpectator &&
        (error.status === 401 ||
          error.message.toLowerCase().includes('required to spectate'))
      ) {
        toast.error(t('SPECTATOR.LOGIN_REQUIRED_BODY'));
        navigate('/user/login');
        return;
      }
      toast.error(error.message);
      navigate('/');
    };

    const getRetryDelay = (error?: LobbyRefreshError) => {
      if (error?.retryAfterMs !== undefined) return error.retryAfterMs;
      const exponentialDelay = Math.min(
        INITIAL_RETRY_DELAY_MS * Math.pow(2, Math.max(0, failureCount - 1)),
        MAX_RETRY_DELAY_MS
      );
      // Spread reconnects after an outage so every lobby does not retry at once.
      return Math.round(exponentialDelay * (0.8 + Math.random() * 0.4));
    };

    async function runPoll() {
      if (stopped) return;
      if (isSpectator && document.hidden) {
        waitingForVisibility = true;
        return;
      }

      const controller = new AbortController();
      abortRef.current = controller;
      requestTimeoutRef.current = setTimeout(
        () => controller.abort(),
        LOBBY_POLL_TIMEOUT_MS
      );

      const action = await dispatch(
        gameLobby({
          game: gameInfo,
          signal: controller.signal,
          lastUpdate: lastUpdateRef.current
        })
      );

      if (requestTimeoutRef.current !== undefined) {
        clearTimeout(requestTimeoutRef.current);
        requestTimeoutRef.current = undefined;
      }
      if (abortRef.current === controller) abortRef.current = undefined;
      if (stopped) return;

      if (gameLobby.fulfilled.match(action)) {
        failureCount = 0;
        if (action.payload?.lastUpdate !== undefined) {
          lastUpdateRef.current = action.payload.lastUpdate;
        }
        schedulePoll(MIN_SUCCESS_POLL_DELAY_MS);
        return;
      }

      const error = action.payload as LobbyRefreshError | undefined;
      if (error?.terminal) {
        stopForTerminalError(error);
        return;
      }

      failureCount += 1;
      schedulePoll(getRetryDelay(error));
    }

    const handleVisibilityChange = () => {
      if (!isSpectator) return;
      if (document.hidden) {
        abortRef.current?.abort();
      } else if (waitingForVisibility) {
        schedulePoll(0);
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    void runPoll();

    return () => {
      stopped = true;
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      abortRef.current?.abort();
      abortRef.current = undefined;
      if (requestTimeoutRef.current !== undefined) {
        clearTimeout(requestTimeoutRef.current);
        requestTimeoutRef.current = undefined;
      }
      if (retryTimerRef.current !== undefined) {
        clearTimeout(retryTimerRef.current);
        retryTimerRef.current = undefined;
      }
      dispatch(setIsUpdateInProgressFalse());
    };
  }, [
    dispatch,
    gameInfo.authKey,
    gameInfo.gameID,
    gameInfo.isPrivateLobby,
    gameInfo.playerID,
    navigate,
    t
  ]);

  useEffect(() => {
    const currentGameID = parseInt(gameID ?? '');
    const explicitPlayerID = locationState?.playerID ?? parseInt(playerID);
    const currentPlayerID =
      explicitPlayerID === 1 || explicitPlayerID === 2
        ? explicitPlayerID
        : loadGamePlayerID(currentGameID) || explicitPlayerID;
    let currentAuthKey = locationState?.authKey || authKey;
    if (
      !currentAuthKey &&
      (currentPlayerID === 1 || currentPlayerID === 2) &&
      currentGameID > 0
    ) {
      currentAuthKey = loadGameAuthKey(currentGameID);
    }

    dispatch(
      setGameStart({
        gameID: currentGameID,
        playerID: currentPlayerID,
        authKey: currentAuthKey
      })
    );
  }, []);

  return null;
});

LobbyUpdateHandler.displayName = 'LobbyUpdateHandler';
export default LobbyUpdateHandler;

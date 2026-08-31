import { useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from './Hooks';
import {
  getGameInfo,
  receiveGameState,
  setGameStart,
  setOpponentPresence,
  setOpponentTyping,
  setRecoveredAuthKey
} from 'features/game/GameSlice';
import { useKnownSearchParams } from 'hooks/useKnownSearchParams';
import { GameLocationState } from 'interface/GameLocationState';
import { BACKEND_URL } from 'appConstants';
import { RootState } from './Store';
import { selectCurrentUserName } from 'features/auth/authSlice';
import {
  getCurrentUsername,
  cacheCurrentUsername,
  loadGameAuthKey,
  loadGamePlayerID,
  saveGameAuthKey
} from 'utils/LocalKeyManagement';
import ParseGameState from './ParseGameState';
import { toast } from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import { reportPerformanceMetric } from 'utils/performanceMetrics';
import useAuth from 'hooks/useAuth';

const MAX_RETRIES = 5;

interface SeatLookup {
  gameID: number;
  settled: boolean;
  playerID?: number;
  authKey?: string;
}

interface GameStateHandlerProps {
  onInitialStateReceived?: (gameID: number) => void;
  onLoadingError?: (message: string) => void;
}

const GameStateHandler = ({
  onInitialStateReceived,
  onLoadingError
}: GameStateHandlerProps) => {
  const { t } = useTranslation();
  const { gameID } = useParams();
  const gameInfo = useAppSelector(getGameInfo);
  const currentUserName = useAppSelector(selectCurrentUserName);
  const { isLoggedIn, isLoading: isAuthLoading } = useAuth();
  const dispatch = useAppDispatch();
  const [{ gameName = '0', playerID = '3', authKey = '' }] =
    useKnownSearchParams();
  const location = useLocation();
  const locationState = location.state as GameLocationState | undefined;
  const isFullRematch = useAppSelector(
    (state: RootState) => state.game.isFullRematch
  );
  const navigate = useNavigate();

  const sourceRef = useRef<EventSource | null>(null);
  const gameParamsRef = useRef({ gameID: 0, playerID: 0, authKey: '' });
  const retryCountRef = useRef(0);
  const lastEventTimeRef = useRef(Date.now());
  const retryTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const navigateTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [forceRetry, setForceRetry] = useState(0);
  const [seatLookup, setSeatLookup] = useState<SeatLookup | null>(null);
  const seatLookupKeyRef = useRef('');
  const gameOverRef = useRef(false);
  const onInitialStateReceivedRef = useRef(onInitialStateReceived);
  const onLoadingErrorRef = useRef(onLoadingError);

  useEffect(() => {
    onInitialStateReceivedRef.current = onInitialStateReceived;
  }, [onInitialStateReceived]);

  useEffect(() => {
    onLoadingErrorRef.current = onLoadingError;
  }, [onLoadingError]);

  useEffect(() => {
    return () => {
      if (navigateTimerRef.current !== null) {
        clearTimeout(navigateTimerRef.current);
        navigateTimerRef.current = null;
      }
    };
  }, []);

  // Claim our seat from the account before falling back to spectating.
  useEffect(() => {
    const currentGameID = parseInt(gameID ?? gameName);
    if (currentGameID <= 0) return;

    // Deciding before the cookie login resolves would lock us into spectating.
    if (isAuthLoading) {
      setSeatLookup({ gameID: currentGameID, settled: false });
      return;
    }

    const lookupKey = `${currentGameID}:${currentUserName ?? ''}:${isLoggedIn}`;
    if (seatLookupKeyRef.current === lookupKey) return;
    seatLookupKeyRef.current = lookupKey;

    const explicitPlayerID = locationState?.playerID ?? parseInt(playerID);
    const storedAuthKey = loadGameAuthKey(currentGameID);
    const knownAuthKey =
      locationState?.authKey || authKey || gameInfo.authKey || storedAuthKey;
    const knownPlayerID =
      explicitPlayerID === 1 || explicitPlayerID === 2
        ? explicitPlayerID
        : loadGamePlayerID(currentGameID);
    const alreadySeated =
      (knownPlayerID === 1 || knownPlayerID === 2) && !!knownAuthKey;

    if (alreadySeated || !isLoggedIn) {
      setSeatLookup({ gameID: currentGameID, settled: true });
      return;
    }

    setSeatLookup({ gameID: currentGameID, settled: false });

    let cancelled = false;
    (async () => {
      let claimed: SeatLookup = { gameID: currentGameID, settled: true };
      try {
        const response = await fetch(`${BACKEND_URL}APIs/RecoverAuthKey.php`, {
          method: 'POST',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            gameName: currentGameID,
            ...(knownPlayerID === 1 || knownPlayerID === 2
              ? { playerID: knownPlayerID }
              : {})
          })
        });
        if (response.ok) {
          const result = await response.json();
          if (
            result?.success &&
            result.authKey &&
            (result.playerID === 1 || result.playerID === 2)
          ) {
            saveGameAuthKey(
              currentGameID,
              result.authKey,
              result.playerID,
              currentUserName || undefined
            );
            claimed = {
              gameID: currentGameID,
              settled: true,
              playerID: result.playerID,
              authKey: result.authKey
            };
          }
        }
      } catch (error) {
        // Not a player in this game, or the lookup failed - spectate instead.
      }
      if (!cancelled) setSeatLookup(claimed);
    })();

    return () => {
      cancelled = true;
    };
  }, [
    gameID,
    gameName,
    playerID,
    authKey,
    gameInfo.authKey,
    locationState?.playerID,
    locationState?.authKey,
    currentUserName,
    isLoggedIn,
    isAuthLoading
  ]);

  useEffect(() => {
    const currentGameID = parseInt(gameID ?? gameName);
    if (seatLookup?.gameID !== currentGameID || !seatLookup.settled) return;

    const claimedPlayerID = seatLookup.playerID;
    const currentPlayerID =
      claimedPlayerID ?? locationState?.playerID ?? parseInt(playerID);

    let currentAuthKey =
      seatLookup.authKey || locationState?.authKey || authKey;
    if (!currentAuthKey) {
      currentAuthKey = gameInfo.authKey;
    }
    if (!currentAuthKey && currentGameID > 0) {
      currentAuthKey = loadGameAuthKey(currentGameID);
    }

    if (
      gameParamsRef.current.gameID !== currentGameID ||
      gameParamsRef.current.playerID !== currentPlayerID ||
      gameParamsRef.current.authKey !== currentAuthKey
    ) {
      const usernameToSave = getCurrentUsername(currentUserName);
      if (usernameToSave) {
        cacheCurrentUsername(usernameToSave);
      }

      dispatch(
        setGameStart({
          gameID: currentGameID,
          playerID: currentPlayerID,
          authKey: currentAuthKey,
          username: usernameToSave || undefined
        })
      );
      // setGameStart preserves the existing playerID when reconnecting to the
      // same game, so a seat we recovered has to be applied explicitly.
      if (claimedPlayerID && seatLookup.authKey) {
        dispatch(
          setRecoveredAuthKey({
            authKey: seatLookup.authKey,
            playerID: claimedPlayerID,
            username: usernameToSave || undefined
          })
        );
      }

      gameParamsRef.current = {
        gameID: currentGameID,
        playerID: currentPlayerID,
        authKey: currentAuthKey
      };
    }
  }, [
    gameID,
    gameName,
    playerID,
    authKey,
    gameInfo.authKey,
    locationState?.playerID,
    currentUserName,
    seatLookup,
    dispatch
  ]);

  // SSE connection to game server
  useEffect(() => {
    const currentGameID = gameInfo.gameID;
    if (seatLookup?.gameID !== currentGameID || !seatLookup.settled) return;
    const currentPlayerID = gameInfo.playerID;
    const currentAuthKey = gameInfo.authKey;

    // Players 1 and 2 require an authKey; spectators (3) do not
    if ((currentPlayerID === 1 || currentPlayerID === 2) && !currentAuthKey) {
      return;
    }

    if (currentPlayerID === 3 && !currentUserName) {
      return;
    }

    // Reset retry count when the game changes
    if (gameParamsRef.current.gameID !== currentGameID) {
      retryCountRef.current = 0;
      gameOverRef.current = false;
      gameParamsRef.current = {
        gameID: currentGameID,
        playerID: currentPlayerID,
        authKey: currentAuthKey
      };
    }

    if (sourceRef.current) {
      sourceRef.current.close();
      sourceRef.current = null;
    }

    const scheduleRetry = (delay: number) => {
      if (retryTimerRef.current !== null) {
        clearTimeout(retryTimerRef.current);
      }
      retryTimerRef.current = setTimeout(() => {
        retryTimerRef.current = null;
        setForceRetry((prev) => prev + 1);
      }, delay);
    };

    // Small delay to ensure the page is ready before connecting
    const connectionTimeout = setTimeout(() => {
      try {
        const source = new EventSource(
          `${BACKEND_URL}GetUpdateSSE.php?gameName=${currentGameID}&playerID=${currentPlayerID}&authKey=${currentAuthKey}`,
          { withCredentials: true }
        );
        sourceRef.current = source;

        let hasConnected = false;

        lastEventTimeRef.current = Date.now();

        source.onmessage = (event) => {
          const updateStartedAt = performance.now();
          hasConnected = true;
          retryCountRef.current = 0;
          lastEventTimeRef.current = Date.now();

          try {
            const data = JSON.parse(event.data);
            const jsonParsedAt = performance.now();

            if (data.error) {
              const errorMsg = data.error.toLowerCase();

              if (
                errorMsg.includes('game no longer exists') ||
                errorMsg.includes('does not exist')
              ) {
                const message = t('GAME_STATE.GAME_ERROR', {
                  message: data.error
                });
                onLoadingErrorRef.current?.(message);
                toast.error(message);
                source.close();
                if (navigateTimerRef.current === null) {
                  navigateTimerRef.current = setTimeout(() => {
                    navigateTimerRef.current = null;
                    navigate('/');
                  }, 60000);
                }
                return;
              }

              if (errorMsg.includes('required to spectate')) {
                const message = t('SPECTATOR.LOGIN_REQUIRED_BODY');
                onLoadingErrorRef.current?.(message);
                toast.error(message);
                source.close();
                return;
              }

              if (
                errorMsg.includes('invalid auth') ||
                errorMsg.includes('authkey')
              ) {
                const message = t('GAME_STATE.AUTH_ERROR', {
                  message: data.error
                });
                onLoadingErrorRef.current?.(message);
                toast.error(message);
                source.close();
                return;
              }

              const message = t('GAME_STATE.SERVER_ERROR', {
                message: data.error
              });
              onLoadingErrorRef.current?.(message);
              toast.error(message);
              return;
            }

            const parsedState = ParseGameState(data);
            const stateParsedAt = performance.now();

            const phase = parsedState.turnPhase?.turnPhase;
            if (phase === 'OVER') {
              gameOverRef.current = true;
            } else if (phase !== undefined && phase !== 'YESNO') {
              gameOverRef.current = false;
            }

            dispatch(receiveGameState(parsedState));
            onInitialStateReceivedRef.current?.(currentGameID);
            const dispatchedAt = performance.now();
            reportPerformanceMetric({
              name: 'game-state-json-parse',
              value: jsonParsedAt - updateStartedAt
            });
            reportPerformanceMetric({
              name: 'game-state-transform',
              value: stateParsedAt - jsonParsedAt
            });
            reportPerformanceMetric({
              name: 'game-state-redux-commit',
              value: dispatchedAt - stateParsedAt
            });
            requestAnimationFrame(() => {
              reportPerformanceMetric({
                name: 'game-state-to-paint',
                value: performance.now() - updateStartedAt
              });
            });
          } catch (parseError) {
            console.error('Failed to parse SSE data:', parseError);
          }
        };

        // Typing state arrives as a named SSE event.
        source.addEventListener('typing', (event: MessageEvent) => {
          lastEventTimeRef.current = Date.now();
          try {
            const data = JSON.parse(event.data);
            if (typeof data.opponentIsTyping === 'boolean') {
              dispatch(setOpponentTyping(data.opponentIsTyping));
            }
          } catch {
            return;
          }
        });

        source.addEventListener('presence', (event: MessageEvent) => {
          lastEventTimeRef.current = Date.now();
          try {
            const data = JSON.parse(event.data);
            dispatch(setOpponentPresence(data.opponentPresence ?? null));
          } catch {
            return;
          }
        });

        source.addEventListener('hb', () => {
          hasConnected = true;
          lastEventTimeRef.current = Date.now();
        });

        source.onerror = () => {
          retryCountRef.current++;
          source.close();
          sourceRef.current = null;

          if (gameOverRef.current) return;

          if (!hasConnected && retryCountRef.current === 1) {
            // Transient interruption during page load - retry once quickly
            scheduleRetry(500);
            return;
          }

          if (retryCountRef.current <= MAX_RETRIES) {
            const retryDelay = Math.min(
              500 * Math.pow(2, retryCountRef.current),
              5000
            );
            scheduleRetry(retryDelay);
          } else {
            if (retryCountRef.current === MAX_RETRIES + 1) {
              const message = t('GAME_STATE.CONNECTION_LOST');
              onLoadingErrorRef.current?.(message);
              toast.error(message);
            }
            scheduleRetry(10000);
          }
        };
      } catch (error) {
        console.error('Failed to create EventSource:', error);
      }
    }, 100);

    const stalenessWatchdog = setInterval(() => {
      if (gameOverRef.current) return;
      if (Date.now() - lastEventTimeRef.current > 45000) {
        lastEventTimeRef.current = Date.now();
        setForceRetry((prev) => prev + 1);
      }
    }, 10000);

    const handleBeforeUnload = () => {
      if (sourceRef.current) {
        sourceRef.current.close();
        sourceRef.current = null;
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      clearTimeout(connectionTimeout);
      clearInterval(stalenessWatchdog);
      if (retryTimerRef.current !== null) {
        clearTimeout(retryTimerRef.current);
        retryTimerRef.current = null;
      }
      window.removeEventListener('beforeunload', handleBeforeUnload);
      if (sourceRef.current) {
        sourceRef.current.close();
        sourceRef.current = null;
      }
    };
  }, [
    gameInfo.gameID,
    gameInfo.playerID,
    gameInfo.authKey,
    currentUserName,
    seatLookup,
    forceRetry,
    dispatch,
    navigate,
    t
  ]);

  useEffect(() => {
    if (isFullRematch && gameID) {
      navigate(`/game/lobby/${gameID}`);
    }
  }, [isFullRematch, gameID, navigate]);

  return null;
};

export default GameStateHandler;

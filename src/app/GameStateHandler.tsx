import { useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from './Hooks';
import {
  getGameInfo,
  receiveGameState,
  setGameStart,
  setOpponentPresence,
  setOpponentTyping
} from 'features/game/GameSlice';
import { useKnownSearchParams } from 'hooks/useKnownSearchParams';
import { GameLocationState } from 'interface/GameLocationState';
import { BACKEND_URL } from 'appConstants';
import { RootState } from './Store';
import { selectCurrentUserName } from 'features/auth/authSlice';
import {
  getCurrentUsername,
  cacheCurrentUsername,
  loadGameAuthKey
} from 'utils/LocalKeyManagement';
import ParseGameState from './ParseGameState';
import { toast } from 'react-hot-toast';
import { useTranslation } from 'react-i18next';

const MAX_RETRIES = 5;

const GameStateHandler = () => {
  const { t } = useTranslation();
  const { gameID } = useParams();
  const gameInfo = useAppSelector(getGameInfo);
  const currentUserName = useAppSelector(selectCurrentUserName);
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
  const gameOverRef = useRef(false);

  useEffect(() => {
    return () => {
      if (navigateTimerRef.current !== null) {
        clearTimeout(navigateTimerRef.current);
        navigateTimerRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    const currentGameID = parseInt(gameID ?? gameName);
    const currentPlayerID = locationState?.playerID ?? parseInt(playerID);

    let currentAuthKey = locationState?.authKey || authKey;
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
    dispatch
  ]);

  // SSE connection to game server
  useEffect(() => {
    const currentGameID = gameInfo.gameID;
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
          hasConnected = true;
          retryCountRef.current = 0;
          lastEventTimeRef.current = Date.now();

          try {
            const data = JSON.parse(event.data);

            if (data.error) {
              const errorMsg = data.error.toLowerCase();

              if (
                errorMsg.includes('game no longer exists') ||
                errorMsg.includes('does not exist')
              ) {
                toast.error(
                  t('GAME_STATE.GAME_ERROR', { message: data.error })
                );
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
                toast.error(t('SPECTATOR.LOGIN_REQUIRED_BODY'));
                source.close();
                return;
              }

              if (
                errorMsg.includes('invalid auth') ||
                errorMsg.includes('authkey')
              ) {
                toast.error(
                  t('GAME_STATE.AUTH_ERROR', { message: data.error })
                );
                source.close();
                return;
              }

              toast.error(
                t('GAME_STATE.SERVER_ERROR', { message: data.error })
              );
              return;
            }

            const parsedState = ParseGameState(data);

            const phase = parsedState.turnPhase?.turnPhase;
            if (phase === 'OVER') {
              gameOverRef.current = true;
            } else if (phase !== undefined && phase !== 'YESNO') {
              gameOverRef.current = false;
            }

            dispatch(receiveGameState(parsedState));
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
              toast.error(t('GAME_STATE.CONNECTION_LOST'));
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

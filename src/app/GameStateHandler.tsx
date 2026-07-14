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

const MAX_RETRIES = 5;

const GameStateHandler = () => {
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
  const [forceRetry, setForceRetry] = useState(0);

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

    // Reset retry count when the game changes
    if (gameParamsRef.current.gameID !== currentGameID) {
      retryCountRef.current = 0;
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

    // Small delay to ensure the page is ready before connecting
    const connectionTimeout = setTimeout(() => {
      try {
        const resolvedUserName = getCurrentUsername(currentUserName) ?? '';
        const source = new EventSource(
          `${BACKEND_URL}GetUpdateSSE.php?gameName=${currentGameID}&playerID=${currentPlayerID}&authKey=${currentAuthKey}&userName=${encodeURIComponent(resolvedUserName)}`
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
                toast.error(`Game Error: ${data.error}`);
                source.close();
                setTimeout(() => navigate('/'), 60000);
                return;
              }

              if (
                errorMsg.includes('invalid auth') ||
                errorMsg.includes('authkey')
              ) {
                toast.error(`Authentication Error: ${data.error}`);
                source.close();
                return;
              }

              toast.error(`Server Error: ${data.error}`);
              return;
            }

            dispatch(receiveGameState(ParseGameState(data)));
          } catch (parseError) {
            console.error('Failed to parse SSE data:', parseError);
          }
        };

        // This replaces the old CheckOpponentTyping polling entirely.
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

          if (!hasConnected && retryCountRef.current === 1) {
            // Transient interruption during page load — retry once quickly
            setTimeout(() => setForceRetry((prev) => prev + 1), 500);
            return;
          }

          if (retryCountRef.current <= MAX_RETRIES) {
            const retryDelay = Math.min(
              500 * Math.pow(2, retryCountRef.current),
              5000
            );
            setTimeout(() => setForceRetry((prev) => prev + 1), retryDelay);
          } else {
            if (retryCountRef.current === MAX_RETRIES + 1) {
              toast.error(
                'Connection to game server lost. Reconnecting...'
              );
            }
            setTimeout(() => setForceRetry((prev) => prev + 1), 10000);
          }
        };
      } catch (error) {
        console.error('Failed to create EventSource:', error);
      }
    }, 100);

    const stalenessWatchdog = setInterval(() => {
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
      window.removeEventListener('beforeunload', handleBeforeUnload);
      if (sourceRef.current) {
        sourceRef.current.close();
        sourceRef.current = null;
      }
    };
  }, [gameInfo.gameID, gameInfo.playerID, gameInfo.authKey, forceRetry, dispatch, navigate]);

  useEffect(() => {
    if (isFullRematch && gameID) {
      navigate(`/game/lobby/${gameID}`);
    }
  }, [isFullRematch, gameID, navigate]);

  return null;
};

export default GameStateHandler;

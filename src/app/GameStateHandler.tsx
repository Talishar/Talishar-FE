import React, { useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from './Hooks';
import { getGameInfo, receiveGameState, setGameStart } from 'features/game/GameSlice';
import { useKnownSearchParams } from 'hooks/useKnownSearchParams';
import { GameLocationState } from 'interface/GameLocationState';
import { BACKEND_URL } from 'appConstants';
import { RootState } from './Store';
import { selectCurrentUserName } from 'features/auth/authSlice';
import { getCurrentUsername, cacheCurrentUsername, loadGameAuthKey } from 'utils/LocalKeyManagement';
import ParseGameState from './ParseGameState';
import { toast } from 'react-hot-toast';

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
  const maxRetriesRef = useRef(5);
  const [forceRetry, setForceRetry] = useState(0);
  const fatalErrorRef = useRef(false);

  useEffect(() => {
    const currentGameID = parseInt(gameID ?? gameName);
    const currentPlayerID = locationState?.playerID ?? parseInt(playerID);

    let currentAuthKey = locationState?.authKey || authKey;
    if (!currentAuthKey) {
      currentAuthKey = gameInfo.authKey;
    }
    if (!currentAuthKey && currentGameID > 0) {
      // Last resort: try to load from localStorage for same game
      currentAuthKey = loadGameAuthKey(currentGameID);
    }

    // Only dispatch if values actually changed
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
      gameParamsRef.current = { gameID: currentGameID, playerID: currentPlayerID, authKey: currentAuthKey };
    }
  }, [gameID, gameName, playerID, authKey, gameInfo.authKey, locationState?.playerID, currentUserName, dispatch]);

  useEffect(() => {
    // Use gameInfo from Redux state (which is already updated) rather than ref
    const currentGameID = gameInfo.gameID;
    const currentPlayerID = gameInfo.playerID;
    const currentAuthKey = gameInfo.authKey;

    // Don't create EventSource if authKey is empty for actual players (playerID 1 or 2)
    // Spectators (playerID 3) don't need authKey, but players do
    if ((currentPlayerID === 1 || currentPlayerID === 2) && !currentAuthKey) {
      // This is expected while authKey is loading, only log once per game change
      if (gameParamsRef.current.gameID !== currentGameID) {
        console.warn(`⏳ AuthKey loading for game ${currentGameID}, player ${currentPlayerID}...`);
      }
      // Wait for authKey to be available before connecting
      return;
    }

    // Reset retry count when game changes
    if (gameParamsRef.current.gameID !== currentGameID) {
      retryCountRef.current = 0;
      gameParamsRef.current = { gameID: currentGameID, playerID: currentPlayerID, authKey: currentAuthKey };
    }

    // Close existing connection before creating new one
    if (sourceRef.current) {
      sourceRef.current.close();
      sourceRef.current = null;
    }

    // Add a small delay before connecting to ensure page is ready
    const connectionTimeout = setTimeout(() => {
      try {
        console.log(`🔌 Connecting to EventSource (attempt ${retryCountRef.current + 1}/${maxRetriesRef.current + 1})...`);
        const source = new EventSource(
          `${BACKEND_URL}GetUpdateSSE.php?gameName=${currentGameID}&playerID=${currentPlayerID}&authKey=${currentAuthKey}`
        );
        sourceRef.current = source;

        // Mark as successful when first message comes through
        let hasConnected = false;

        source.onmessage = (event) => {
          hasConnected = true;
          retryCountRef.current = 0; // Reset retry counter on successful message

          try {
            const data = JSON.parse(event.data);

            // Check for error messages from SSE
            if (data.error) {
              console.error('SSE Error:', data.error);
              const errorMsg = data.error.toLowerCase();

              // Handle game not found errors
              if (errorMsg.includes('game no longer exists') || errorMsg.includes('does not exist')) {
                toast.error(`Game Error: ${data.error}`);
                window.sessionStorage.setItem('gameNotFound', String(currentGameID));
                source.close();
                return;
              }

              // Handle auth errors
              if (errorMsg.includes('invalid auth') || errorMsg.includes('authkey')) {
                toast.error(`Authentication Error: ${data.error}`);
                source.close();
                return;
              }

              // Display other errors
              toast.error(`Server Error: ${data.error}`);
              return;
            }

            // Parse the game state directly from SSE data
            const parsedState = ParseGameState(data);

            // Dispatch the parsed game state directly (no HTTP round-trip needed)
            dispatch(receiveGameState(parsedState));
          } catch (parseError) {
            console.error('Failed to parse SSE data:', parseError);
            // Don't close connection on parse errors - wait for next update
          }
        };

        source.onerror = () => {
          // Only process error if connection was actually established (not just interruption during page load)
          if (!hasConnected && retryCountRef.current === 0) {
            console.warn('⚠️ EventSource connection interrupted during page load');
            // Treat interruptions during load as transient, retry once quickly
            setTimeout(() => {
              setForceRetry(prev => prev + 1);
            }, 500);
            return;
          }

          console.error('❌ EventSource connection failed');
          source.close();
          sourceRef.current = null;

          // Retry with exponential backoff
          if (retryCountRef.current < maxRetriesRef.current) {
            retryCountRef.current++;
            const retryDelay = Math.min(500 * Math.pow(2, retryCountRef.current), 5000);
            console.warn(`⏳ Will retry EventSource connection in ${retryDelay}ms (attempt ${retryCountRef.current + 1}/${maxRetriesRef.current + 1})`);

            setTimeout(() => {
              setForceRetry(prev => prev + 1); // Trigger the effect again
            }, retryDelay);
          } else {
            console.error(`❌ EventSource failed after ${maxRetriesRef.current + 1} attempts.`);
            toast.error('Connection to game server lost. Please refresh the page.');
          }
        };
      } catch (error) {
        console.error('Failed to create EventSource:', error);
      }
    }, 100); // Small delay to ensure page is ready

    return () => {
      clearTimeout(connectionTimeout);
      if (sourceRef.current) {
        sourceRef.current.close();
        sourceRef.current = null;
      }
    };
  }, [gameInfo.gameID, gameInfo.playerID, gameInfo.authKey, gameInfo.isPrivateLobby, gameInfo.isRoguelike, forceRetry, dispatch]);

  useEffect(() => {
    if (isFullRematch && gameID) {
      navigate(`/game/lobby/${gameID}`);
    }
  }, [isFullRematch, gameID, navigate]);

  // Check if game was reported as not found
  const gameNotFoundTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const checkGameNotFound = () => {
      const state = window.sessionStorage.getItem('gameNotFound');
      if (state === String(gameInfo.gameID)) {
        // Only schedule navigation once
        if (!gameNotFoundTimeoutRef.current) {
          console.log(`Game ${gameInfo.gameID} no longer exists, will navigate to games list in 60s`);
          gameNotFoundTimeoutRef.current = setTimeout(() => {
            window.sessionStorage.removeItem('gameNotFound');
            navigate('/');
          }, 60000);
        }
      }
    };

    // Check periodically since errors might come asynchronously
    const interval = setInterval(checkGameNotFound, 1000);
    return () => {
      clearInterval(interval);
      if (gameNotFoundTimeoutRef.current) {
        clearTimeout(gameNotFoundTimeoutRef.current);
      }
    };
  }, [gameInfo.gameID, navigate]);

  return null;
};

export default GameStateHandler;

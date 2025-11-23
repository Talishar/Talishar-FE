import React, { useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from './Hooks';
import { getGameInfo, nextTurn, setGameStart } from 'features/game/GameSlice';
import { useKnownSearchParams } from 'hooks/useKnownSearchParams';
import { GameLocationState } from 'interface/GameLocationState';
import { BACKEND_URL } from 'appConstants';
import { RootState } from './Store';
import { logAuthKeyLoss } from 'utils/AuthKeyMonitoring';
import { selectCurrentUserName } from 'features/auth/authSlice';
import { getCurrentUsername, cacheCurrentUsername } from 'utils/LocalKeyManagement';

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

  useEffect(() => {
    const currentGameID = parseInt(gameID ?? gameName);
    const currentPlayerID = locationState?.playerID ?? parseInt(playerID);
    const currentAuthKey = authKey || gameInfo.authKey;
    
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
        logAuthKeyLoss(currentGameID, currentPlayerID, 'EventSource.setup.waiting');
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

        source.onmessage = () => {
          hasConnected = true;
          retryCountRef.current = 0; // Reset retry counter on successful message
          dispatch(
            nextTurn({
              game: {
                gameID: currentGameID,
                playerID: currentPlayerID,
                authKey: currentAuthKey,
                isPrivateLobby: gameInfo.isPrivateLobby,
                isRoguelike: gameInfo.isRoguelike
              },
              signal: undefined,
              lastUpdate: 0
            })
          );
        };

        source.onerror = () => {
          console.error('❌ EventSource connection failed');
          source.close();
          sourceRef.current = null;
          
          // Log the error
          logAuthKeyLoss(currentGameID, currentPlayerID, 'EventSource.error');
          
          // Retry with exponential backoff
          if (retryCountRef.current < maxRetriesRef.current) {
            retryCountRef.current++;
            const retryDelay = Math.min(500 * Math.pow(2, retryCountRef.current), 5000);
            console.warn(`⏳ Will retry EventSource connection in ${retryDelay}ms (attempt ${retryCountRef.current + 1}/${maxRetriesRef.current + 1})`);
            
            setTimeout(() => {
              setForceRetry(prev => prev + 1); // Trigger the effect again
            }, retryDelay);
          } else {
            console.error(`❌ EventSource failed after ${maxRetriesRef.current + 1} attempts. Game may not update properly.`);
          }
        };
      } catch (error) {
        console.error('Failed to create EventSource:', error);
        logAuthKeyLoss(currentGameID, currentPlayerID, 'EventSource.creation');
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

  return null;
};

export default GameStateHandler;

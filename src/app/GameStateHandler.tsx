import { useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from './Hooks';
import {
  getGameInfo,
  receiveGameState,
  setGameStart,
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
import { useGetFriendsListQuery } from 'features/api/apiSlice';
import useAuth from 'hooks/useAuth';

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

  const { isLoggedIn } = useAuth();
  const { data: friendsData } = useGetFriendsListQuery(undefined, {
    skip: !isLoggedIn
  });

  const sourceRef = useRef<EventSource | null>(null);
  const gameParamsRef = useRef({ gameID: 0, playerID: 0, authKey: '' });
  const retryCountRef = useRef(0);
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

  // Sync friends list to sessionStorage whenever it's fetched
  useEffect(() => {
    if (friendsData?.friends) {
      try {
        const friendsList = friendsData.friends.map((f) => f.username);
        sessionStorage.setItem('friendsList', JSON.stringify(friendsList));
      } catch (e) {
        console.error('Failed to sync friendsList to sessionStorage:', e);
      }
    }
  }, [friendsData?.friends]);

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
        let friendsList: string[] = [];
        try {
          const stored = sessionStorage.getItem('friendsList');
          if (stored) {
            friendsList = JSON.parse(stored);
          }
        } catch {
          // Continue without friendsList
        }

        const resolvedUserName = getCurrentUsername(currentUserName) ?? '';
        const source = new EventSource(
          `${BACKEND_URL}GetUpdateSSE.php?gameName=${currentGameID}&playerID=${currentPlayerID}&authKey=${currentAuthKey}&friendsList=${encodeURIComponent(
            JSON.stringify(friendsList)
          )}&userName=${encodeURIComponent(resolvedUserName)}`
        );
        sourceRef.current = source;

        let hasConnected = false;

        source.onmessage = (event) => {
          hasConnected = true;
          retryCountRef.current = 0;

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
          try {
            const data = JSON.parse(event.data);
            if (typeof data.opponentIsTyping === 'boolean') {
              dispatch(setOpponentTyping(data.opponentIsTyping));
            }
          } catch {
          }
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
            toast.error(
              'Connection to game server lost. Please refresh the page.'
            );
          }
        };
      } catch (error) {
        console.error('Failed to create EventSource:', error);
      }
    }, 100);

    const handleBeforeUnload = () => {
      if (sourceRef.current) {
        sourceRef.current.close();
        sourceRef.current = null;
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      clearTimeout(connectionTimeout);
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

import React, { useEffect, useRef } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from './Hooks';
import { getGameInfo, nextTurn, setGameStart } from 'features/game/GameSlice';
import { useKnownSearchParams } from 'hooks/useKnownSearchParams';
import { GameLocationState } from 'interface/GameLocationState';
import { BACKEND_URL } from 'appConstants';
import { RootState } from './Store';

const GameStateHandler = () => {
  const { gameID } = useParams();
  const gameInfo = useAppSelector(getGameInfo);
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
      dispatch(
        setGameStart({
          gameID: currentGameID,
          playerID: currentPlayerID,
          authKey: currentAuthKey
        })
      );
      gameParamsRef.current = { gameID: currentGameID, playerID: currentPlayerID, authKey: currentAuthKey };
    }
  }, [gameID, gameName, playerID, authKey, gameInfo.authKey, locationState?.playerID, dispatch]);

  useEffect(() => {
    const currentGameID = gameParamsRef.current.gameID;
    const currentPlayerID = gameParamsRef.current.playerID;
    const currentAuthKey = gameParamsRef.current.authKey;

    // Don't create EventSource if authKey is empty for actual players (playerID 1 or 2)
    // Spectators (playerID 3) don't need authKey, but players do
    if ((currentPlayerID === 1 || currentPlayerID === 2) && !currentAuthKey) {
      // Wait for authKey to be available before connecting
      return;
    }

    // Close existing connection before creating new one
    if (sourceRef.current) {
      sourceRef.current.close();
    }

    const source = new EventSource(
      `${BACKEND_URL}GetUpdateSSE.php?gameName=${currentGameID}&playerID=${currentPlayerID}&authKey=${currentAuthKey}`
    );
    sourceRef.current = source;

    source.onmessage = () => {
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
      source.close();
    };

    return () => {
      source.close();
      sourceRef.current = null;
    };
  }, [gameParamsRef.current.gameID, gameParamsRef.current.playerID, gameParamsRef.current.authKey, dispatch, gameInfo.isPrivateLobby]);

  useEffect(() => {
    if (isFullRematch && gameID) {
      navigate(`/game/lobby/${gameID}`);
    }
  }, [isFullRematch, gameID, navigate]);

  return null;
};

export default GameStateHandler;

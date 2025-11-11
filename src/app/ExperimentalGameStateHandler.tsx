import React, { useEffect } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from './Hooks';
import { getGameInfo, nextTurn, setGameStart } from 'features/game/GameSlice';
import { shallowEqual } from 'react-redux';
import { useKnownSearchParams } from 'hooks/useKnownSearchParams';
import { GameLocationState } from 'interface/GameLocationState';
import { BACKEND_URL } from 'appConstants';
import { RootState } from './Store';

const ExperimentalGameStateHandler = () => {
  const { gameID } = useParams();
  const gameInfo = useAppSelector(getGameInfo, shallowEqual);
  const dispatch = useAppDispatch();
  const [{ gameName = '0', playerID = '3', authKey = '' }] =
    useKnownSearchParams();
  const location = useLocation();
  const locationState = location.state as GameLocationState | undefined;
  const isFullRematch = useAppSelector(
    (state: RootState) => state.game.isFullRematch
  );
  const navigate = useNavigate();

  useEffect(() => {
    // Determine the correct gameID and playerID
    const currentGameID = parseInt(gameID ?? gameName);
    const currentPlayerID = locationState?.playerID ?? parseInt(playerID);
    
    // For authKey priority:
    // 1. Use URL authKey parameter if provided (new game creation or direct link)
    // 2. Only fall back to stored gameInfo.authKey if no URL authKey (reconnection scenario)
    // This prevents stale authKeys from previous games being used
    const currentAuthKey = authKey || gameInfo.authKey;
    
    dispatch(
      setGameStart({
        gameID: currentGameID,
        playerID: currentPlayerID,
        authKey: currentAuthKey
      })
    );
    const source = new EventSource(
      `${BACKEND_URL}GetUpdateSSE.php?gameName=${currentGameID}&playerID=${currentPlayerID}&authKey=${currentAuthKey}`
    );
    source.onmessage = (e) => {
      //console.log('update data:', e.data);
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

    source.onerror = (error) => {
      //console.error('EventSource connection error:', error);
      source.close();
    };

    return () => {
      //console.log('closing eventstream');
      source.close();
    };
  }, [gameInfo.playerID, gameInfo.gameID, gameInfo.authKey, gameID, gameName, playerID, authKey, locationState?.playerID, dispatch]);

  useEffect(() => {
    isFullRematch ? navigate(`/game/lobby/${gameID}`) : null;
  }, [isFullRematch]);

  return null;
};

export default ExperimentalGameStateHandler;

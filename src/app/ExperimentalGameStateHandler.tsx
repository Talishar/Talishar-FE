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
    dispatch(
      setGameStart({
        gameID: parseInt(gameID ?? gameName),
        playerID: locationState?.playerID ?? parseInt(playerID),
        authKey: gameInfo.authKey || authKey
      })
    );
    const source = new EventSource(
      `${BACKEND_URL}GetUpdateSSE.php?gameName=${gameInfo.gameID}&playerID=${gameInfo.playerID}&authKey=${gameInfo.authKey}`
    );
    source.onmessage = (e) => {
      //console.log('update data:', e.data);
      dispatch(
        nextTurn({
          game: {
            gameID: gameInfo.gameID || parseInt(gameID ?? gameName),
            playerID:
              gameInfo.playerID ||
              (locationState?.playerID ?? parseInt(playerID)),
            authKey: gameInfo.authKey || authKey,
            isPrivate: gameInfo.isPrivate,
            isRoguelike: gameInfo.isRoguelike
          },
          signal: undefined,
          lastUpdate: 0
        })
      );
    };

    return () => {
      //console.log('closing eventstream');
      source.close();
    };
  }, [gameInfo.playerID, gameInfo.gameID, gameInfo.authKey]);

  useEffect(() => {
    isFullRematch ? navigate(`/game/lobby/${gameID}`) : null;
  }, [isFullRematch]);

  return null;
};

export default ExperimentalGameStateHandler;

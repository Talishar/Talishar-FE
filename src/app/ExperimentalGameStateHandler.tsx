import React, { useEffect } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from './Hooks';
import { getGameInfo, nextTurn, setGameStart } from 'features/game/GameSlice';
import { shallowEqual } from 'react-redux';
import { useKnownSearchParams } from 'hooks/useKnownSearchParams';
import { GameLocationState } from 'interface/GameLocationState';
import {
  API_URL_BETA,
  API_URL_DEV,
  API_URL_LIVE,
  GAME_LIMIT_BETA,
  GAME_LIMIT_LIVE
} from 'appConstants';
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

    let baseUrl = API_URL_DEV;
    if (gameInfo.gameID > GAME_LIMIT_BETA) {
      baseUrl = API_URL_BETA;
    }
    if (gameInfo.gameID > GAME_LIMIT_LIVE) {
      baseUrl = API_URL_LIVE;
    }
    console.log('setting up listener to domain', baseUrl);
    const source = new EventSource(
      `${baseUrl}GetUpdateSSE.php?gameName=${gameInfo.gameID}&playerID=${gameInfo.playerID}&authKey=${gameInfo.authKey}`
    );
    console.log(source);
    source.onmessage = (e) => {
      console.log('update data:', e.data);
      dispatch(
        nextTurn({
          game: {
            gameID: gameInfo.gameID || parseInt(gameID ?? gameName),
            playerID:
              gameInfo.playerID ||
              (locationState?.playerID ?? parseInt(playerID)),
            authKey: gameInfo.authKey || authKey,
            isPrivate: gameInfo.isPrivate
          },
          signal: undefined,
          lastUpdate: 0
        })
      );
    };

    return () => {
      console.log('closing eventstream');
      source.close();
    };
  }, [gameInfo.playerID, gameInfo.gameID, gameInfo.authKey]);

  useEffect(() => {
    isFullRematch ? navigate(`/game/lobby/${gameID}`) : null;
  }, [isFullRematch]);

  return null;
};

export default ExperimentalGameStateHandler;

import React, { useEffect } from 'react';
import { useLocation, useParams } from 'react-router-dom';
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

const ExperimentalGameStateHandler = () => {
  const { gameID } = useParams();
  const gameInfo = useAppSelector(getGameInfo, shallowEqual);
  const dispatch = useAppDispatch();
  const [{ gameName = '0', playerID = '3', authKey = '' }] =
    useKnownSearchParams();
  const location = useLocation();
  const locationState = location.state as GameLocationState | undefined;

  let baseUrl = API_URL_DEV;
  if (parseInt(gameID ?? '') > GAME_LIMIT_BETA) {
    baseUrl = API_URL_BETA;
  }
  if (parseInt(gameID ?? '') > GAME_LIMIT_LIVE) {
    baseUrl = API_URL_LIVE;
  }

  useEffect(() => {
    dispatch(
      setGameStart({
        gameID: parseInt(gameID ?? gameName),
        playerID: locationState?.playerID ?? parseInt(playerID),
        authKey: gameInfo.authKey || authKey
      })
    );
    console.log('setting up listener to url', baseUrl);
    const source = new EventSource(
      `${baseUrl}GetUpdateSSE.php?gameName=${gameID}&playerID=${gameInfo.playerID}&authKey=${gameInfo.authKey}`
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

  return null;
};

export default ExperimentalGameStateHandler;

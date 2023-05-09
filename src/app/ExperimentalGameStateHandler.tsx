import React, { useEffect } from 'react';
import { useCookies } from 'react-cookie';
import { useLocation, useParams } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from './Hooks';
import { getGameInfo, nextTurn, setGameStart } from 'features/game/GameSlice';
import { shallowEqual } from 'react-redux';
import { useKnownSearchParams } from 'hooks/useKnownSearchParams';
import { GameLocationState } from 'interface/GameLocationState';

const ExperimentalGameStateHandler = () => {
  const [cookies] = useCookies(['experimental']);
  const { gameID } = useParams();
  const gameInfo = useAppSelector(getGameInfo, shallowEqual);
  const dispatch = useAppDispatch();
  const [{ gameName = '0', playerID = '3', authKey = '' }] =
    useKnownSearchParams();
  const location = useLocation();
  const locationState = location.state as GameLocationState | undefined;

  useEffect(() => {
    dispatch(
      setGameStart({
        gameID: parseInt(gameID ?? gameName),
        playerID: locationState?.playerID ?? parseInt(playerID),
        authKey: gameInfo.authKey || authKey
      })
    );
    console.log('setting up listener');
    const source = new EventSource(
      `https://api.talishar.net/game/GetUpdateSSE.php?gameName=${gameID}&playerID=${gameInfo.playerID}&authKey=${gameInfo.authKey}`
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
  }, []);

  return null;
};

export default ExperimentalGameStateHandler;

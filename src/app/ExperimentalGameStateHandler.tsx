import React, { useEffect } from 'react';
import { useCookies } from 'react-cookie';
import { useParams } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from './Hooks';
import { getGameInfo, nextTurn } from 'features/game/GameSlice';
import { shallowEqual } from 'react-redux';

const ExperimentalGameStateHandler = () => {
  const [cookies] = useCookies(['experimental']);
  const { gameID } = useParams();
  const gameInfo = useAppSelector(getGameInfo, shallowEqual);
  const dispatch = useAppDispatch();

  useEffect(() => {
    console.log('setting up listener');
    const source = new EventSource(
      `https://api.talishar.net/game/GetUpdateSSE.php?gameName=${gameID}&playerID=${gameInfo.playerID}&authKey=${gameInfo.authKey}`
    );
    console.log(source);
    source.onmessage = (e) => {
      console.log('update data:', e.data);
      dispatch(
        nextTurn({
          game: gameInfo,
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

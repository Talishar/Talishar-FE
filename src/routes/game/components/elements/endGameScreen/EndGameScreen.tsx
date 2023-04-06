import React, { useState } from 'react';
import { useAppSelector } from 'app/Hooks';
import styles from './EndGameScreen.module.css';
import { useGetPopUpContentQuery } from 'features/api/apiSlice';
import { END_GAME_STATS } from 'appConstants';
import { getGameInfo } from 'features/game/GameSlice';
import EndGameStats, { EndGameData } from '../endGameStats/EndGameStats';
import { shallowEqual } from 'react-redux';
import useShowModal from 'hooks/useShowModals';

const EndGameScreen = () => {
  const gameInfo = useAppSelector(getGameInfo, shallowEqual);
  const [playerID, setPlayerID] = useState(gameInfo.playerID === 2 ? 2 : 1);
  const { data, isLoading, error } = useGetPopUpContentQuery({
    gameID: gameInfo.gameID,
    playerID: playerID,
    authKey: gameInfo.authKey,
    popupType: END_GAME_STATS
  });
  const showModal = useShowModal();

  if (!showModal) return null;

  let content;

  if (isLoading) {
    content = <div>Loading...</div>;
  } else if (error) {
    content = <div>{JSON.stringify(error)}</div>;
  } else {
    content = <EndGameStats {...(data as EndGameData)} />;
  }

  const switchPlayer = () => {
    playerID === 2 ? setPlayerID(1) : setPlayerID(2);
  };

  return (
    <div className={styles.cardListBox}>
      <div className={styles.cardListTitleContainer}>
        <div className={styles.cardListTitle}>
          <h3 className={styles.title}>{'Game Over Summary'}</h3>
          <div className={styles.buttonDiv} onClick={switchPlayer}>
            Switch player stats
          </div>
        </div>
      </div>
      {content}
    </div>
  );
};

export default EndGameScreen;

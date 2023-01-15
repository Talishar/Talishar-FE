import React, { useState } from 'react';
import { useAppDispatch, useAppSelector } from '../../../app/Hooks';
import { RootState } from '../../../app/Store';
import { FaTimes } from 'react-icons/fa';
import styles from './EndGameScreen.module.css';
import { useGetPopUpContentQuery } from '../../../features/api/apiSlice';
import GameInfo from '../../../features/GameInfo';
import CardTextLink from '../cardTextLink/CardTextLink';
import { Effect } from '../effects/Effects';
import { Card } from '../../../features/Card';
import { END_GAME_STATS } from '../../../constants';
import { hideActiveLayer } from '../../../features/game/GameSlice';
import EndGameStats, { EndGameData } from '../endGameStats/EndGameStats';
import EndGameMenuOptions from '../endGameMenuOptions/EndGameMenuOptions';

const EndGameScreen = () => {
  const gameInfo = useAppSelector((state: RootState) => state.game.gameInfo);
  const [playerID, setPlayerID] = useState(gameInfo.playerID === 2 ? 2 : 1);
  const { data, isLoading, error } = useGetPopUpContentQuery({
    gameID: gameInfo.gameID,
    playerID: playerID,
    authKey: gameInfo.authKey,
    popupType: END_GAME_STATS
  });
  const dispatch = useAppDispatch();

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
    <div className={styles.emptyOutside} onClick={() => console.log('clickus')}>
      <div className={styles.cardListBox} onClick={(e) => e.stopPropagation()}>
        <div className={styles.cardListTitleContainer}>
          <div className={styles.cardListTitle}>
            <h3 className={styles.title}>{'Game Over Summary'}</h3>
            <div className={styles.buttonDiv} onClick={switchPlayer}>
              Switch player stats
            </div>
          </div>
          <div
            className={styles.cardListCloseIcon}
            onClick={() => console.log('clickus')}
          >
            <FaTimes title="close dialog" />
          </div>
        </div>
        {content}
      </div>
    </div>
  );
};

export default EndGameScreen;

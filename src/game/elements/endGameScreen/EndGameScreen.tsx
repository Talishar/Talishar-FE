import React from 'react';
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

const EndGameScreen = () => {
  const gameInfo = useAppSelector((state: RootState) => state.game.gameInfo);
  const { data, isLoading, error } = useGetPopUpContentQuery({
    gameID: gameInfo.gameID,
    playerID: gameInfo.playerID,
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
    content = (
      <div className={styles.cardListContents}>
        <div>This is where the end game stats would be if I had any.</div>
      </div>
    );
  }

  return (
    <div className={styles.emptyOutside} onClick={() => console.log('clickus')}>
      <div className={styles.cardListBox} onClick={(e) => e.stopPropagation()}>
        <div className={styles.cardListTitleContainer}>
          <div className={styles.cardListTitle}>
            <h3 className={styles.title}>{'Game Over Summary'}</h3>
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

import React, { useState } from 'react';
import { useAppSelector } from 'app/Hooks';
import styles from './EndGameScreen.module.css';
import { useGetPopUpContentQuery } from 'features/api/apiSlice';
import { END_GAME_STATS } from 'appConstants';
import { getGameInfo } from 'features/game/GameSlice';
import EndGameStats, { EndGameData } from '../endGameStats/EndGameStats';
import { shallowEqual } from 'react-redux';
import useShowModal from 'hooks/useShowModals';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import classNames from 'classnames';
import useAuth from 'hooks/useAuth';
import { sanitizeHtml } from 'utils/sanitizeHtml';

const EndGameScreen = () => {
  const gameInfo = useAppSelector(getGameInfo, shallowEqual);
  const [playerID, setPlayerID] = useState(gameInfo.playerID === 2 ? 2 : 1);
  const [showStats, setShowStats] = useState(true);
  const [showFullLog, setShowFullLog] = useState(false);
  const { isPatron } = useAuth();
  const { data, isLoading, error } = useGetPopUpContentQuery({
    gameID: gameInfo.gameID,
    playerID: playerID,
    authKey: gameInfo.authKey,
    popupType: END_GAME_STATS
  });
  const showModal = useShowModal();
  const cardListBoxClasses = classNames(styles.cardListBox, {
    [styles.reduced]: !showStats
  });
  const fullLogClasses = classNames(styles.fullLog, {});

  if (!showModal) return null;

  let content;

  if (isLoading) {
    content = <div>Loading...</div>;
  } else if (error) {
    content = <div>{JSON.stringify(error)}</div>;
  } else if (showFullLog) {
    if (isPatron) {
      content = (
        <div
          className={fullLogClasses}
          dangerouslySetInnerHTML={{ __html: sanitizeHtml(data.fullLog) }}
        />
      );
    } else {
      content = (
        <div>
          Support our{' '}
          <a href="https://linktr.ee/Talishar" target="_blank">
            patreon
          </a>{' '}
          to access this feature.
        </div>
      );
    }
  } else {
    content = <EndGameStats {...(data as EndGameData)} />;
  }

  const switchPlayer = () => {
    playerID === 2 ? setPlayerID(1) : setPlayerID(2);
  };

  const toggleShowStats = () => {
    setShowStats(!showStats);
  };

  const toggleShowFullLog = () => {
    setShowFullLog(!showFullLog);
  };

  return (
    <div className={cardListBoxClasses}>
      <div className={styles.cardListTitleContainer}>
        <div className={styles.cardListTitle}>
          <h3 className={styles.title}>{'Game Over Summary'}</h3>
          <div className={styles.buttonGroup}>
            <div className={styles.buttonDiv} onClick={toggleShowFullLog}>
              Full Game Log
            </div>
            <div className={styles.buttonDiv} onClick={switchPlayer}>
              Switch player stats
            </div>
            <div className={styles.buttonDiv} onClick={toggleShowStats}>
              {showStats ? (
                <FaEye aria-hidden="true" fontSize={'2em'} />
              ) : (
                <FaEyeSlash aria-hidden="true" fontSize={'2em'} />
              )}
            </div>
          </div>
        </div>
      </div>
      {showStats && content}
    </div>
  );
};

export default EndGameScreen;

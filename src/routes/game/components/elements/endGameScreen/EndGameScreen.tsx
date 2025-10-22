import React, { useState } from 'react';
import { useAppSelector, useAppDispatch } from 'app/Hooks';
import styles from './EndGameScreen.module.css';
import menuStyles from '../menu/Menu.module.css';
import { useGetPopUpContentQuery } from 'features/api/apiSlice';
import { END_GAME_STATS } from 'appConstants';
import { getGameInfo, toggleShowModals } from 'features/game/GameSlice';
import EndGameStats, { EndGameData } from '../endGameStats/EndGameStats';
import { shallowEqual } from 'react-redux';
import useShowModal from 'hooks/useShowModals';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import classNames from 'classnames';
import useAuth from 'hooks/useAuth';

const EndGameScreen = () => {
  const gameInfo = useAppSelector(getGameInfo, shallowEqual);
  const dispatch = useAppDispatch();
  const [playerID, setPlayerID] = useState(gameInfo.playerID === 2 ? 2 : 1);
  const [showFullLog, setShowFullLog] = useState(false);
  const { isPatron } = useAuth();
  const showModal = useShowModal();
  const { data, isLoading, error } = useGetPopUpContentQuery({
    gameID: gameInfo.gameID,
    playerID: playerID,
    authKey: gameInfo.authKey,
    popupType: END_GAME_STATS
  });
  const cardListBoxClasses = classNames(styles.cardListBox, {
    [styles.reduced]: !showModal
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
          dangerouslySetInnerHTML={{ __html: data.fullLog }}
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

  const handleClickHideWindowsToggle = (
    e: React.MouseEvent<HTMLDivElement>
  ) => {
    e.preventDefault();
    dispatch(toggleShowModals());
  };

  const toggleShowFullLog = () => {
    setShowFullLog(!showFullLog);
  };

  return (
    <div className={cardListBoxClasses}>
      {showModal && (
        <>
          <div className={styles.cardListTitleContainer}>
            <div className={styles.cardListTitle}>
              <h2 className={styles.title}>Game Over Summary</h2>
              <div className={styles.buttonGroup}>
                <div className={styles.buttonDiv} onClick={toggleShowFullLog}>
                  Full Game Log
                </div>
                <div className={styles.buttonDiv} onClick={switchPlayer}>
                  Switch player stats
                </div>
                <div
                  className={styles.buttonDiv}
                  onClick={handleClickHideWindowsToggle}
                  aria-label="Hide End Game Stats"
                  data-placement="bottom"
                >
                  {showModal && <FaEye aria-hidden="true" fontSize={'1.5em'} />}
                  {!showModal && <FaEyeSlash aria-hidden="true" fontSize={'1.5em'} />}
                </div>
              </div>
            </div>
          </div>
          {content}
        </>
      )}
    </div>
  );
};

export default EndGameScreen;

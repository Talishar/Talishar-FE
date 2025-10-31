import React, { useState, useRef } from 'react';
import { useAppSelector } from 'app/Hooks';
import styles from './EndGameScreen.module.css';
import { useGetPopUpContentQuery } from 'features/api/apiSlice';
import { END_GAME_STATS } from 'appConstants';
import { getGameInfo } from 'features/game/GameSlice';
import EndGameStats, { EndGameData, EndGameStatsRef } from '../endGameStats/EndGameStats';
import { shallowEqual } from 'react-redux';
import useShowModal from 'hooks/useShowModals';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import classNames from 'classnames';
import useAuth from 'hooks/useAuth';
import { PiFileCsvFill, PiCameraFill } from "react-icons/pi";

const EndGameScreen = () => {
  const gameInfo = useAppSelector(getGameInfo, shallowEqual);
  const gameState = useAppSelector((state: any) => state.game, shallowEqual);
  const [playerID, setPlayerID] = useState(gameInfo.playerID === 2 ? 2 : 1);
  const [showStats, setShowStats] = useState(true);
  const [showFullLog, setShowFullLog] = useState(false);
  const [bothPlayersData, setBothPlayersData] = useState<{ [key: number]: any }>({});
  const { isPatron } = useAuth();
  const endGameStatsRef = useRef<EndGameStatsRef>(null);
  const { data, isLoading, error } = useGetPopUpContentQuery({
    gameID: gameInfo.gameID,
    playerID: playerID,
    authKey: gameInfo.authKey,
    popupType: END_GAME_STATS
  });
  
  // Cache both players' data as they're loaded
  React.useEffect(() => {
    if (data && playerID) {
      setBothPlayersData(prev => ({
        ...prev,
        [playerID]: data
      }));
    }
  }, [data, playerID]);
  const showModal = useShowModal();
  const cardListBoxClasses = classNames(styles.cardListBox, {
    [styles.reduced]: !showStats
  });
  const fullLogClasses = classNames(styles.fullLog, {});

  // Extract heroes - use gameState as primary source since it's always correct for the viewing player
  // gameState contains the actual player heroes regardless of turn order
  const yourHero = (playerID === 1 ? gameState?.playerOne?.Hero?.cardNumber : gameState?.playerTwo?.Hero?.cardNumber) || null;
  
  // For opponent hero: get from gameState for the opponent player
  const opponentPlayerID = playerID === 1 ? 2 : 1;
  const opponentHero = (opponentPlayerID === 1 ? gameState?.playerOne?.Hero?.cardNumber : gameState?.playerTwo?.Hero?.cardNumber) || null;

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
    const endGameDataWithHeroes: EndGameData = {
      ...(data as EndGameData),
      yourHero: yourHero,
      opponentHero: opponentHero,
      playerID: playerID,
      authKey: gameInfo.authKey,
      gameID: gameInfo.gameID?.toString(),
      bothPlayersData: bothPlayersData
    };
    content = (
      <EndGameStats 
        ref={endGameStatsRef} 
        {...endGameDataWithHeroes}
      />
    );
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

  const handleExportStats = () => {
    if (!endGameStatsRef.current) {
      console.error('Export ref not available');
      return;
    }
    endGameStatsRef.current.exportScreenshot();
  };

  const handleExportCSV = async () => {
    if (!endGameStatsRef.current) {
      console.error('Export CSV ref not available');
      return;
    }
    await endGameStatsRef.current.exportCSV();
  };

  return (
    <div className={cardListBoxClasses}>
      {showStats && (
        <>
          <div className={styles.cardListTitleContainer}>
            <div className={styles.cardListTitle}>
              <h2 className={styles.title}>Game Over Summary</h2>
              <div className={styles.buttonGroup}>
                {!showFullLog && (
                  <>
                    <div className={styles.buttonDiv} onClick={handleExportStats}>
                      <PiCameraFill size="1.5em" />&nbsp;Export as Image
                    </div>
                    <div className={styles.buttonDiv} onClick={handleExportCSV}>
                      <PiFileCsvFill size="1.5em" />&nbsp;Export as CSV
                    </div>
                  </>
                )}
                <div className={styles.buttonDiv} onClick={toggleShowFullLog}>
                  Full Game Log
                </div>
                <div className={styles.buttonDiv} onClick={switchPlayer}>
                  Switch player stats
                </div>
                <div className={styles.buttonDiv} onClick={toggleShowStats}>
                  <FaEye aria-hidden="true" fontSize={'1.5em'} />
                </div>
              </div>
            </div>
          </div>
          {content}
        </>
      )}
      {!showStats && (
        <div className={styles.cardListTitleContainer}>
          <div className={styles.cardListTitle}>
            <h2 className={styles.title}>Game Over Summary</h2>
            <div className={styles.buttonGroup}>
              <div className={styles.buttonDiv} onClick={toggleShowStats}>
                <FaEyeSlash aria-hidden="true" fontSize={'1.5em'} />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EndGameScreen;

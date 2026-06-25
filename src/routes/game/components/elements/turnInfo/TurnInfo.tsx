import React, { useEffect, useState } from 'react';
import { useAppSelector } from 'app/Hooks';
import { RootState } from 'app/Store';
import styles from './TurnInfo.module.css';
import { FaRegClock } from 'react-icons/fa';
import useSetting from 'hooks/useSetting';
import { IS_STREAMER_MODE } from 'features/options/constants';

const getGameIdFromUrl = () => {
  const url = window.location.href;
  const gameId = url.split('/').pop();
  return gameId;
};

const STORAGE_KEY_PREFIX = 'game-timer-';

export default function TurnInfo() {
  const gameId = getGameIdFromUrl();
  const storageKey = `${STORAGE_KEY_PREFIX}${gameId}`;

  // Timer state
  const initialTimer = localStorage.getItem(storageKey)
    ? parseInt(localStorage.getItem(storageKey)!)
    : 0;
  const [timer, setTimer] = useState(initialTimer);

  useEffect(() => {
    const intervalId = setInterval(() => {
      setTimer((prevTimer) => {
        const newTimer = prevTimer + 1;
        localStorage.setItem(storageKey, newTimer.toString());
        return newTimer;
      });
    }, 1000);

    return () => {
      clearInterval(intervalId);
    };
  }, [storageKey]);

  // Turn and player info
  let turnNumber = useAppSelector(
    (state: RootState) => state.game.gameDynamicInfo.turnNo
  );

  if (turnNumber === undefined) {
    turnNumber = 0;
  }

  const turnPlayer = useAppSelector(
    (state: RootState) => state.game.turnPlayer
  );

  const amIPlayerOne = useAppSelector((state: RootState) => {
    return state.game.gameInfo.playerID === 1;
  });

  const playerName = useAppSelector((state: RootState) =>
    (turnPlayer == 1 && amIPlayerOne) || (turnPlayer == 2 && !amIPlayerOne)
      ? state.game.playerOne.Name
      : state.game.playerTwo.Name
  );

  const isStreamerMode =
    String(useSetting({ settingName: IS_STREAMER_MODE })?.value) === '1';
  const isOpponentTurn =
    (turnPlayer == 1 && !amIPlayerOne) || (turnPlayer == 2 && amIPlayerOne);
  const displayName =
    isStreamerMode && isOpponentTurn
      ? 'Opponent'
      : String(playerName ?? 'Unknown').substring(0, 15);

  function fancyTimeFormat(duration: number | undefined) {
    duration = duration ?? 0;
    const hrs = ~~(duration / 3600);
    const mins = ~~((duration % 3600) / 60);
    const secs = ~~duration % 60;

    let ret = '';

    if (hrs > 0) {
      ret += '' + hrs + ':' + (mins < 10 ? '0' : '');
    }

    ret += '' + mins + ':' + (secs < 10 ? '0' : '');
    ret += '' + secs;

    return ret;
  }

  return (
    <div className={styles.turnInfoContainer}>
      <div className={styles.topRow}>
        <div className={styles.turnNumberSmall}>Turn #{turnNumber}</div>
        <div className={styles.timer}>
          <FaRegClock /> {fancyTimeFormat(timer)}
        </div>
      </div>
      <div className={styles.playerName}>{displayName}'s Turn</div>
    </div>
  );
}

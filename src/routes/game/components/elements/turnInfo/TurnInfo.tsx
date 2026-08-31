import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAppSelector } from 'app/Hooks';
import { RootState } from 'app/Store';
import styles from './TurnInfo.module.css';
import { FaRegClock } from 'react-icons/fa';
import useSetting from 'hooks/useSetting';
import { IS_STREAMER_MODE } from 'features/options/constants';

const getGameIdFromUrl = () => window.location.href.split('/').pop();

const STORAGE_KEY_PREFIX = 'game-timer-';
const PERSIST_EVERY_SECONDS = 5;

function fancyTimeFormat(duration: number | undefined): string {
  duration = duration ?? 0;
  const hrs = ~~(duration / 3600);
  const mins = ~~((duration % 3600) / 60);
  const secs = ~~duration % 60;
  let ret = '';
  if (hrs > 0) ret += '' + hrs + ':' + (mins < 10 ? '0' : '');
  ret += '' + mins + ':' + (secs < 10 ? '0' : '');
  ret += '' + secs;
  return ret;
}

const GameTimer = () => {
  // Stable for the component's lifetime - URL doesn't change during a game.
  const storageKeyRef = useRef(`${STORAGE_KEY_PREFIX}${getGameIdFromUrl()}`);

  const [timer, setTimer] = useState(() => {
    const stored = localStorage.getItem(storageKeyRef.current);
    return stored ? parseInt(stored, 10) : 0;
  });

  const latestTimerRef = useRef(timer);
  latestTimerRef.current = timer;

  useEffect(() => {
    const key = storageKeyRef.current;
    const flush = () =>
      localStorage.setItem(key, String(latestTimerRef.current));

    const intervalId = setInterval(() => {
      setTimer((prevTimer) => prevTimer + 1);
    }, 1000);
    const persistId = setInterval(flush, PERSIST_EVERY_SECONDS * 1000);

    const onVisibilityChange = () => {
      if (document.visibilityState === 'hidden') flush();
    };
    document.addEventListener('visibilitychange', onVisibilityChange);
    window.addEventListener('pagehide', flush);

    return () => {
      clearInterval(intervalId);
      clearInterval(persistId);
      document.removeEventListener('visibilitychange', onVisibilityChange);
      window.removeEventListener('pagehide', flush);
      flush();
    };
  }, []); // storageKey is stable for the component's lifetime

  return (
    <div className={styles.timer}>
      <FaRegClock /> {fancyTimeFormat(timer)}
    </div>
  );
};

export default function TurnInfo() {
  const { t } = useTranslation();

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
      ? t('TURN_INFO.OPPONENT')
      : String(playerName ?? t('TURN_INFO.UNKNOWN')).substring(0, 15);

  return (
    <div className={styles.turnInfoContainer}>
      <div className={styles.topRow}>
        <div className={styles.turnNumberSmall}>
          {t('TURN_INFO.TURN_NUMBER', { turnNumber })}
        </div>
        <GameTimer />
      </div>
      <div className={styles.playerName}>
        {t('TURN_INFO.PLAYERS_TURN', { playerName: displayName })}
      </div>
    </div>
  );
}

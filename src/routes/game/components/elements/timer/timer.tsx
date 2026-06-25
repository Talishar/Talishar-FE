import React, { useEffect, useRef, useState } from 'react';
import { useAppSelector } from 'app/Hooks';
import { RootState } from 'app/Store';
import styles from './timer.module.css';
import { FaRegClock } from 'react-icons/fa';

const getGameIdFromUrl = () => {
  const url = window.location.href;
  const gameId = url.split('/').pop();
  return gameId;
};

const STORAGE_KEY_PREFIX = 'game-timer-';

function fancyTimeFormat(duration: number | undefined): string {
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

// Clean up old timer cookies and migrate to sessionStorage
//TODO: Delete this once cookies are cleaned up
const cleanupOldCookies = () => {
  // Get all cookies and remove timer-* ones
  const cookies = document.cookie.split(';');
  cookies.forEach((cookie) => {
    const cookieName = cookie.split('=')[0].trim();
    if (cookieName.startsWith('timer-')) {
      // Clear the cookie by setting it with an expired date
      document.cookie = `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
    }
  });
};

export default function Timer() {
  // Stable across the component's lifetime — the URL doesn't change during a game.
  const storageKeyRef = useRef(`${STORAGE_KEY_PREFIX}${getGameIdFromUrl()}`);

  const [timer, setTimer] = useState(() => {
    const stored = localStorage.getItem(storageKeyRef.current);
    return stored ? parseInt(stored, 10) : 0;
  });

  // Clean up old cookies on mount
  useEffect(() => {
    cleanupOldCookies();
  }, []);

  useEffect(() => {
    const key = storageKeyRef.current;
    const intervalId = setInterval(() => {
      setTimer((prevTimer) => {
        const newTimer = prevTimer + 1;
        localStorage.setItem(key, newTimer.toString());
        return newTimer;
      });
    }, 1000);
    return () => clearInterval(intervalId);
  }, []); // storageKey is stable for the component's lifetime

  return (
    <div className={styles.timerStyle}>
      <div>
        <FaRegClock /> {fancyTimeFormat(timer)}
      </div>
    </div>
  );
}

import React, { useEffect, useState } from 'react';
import { useAppSelector } from 'app/Hooks';
import { RootState } from 'app/Store';
import styles from './timer.module.css';
import { FaRegClock } from "react-icons/fa";

const getGameIdFromUrl = () => {
  const url = window.location.href;
  const gameId = url.split('/').pop();
  return gameId;
};

const STORAGE_KEY_PREFIX = 'game-timer-';

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
  const gameId = getGameIdFromUrl();
  const storageKey = `${STORAGE_KEY_PREFIX}${gameId}`;
  
  // Initialize from localStorage (persists across browser sessions)
  const initialTimer = localStorage.getItem(storageKey) 
    ? parseInt(localStorage.getItem(storageKey)!) 
    : 0;
  const [timer, setTimer] = useState(initialTimer);

  // Clean up old cookies on mount
  useEffect(() => {
    cleanupOldCookies();
  }, []);

  useEffect(() => {
    const intervalId = setInterval(() => {
      setTimer((prevTimer) => {
        const newTimer = prevTimer + 1;
        localStorage.setItem(storageKey, newTimer.toString());
        return newTimer;
      });
    }, 1000); // update every 1 second

    return () => {
      clearInterval(intervalId);
    };
  }, [storageKey]);

  function fancyTimeFormat(duration: number | undefined) {
    duration = duration ?? 0;
    // Hours, minutes and seconds
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
    <div className={styles.timerStyle}>
      <div><FaRegClock /> {fancyTimeFormat(timer)}</div>
    </div>
  );
}
import React, { useEffect, useState } from 'react';
import { useAppSelector } from 'app/Hooks';
import { RootState } from 'app/Store';
import styles from './timer.module.css';
import { FaRegClock } from "react-icons/fa";
import { useCookies } from 'react-cookie';

const getGameIdFromUrl = () => {
  const url = window.location.href;
  const gameId = url.split('/').pop();
  return gameId;
};

export default function Timer() {
  const gameId = getGameIdFromUrl();
  const cookieName = `timer-${gameId}`;
  const [cookies, setCookie, removeCookie] = useCookies([cookieName]);
  const initialTimer = cookies[cookieName] ? parseInt(cookies[cookieName]) : 0;
  const [timer, setTimer] = useState(initialTimer);

  useEffect(() => {
    const intervalId = setInterval(() => {
      setTimer(timer + 1);
      setCookie(cookieName, timer + 1, { path: '/' });
    }, 1000); // update every 1 second

    return () => {
      clearInterval(intervalId);
    };
  }, [timer]);

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
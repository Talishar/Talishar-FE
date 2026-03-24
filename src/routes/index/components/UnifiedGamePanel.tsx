import React, { useState, useEffect } from 'react';
import { FaChevronUp, FaChevronDown } from 'react-icons/fa';
import useAuth from 'hooks/useAuth';
import { useGetUserProfileQuery } from 'features/api/apiSlice';
import { AdUnit } from 'components/ads';
import QuickJoinPanel from './quickJoin/QuickJoinPanel';
import CreateGame from 'routes/game/create/CreateGame';
import styles from './UnifiedGamePanel.module.css';

const getCookie = (name: string): string | null => {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop()?.split(';').shift() || null;
  return null;
};

const setCookie = (name: string, value: string, days: number = 365) => {
  const expires = new Date();
  expires.setTime(expires.getTime() + days * 24 * 60 * 60 * 1000);
  document.cookie = `${name}=${value}; expires=${expires.toUTCString()}; path=/`;
};

const UnifiedGamePanel = () => {
  const { isLoggedIn, isLoading: isAuthLoading } = useAuth();
  const { data: profileData, isLoading: isProfileLoading } = useGetUserProfileQuery(
    undefined,
    { skip: !isLoggedIn }
  );
  const isSupporter = isLoggedIn
    ? (isProfileLoading ? true : (profileData?.isMetafySupporter ?? false))
    : false;
  const showAds = !isAuthLoading && !isSupporter;
  const [isExpanded, setIsExpanded] = useState(() => {
    const savedState = getCookie('unifiedGamePanelExpanded');
    return savedState !== 'false';
  });

  useEffect(() => {
    setCookie('unifiedGamePanelExpanded', String(isExpanded));
  }, [isExpanded]);

  if (isAuthLoading) {
    return null;
  }

  if (!isLoggedIn) {
    // Non-logged-in users only see Create Game (deck selector not shown anyway)
    return <CreateGame />;
  }

  return (
    <section className={styles.panel} aria-label="Game Setup">
      <div className={styles.header}>
        <h3 className={styles.title}>Quick Join / Create Game</h3>
        <button
          type="button"
          className={styles.toggleButton}
          onClick={() => setIsExpanded(!isExpanded)}
          aria-expanded={isExpanded}
          aria-label={isExpanded ? 'Minimize panel' : 'Expand panel'}
        >
          {isExpanded ? <FaChevronUp size={16} /> : <FaChevronDown size={16} />}
        </button>
      </div>

      {isExpanded && (
        <div className={styles.content}>
          <QuickJoinPanel embedded />
          <hr className={styles.divider} />
          <CreateGame />
        </div>
      )}
      {showAds && (
        <div className={styles.createGameAd}>
          <AdUnit placement="right-rail-1" />
        </div>
      )}
    </section>
  );
};

export default UnifiedGamePanel;

import React, { useState, useEffect } from 'react';
import { FaChevronUp, FaChevronDown } from 'react-icons/fa';
import useAuth from 'hooks/useAuth';
import useSupporterStatus from 'hooks/useSupporterStatus';
import { AdUnit } from 'components/ads';
import RustCounterPanel from 'components/RustCounterPanel';
import QuickJoinPanel from './quickJoin/QuickJoinPanel';
import CreateGame from 'routes/game/create/CreateGame';
import styles from './UnifiedGamePanel.module.css';
import { useTranslation } from 'react-i18next';
import useRustCounters from 'hooks/useRustCounters';
import { useClearRustCountersMutation } from 'features/api/apiSlice';

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
  const { isLoggedIn } = useAuth();
  const { canViewRustCounters, rustCounters } = useRustCounters();
  const { isSupporter, isLoading: isAuthLoading } = useSupporterStatus();
  const [clearRustCounters] = useClearRustCountersMutation();
  const showAds = !isAuthLoading && !isSupporter;
  useEffect(() => {
    if (!canViewRustCounters) return;
    (window as any)._talishar_onRewardedAdGranted = () => {
      clearRustCounters();
    };
    return () => {
      delete (window as any)._talishar_onRewardedAdGranted;
    };
  }, [canViewRustCounters, clearRustCounters]);
  const [isExpanded, setIsExpanded] = useState(() => {
    const savedState = getCookie('unifiedGamePanelExpanded');
    return savedState !== 'false';
  });
  // Initial stuff to allow the lang to change
  const { t, i18n, ready } = useTranslation();
  
  useEffect(() => {
    setCookie('unifiedGamePanelExpanded', String(isExpanded));
  }, [isExpanded]);

  if (isAuthLoading) {
    return null;
  }

  if (!isLoggedIn) {
    return (
      <section className={styles.panel} aria-label={t('MENU.CREATE_GAME.TITLE')}>
        <div className={styles.header}>
          <h3 className={styles.title}>{t('MENU.CREATE_GAME.TITLE')}</h3>
          <button
            type="button"
            className={styles.toggleButton}
            onClick={() => setIsExpanded(!isExpanded)}
            aria-expanded={isExpanded}
            aria-label={isExpanded ? t('UNITED_GAME_PANEL.MINIMIZE') : t('UNITED_GAME_PANEL.EXPAND')}
          >
            {isExpanded ? <FaChevronUp size={16} /> : <FaChevronDown size={16} />}
          </button>
        </div>

        {isExpanded && (
          <div className={styles.content}>
            <div className={styles.createGameSection}>
              <CreateGame inUnifiedPanel />
            </div>
          </div>
        )}
      </section>
    );
  }

  return (
    <section className={styles.panel} aria-label={t("UNITED_GAME_PANEL.GAME_SETUP")}>
      <div className={styles.header}>
        <h3 className={styles.title}>{t("UNITED_GAME_PANEL.JOIN_CREATE")}</h3>
        <button
          type="button"
          className={styles.toggleButton}
          onClick={() => setIsExpanded(!isExpanded)}
          aria-expanded={isExpanded}
          aria-label={isExpanded ? t("UNITED_GAME_PANEL.MINIMIZE") : t("UNITED_GAME_PANEL.EXPAND")}
        >
          {isExpanded ? <FaChevronUp size={16} /> : <FaChevronDown size={16} />}
        </button>
      </div>

      {isExpanded && (
        <div className={styles.content}>
          {canViewRustCounters && (
            <RustCounterPanel
              rustCounters={rustCounters}
              isSupporter={isSupporter}
              onAdUnavailable={() => clearRustCounters()}
            />
          )}
          <div className={styles.quickJoinSection}>
            <QuickJoinPanel embedded />
          </div>
          <hr className={styles.divider} />
          <div className={styles.createGameSection}>
            <CreateGame />
          </div>
        </div>
      )}
    </section>
  );
};

export default UnifiedGamePanel;

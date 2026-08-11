import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAppSelector } from 'app/Hooks';
import { getGameInfo } from 'features/game/GameSlice';
import { selectCurrentUserName } from 'features/auth/authSlice';
import styles from './SpectatorLoginRequired.module.css';

const DEFAULT_DELAY_MS = 3000;

interface SpectatorLoginRequiredProps {
  delayMs?: number;
}

const SpectatorLoginRequired = ({
  delayMs = DEFAULT_DELAY_MS
}: SpectatorLoginRequiredProps) => {
  const { t } = useTranslation();
  const gameInfo = useAppSelector(getGameInfo);
  const currentUserName = useAppSelector(selectCurrentUserName);

  const isSpectator = gameInfo.playerID === 3;
  const shouldWarn = isSpectator && !currentUserName;
  const [graceElapsed, setGraceElapsed] = useState(false);

  useEffect(() => {
    if (!shouldWarn) {
      // Reset so a later logout starts a fresh grace period.
      setGraceElapsed(false);
      return;
    }

    const timeout = setTimeout(() => setGraceElapsed(true), delayMs);
    return () => clearTimeout(timeout);
  }, [shouldWarn, delayMs]);

  if (!shouldWarn || !graceElapsed) {
    return null;
  }

  return (
    <div className={styles.overlay} role="alert" aria-live="assertive">
      <div className={styles.panel}>
        <div className={styles.icon} aria-hidden="true">
          ⚠
        </div>
        <h2 className={styles.title}>{t('SPECTATOR.LOGIN_REQUIRED_TITLE')}</h2>
        <p className={styles.description}>
          {t('SPECTATOR.LOGIN_REQUIRED_BODY')}
        </p>
        <div className={styles.buttonGroup}>
          <Link to="/user/login" className={styles.loginButton}>
            {t('SPECTATOR.LOGIN_REQUIRED_ACTION')}
          </Link>
          <Link to="/" className={styles.homeButton}>
            {t('SPECTATOR.LOGIN_REQUIRED_HOME')}
          </Link>
        </div>
      </div>
    </div>
  );
};

export default SpectatorLoginRequired;

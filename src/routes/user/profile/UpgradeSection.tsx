import React from 'react';
import { useTranslation } from 'react-i18next';
import { TALISHAR_METAFY_URL } from 'constants/socialLinks';
import styles from './profile.module.css';

interface UpgradeSectionProps {
  isSupporter: boolean;
  userName?: string;
  className?: string;
  isOwner?: boolean;
}

const UpgradeSection: React.FC<UpgradeSectionProps> = ({
  isSupporter,
  userName,
  className,
  isOwner
}) => {
  const { t } = useTranslation();
  if (isSupporter) {
    return (
      <div className={`${styles.upgradeSection} ${styles.supporterBadge}`}>
        <h3>{t('PROFILE.SUPPORTER_STATUS')}</h3>
        <p className={styles.supporterText}>{t('PROFILE.SUPPORTER_THANKS')}</p>
        <p className={styles.supporterThanks}>
          {t('PROFILE.SUPPORTER_GENEROSITY')}
        </p>
      </div>
    );
  }

  return (
    <div className={`${styles.upgradeSection} ${styles.freeUserBadge}`}>
      <div className={styles.upgradeHeader}>
        <span className={styles.freeBadge}>{t('PROFILE.FREE_BADGE')}</span>
        <h3>{t('PROFILE.FREE_USER')}</h3>
      </div>

      <p className={styles.upgradeDescription}>
        {t('PROFILE.UPGRADE_DESCRIPTION')}
      </p>

      <div className={styles.upgradeButtonSection}>
        <a
          href={TALISHAR_METAFY_URL}
          target="_blank"
          rel="noopener noreferrer"
          className={styles.upgradeButton}
        >
          {t('PROFILE.BECOME_SUPPORTER')}
        </a>
        <p className={styles.upgradeNote}>{t('PROFILE.UPGRADE_NOTE')}</p>
      </div>
    </div>
  );
};

export default UpgradeSection;

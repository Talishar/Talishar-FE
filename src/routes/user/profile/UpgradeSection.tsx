import React from 'react';
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
  // DEBUG: Log what UpgradeSection receives
  console.log('[UpgradeSection] Received props:', {
    isSupporter,
    userName,
    isOwner,
    willShowSupporterBadge: !!isSupporter
  });
  if (isSupporter) {
    return (
      <div className={`${styles.upgradeSection} ${styles.supporterBadge}`}>
        <h3>✨ Supporter Status</h3>
        <p className={styles.supporterText}>
          Thank you for supporting Talishar! Your contribution helps us keep the platform running and improve the game experience for everyone.
        </p>
        <p className={styles.supporterThanks}>
          Enjoy premium benefits and thank you for your generosity!
        </p>
      </div>
    );
  }

  return (
    <div className={`${styles.upgradeSection} ${styles.freeUserBadge}`}>
      <div className={styles.upgradeHeader}>
        <span className={styles.freeBadge}>FREE</span>
        <h3>Free User</h3>
      </div>
      
      <p className={styles.upgradeDescription}>
        Talishar is a free, community-driven platform. Support our development and gain exclusive benefits!
      </p>

      <div className={styles.upgradeButtonSection}>
        <p className={styles.upgradePrompt}>
          Join our community of supporters and help us grow!
        </p>
        <a
          href="https://metafy.gg/@talishar"
          target="_blank"
          rel="noopener noreferrer"
          className={styles.upgradeButton}
        >
          Become a Supporter on Metafy
        </a>
        <p className={styles.upgradeNote}>
          Support directly through our Metafy community and unlock supporter status instantly!
        </p>
      </div>
    </div>
  );
};

export default UpgradeSection;

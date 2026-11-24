import { useTranslation } from 'react-i18next';
import RemoveAdsLink from 'components/RemoveAdsLink/RemoveAdsLink';
import useAdSlotRef from 'hooks/useAdSlotRef';
import { memberLink } from 'utils/memberLink';
import squareMemberCTA from '../../../../../img/squareMemberCTA.webp';
import styles from './LobbyAd.module.css';

const LobbyAd = () => {
  const { t } = useTranslation();
  const slotRef = useAdSlotRef<HTMLDivElement>();

  return (
    <div className={styles.lobbyAd}>
      <RemoveAdsLink className={styles.remove} source="remove-ads-lobby" />
      <div className={styles.box}>
        <a
          href={memberLink('lobby-card')}
          target="_blank"
          rel="noopener noreferrer"
          className={styles.cta}
        >
          <img
            src={squareMemberCTA}
            alt={t('HOUSE_REWARDED_AD.BECOME_MEMBER')}
          />
        </a>
        <div ref={slotRef} data-ad="right-rail-1" className={styles.slot} />
      </div>
    </div>
  );
};

export default LobbyAd;

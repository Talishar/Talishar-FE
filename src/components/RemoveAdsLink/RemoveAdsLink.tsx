import { useTranslation } from 'react-i18next';
import { TALISHAR_METAFY_URL } from 'constants/socialLinks';
import styles from './RemoveAdsLink.module.css';

interface RemoveAdsLinkProps {
  className?: string;
}

const RemoveAdsLink = ({ className }: RemoveAdsLinkProps) => {
  const { t } = useTranslation();

  return (
    <a
      href={TALISHAR_METAFY_URL}
      target="_blank"
      rel="noopener noreferrer"
      className={
        className
          ? `${styles.removeAdsLink} ${className}`
          : styles.removeAdsLink
      }
    >
      {t('UNITED_GAME_PANEL.REMOVE_ADS')}
    </a>
  );
};

export default RemoveAdsLink;

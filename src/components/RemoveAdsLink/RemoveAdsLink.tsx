import { useTranslation } from 'react-i18next';
import { memberLink, MemberLinkSource } from 'utils/memberLink';
import styles from './RemoveAdsLink.module.css';

interface RemoveAdsLinkProps {
  className?: string;
  source: Extract<MemberLinkSource, `remove-ads-${string}`>;
}

const RemoveAdsLink = ({ className, source }: RemoveAdsLinkProps) => {
  const { t } = useTranslation();

  return (
    <a
      href={memberLink(source)}
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

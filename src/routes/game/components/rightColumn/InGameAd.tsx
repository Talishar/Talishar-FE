import React, { useLayoutEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import RemoveAdsLink from 'components/RemoveAdsLink/RemoveAdsLink';
import { IN_GAME_AD_SIZE } from 'config/ads';
import { TALISHAR_METAFY_URL } from 'constants/socialLinks';
import squareMemberCTA from '../../../../img/squareMemberCTA.webp';
import styles from './RightColumn.module.css';

const boxStyle = {
  '--in-game-ad-size': `${IN_GAME_AD_SIZE}px`
} as React.CSSProperties;

// The member CTA fills the box while the ad loads, when nothing fills, under
// an ad blocker, and whenever the column is too narrow for the placement. The
// placement only mounts when it fits, so the provider never renders a cropped
// or hidden ad.
const InGameAd = () => {
  const { t } = useTranslation();
  const columnRef = useRef<HTMLDivElement>(null);
  const [fitsAd, setFitsAd] = useState(false);

  useLayoutEffect(() => {
    const column = columnRef.current;
    if (!column) return;
    const update = (width: number) => setFitsAd(width >= IN_GAME_AD_SIZE);
    update(column.getBoundingClientRect().width);
    const observer = new ResizeObserver(([entry]) => {
      update(entry.contentRect.width);
    });
    observer.observe(column);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={columnRef} className={styles.inGameAd}>
      <RemoveAdsLink className={styles.inGameAdRemove} />
      <div
        className={styles.inGameAdBox}
        style={boxStyle}
        data-fits-ad={fitsAd || undefined}
      >
        <a
          href={TALISHAR_METAFY_URL}
          target="_blank"
          rel="noopener noreferrer"
          className={styles.inGameAdCta}
        >
          <img
            src={squareMemberCTA}
            alt={t('HOUSE_REWARDED_AD.BECOME_MEMBER')}
          />
        </a>
        {fitsAd && (
          <div data-ad="in-game-block" className={styles.inGameAdSlot} />
        )}
      </div>
    </div>
  );
};

export default InGameAd;

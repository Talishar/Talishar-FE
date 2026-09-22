import React from 'react';
import useSupporterStatus from 'hooks/useSupporterStatus';
import useAdScript from 'hooks/useAdScript';
import RemoveAdsLink from 'components/RemoveAdsLink/RemoveAdsLink';
import { AdUnit } from './AdUnit';
import styles from './AdRailLayout.module.css';

interface AdRailLayoutProps {
  children: React.ReactNode;
  contentWidth?: number;
}

const AdRailLayout = ({ children, contentWidth = 900 }: AdRailLayoutProps) => {
  const { showAds } = useSupporterStatus();
  useAdScript(showAds);

  if (!showAds) return <>{children}</>;

  return (
    <div
      className={styles.layout}
      style={
        { '--rail-content-width': `${contentWidth}px` } as React.CSSProperties
      }
    >
      <aside className={styles.rail}>
        <RemoveAdsLink className={styles.removeAds} />
        <AdUnit placement="left-rail-1" />
      </aside>
      <div className={styles.center}>{children}</div>
      <aside className={styles.rail}>
        <RemoveAdsLink className={styles.removeAds} />
        <AdUnit placement="right-rail-1" />
      </aside>
    </div>
  );
};

export default AdRailLayout;

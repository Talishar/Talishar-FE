import React from 'react';
import styles from '../Learn.module.scss';
import { MetafyGuide } from '../../../services/metafyService';
import { AdUnit } from '../../../components/ads';

interface GuideGridProps {
  guides: MetafyGuide[];
  showAds?: boolean;
}

const AD_INTERVAL = 3;

const GuideGrid: React.FC<GuideGridProps> = ({ guides, showAds = false }) => {
  const formatPrice = (
    guide: MetafyGuide
  ): {
    display: string;
    originalPrice?: string;
    isFreeForSupporters: boolean;
  } => {
    if (!guide.price || guide.price.value === 0) {
      return { display: 'Free for supporters', isFreeForSupporters: false };
    }
    const originalPrice = `$${(guide.price.value_in_cents / 100).toFixed(2)}`;
    return {
      display: 'Supporter discount',
      originalPrice,
      isFreeForSupporters: true
    };
  };

  const formatDate = (dateString: string): string => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch {
      return dateString;
    }
  };

  if (guides.length === 0) return null;

  const sorted = [...guides].sort((a, b) => {
    const ratingDiff = (b.rating ?? 0) - (a.rating ?? 0);
    if (ratingDiff !== 0) return ratingDiff;
    return (b.price?.value_in_cents ?? 0) - (a.price?.value_in_cents ?? 0);
  });
  const featured = sorted[0];
  const rest = guides.filter((g) => g.id !== featured.id);

  const renderGuideCard = (guide: MetafyGuide, isFeatured = false) => (
    <a
      key={guide.id}
      href={`https://metafy.gg/guides/view/${guide.slug}`}
      target="_blank"
      rel="noopener noreferrer"
      className={isFeatured ? styles.featuredCard : styles.guideCard}
    >
      <div className={isFeatured ? styles.featuredImageContainer : styles.guideImageContainer}>
        {guide.cover_url ? (
          <img
            src={guide.cover_url}
            alt={guide.name}
            className={styles.guideImage}
          />
        ) : (
          <div className={styles.placeholderImage}>
            <span>No Image</span>
          </div>
        )}
      </div>

      <div className={isFeatured ? styles.featuredContent : styles.guideContent}>
        <h3 className={isFeatured ? styles.featuredName : styles.guideName}>{guide.name}</h3>

        <p className={isFeatured ? styles.featuredDescription : styles.guideDescription}>
          {guide.description}
        </p>

        <div className={styles.guideFooter}>
          <div className={styles.guideInfo}>
            <span className={styles.author}>
              {guide.users && guide.users.length > 0
                ? guide.users.map((u) => u.display_name || u.username).filter(Boolean).join(' & ')
                : guide.user?.display_name || guide.user?.username || 'Talishar'}
            </span>
            {guide.rating && (
              <span className={styles.rating}>{guide.rating}</span>
            )}
          </div>

          <div className={styles.guideMetadata}>
            <span className={styles.date}>
              {formatDate(guide.updated_at)}
            </span>
            <div className={styles.priceContainer}>
              {(() => {
                const priceInfo = formatPrice(guide);
                return (
                  <>
                    {priceInfo.originalPrice && (
                      <span className={styles.originalPrice}>
                        {priceInfo.originalPrice}
                      </span>
                    )}
                    {!priceInfo.isFreeForSupporters && (
                      <span className={styles.price}>
                        {priceInfo.display}
                      </span>
                    )}
                  </>
                );
              })()}
            </div>
          </div>
        </div>
      </div>
    </a>
  );

  const gridItems: React.ReactNode[] = [];
  let adCount = 0;
  let guidesInCurrentGroup = 1;

  for (let i = 0; i < rest.length; i++) {
    gridItems.push(renderGuideCard(rest[i]));
    guidesInCurrentGroup++;

    if (showAds && guidesInCurrentGroup === AD_INTERVAL) {
      adCount++;
      gridItems.push(
        <div key={`ad-${adCount}`} className={styles.adTile}>
          <a
            href="https://metafy.gg/@talishar/members"
            target="_blank"
            rel="noopener noreferrer"
            className={styles.removeAdsLink}
          >
            Remove ads
          </a>
          <AdUnit placement={`mobile-unit-${adCount + 3}`} className={styles.adTileUnit} />
        </div>
      );
      guidesInCurrentGroup = 0;
    }
  }

  const ROW_SIZE = 3;
  const rows: React.ReactNode[] = [];
  for (let i = 0; i < gridItems.length; i += ROW_SIZE) {
    rows.push(
      <div key={`row-${i}`} className={styles.guideRow}>
        {gridItems.slice(i, i + ROW_SIZE)}
      </div>
    );
  }

  return (
    <div className={styles.guideGrid}>
      {renderGuideCard(featured, true)}
      {rows}
    </div>
  );
};

export default GuideGrid;

import React from 'react';
import { useTranslation } from 'react-i18next';
import styles from '../Learn.module.scss';
import { MetafyGuide } from '../../../services/metafyService';

interface GuideGridProps {
  guides: MetafyGuide[];
}

const GUIDE_AUTHOR_OVERRIDES: Record<string, string[]> = {
  'Patience and Steel - The Hussar Hala Playbook': [
    'Winged Hussars FaB',
    'Xir',
    'Calebovitsch',
    'Talishar',
    'LucidTCG'
  ]
};

const GuideGrid: React.FC<GuideGridProps> = ({ guides }) => {
  const { t, i18n } = useTranslation();

  const formatAuthorNames = (guide: MetafyGuide): string => {
    const creditedAuthors = GUIDE_AUTHOR_OVERRIDES[guide.name];
    if (creditedAuthors) {
      return new Intl.ListFormat(i18n.language, {
        style: 'long',
        type: 'conjunction'
      }).format(creditedAuthors);
    }

    if (guide.account?.name) return guide.account.name;

    if (guide.users && guide.users.length > 0) {
      return guide.users
        .map((user) => user.display_name || user.username)
        .filter((name): name is string => Boolean(name))
        .join(' & ');
    }

    return guide.user?.display_name || guide.user?.username || 'Talishar';
  };

  const formatPrice = (
    guide: MetafyGuide
  ): {
    display: string;
    originalPrice?: string;
    isFreeForSupporters: boolean;
  } => {
    if (!guide.price || guide.price.value === 0) {
      return {
        display: t('LEARN.FREE_FOR_SUPPORTERS'),
        isFreeForSupporters: false
      };
    }
    const originalPrice = `$${(guide.price.value_in_cents / 100).toFixed(2)}`;
    return {
      display: t('LEARN.SUPPORTER_DISCOUNT'),
      originalPrice,
      isFreeForSupporters: true
    };
  };

  const formatDate = (dateString: string): string => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString(i18n.language, {
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
      <div
        className={
          isFeatured
            ? styles.featuredImageContainer
            : styles.guideImageContainer
        }
      >
        {guide.cover_url ? (
          <img
            src={guide.cover_url}
            alt={guide.name}
            className={styles.guideImage}
          />
        ) : (
          <div className={styles.placeholderImage}>
            <span>{t('LEARN.NO_IMAGE')}</span>
          </div>
        )}
      </div>

      <div
        className={isFeatured ? styles.featuredContent : styles.guideContent}
      >
        <h3 className={isFeatured ? styles.featuredName : styles.guideName}>
          {guide.name}
        </h3>

        <p
          className={
            isFeatured ? styles.featuredDescription : styles.guideDescription
          }
        >
          {guide.description}
        </p>

        <div className={styles.guideFooter}>
          <div className={styles.guideInfo}>
            <span className={styles.author}>{formatAuthorNames(guide)}</span>
            {guide.rating && (
              <span className={styles.rating}>{guide.rating}</span>
            )}
          </div>

          <div className={styles.guideMetadata}>
            <span className={styles.date}>{formatDate(guide.updated_at)}</span>
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
                      <span className={styles.price}>{priceInfo.display}</span>
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

  const gridItems = rest.map((guide) => renderGuideCard(guide));

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

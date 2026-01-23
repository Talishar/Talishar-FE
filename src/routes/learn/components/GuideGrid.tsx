import React from 'react';
import styles from '../Learn.module.scss';
import { MetafyGuide } from '../../services/metafyService';

interface GuideGridProps {
  guides: MetafyGuide[];
}

const GuideGrid: React.FC<GuideGridProps> = ({ guides }) => {
  const formatPrice = (guide: MetafyGuide): string => {
    if (!guide.price || guide.price.value === 0) {
      return 'Free';
    }
    return `$${(guide.price.value_in_cents / 100).toFixed(2)}`;
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

  return (
    <div className={styles.guideGrid}>
      {guides.map((guide) => (
        <a
          key={guide.id}
          href={`https://metafy.gg/guides/view/${guide.slug}`}
          target="_blank"
          rel="noopener noreferrer"
          className={styles.guideCard}
        >
          <div className={styles.guideImageContainer}>
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
          
          <div className={styles.guideContent}>
            <h3 className={styles.guideName}>{guide.name}</h3>
            
            <p className={styles.guideDescription}>{guide.description}</p>
            
            <div className={styles.guideFooter}>
              <div className={styles.guideInfo}>
                <span className={styles.author}>
                  {(guide as any).isOwnerGuide ? 'PvtVoid' : (guide.account?.name || 'Flesh & Blood')}
                </span>
                {guide.rating && (
                  <span className={styles.rating}>
                    {`${guide.rating}/10`}
                  </span>
                )}
              </div>
              
              <div className={styles.guideMetadata}>
                <span className={styles.date}>
                  {formatDate(guide.updated_at)}
                </span>
                <span className={styles.price}>
                  {formatPrice(guide)}
                </span>
              </div>
            </div>
            
            {guide.subscriber_only && (
              <div className={styles.subscriberBadge}>
                Subscriber Only
              </div>
            )}
          </div>
        </a>
      ))}
    </div>
  );
};

export default GuideGrid;

import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'react-hot-toast';
import styles from './profile.module.css';
import { MetafyCommunity } from 'interface/API/MetafyAPI.php';
import { useRefreshMetafyCommunitiesMutation } from 'features/api/apiSlice';
import { clearSupporterStatusCache } from 'hooks/useSupporterStatus';

interface MetafySectionProps {
  isMetafyLinked: boolean;
  metafyCommunities: MetafyCommunity[];
  metafyInfo: string;
  className?: string;
}

const MetafySection: React.FC<MetafySectionProps> = ({
  isMetafyLinked,
  metafyCommunities,
  metafyInfo,
  className
}) => {
  const { t } = useTranslation();
  const [showCommunities, setShowCommunities] = useState(false);
  const [refreshMetafyCommunities, { isLoading: isRefreshing }] =
    useRefreshMetafyCommunitiesMutation();

  const handleRefresh = async (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    if (isRefreshing) return;
    try {
      await refreshMetafyCommunities().unwrap();
      clearSupporterStatusCache();
      toast.success(t('PROFILE.METAFY_REFRESHED'), {
        position: 'top-center'
      });
    } catch (err: any) {
      const status = err?.status;
      const errorCode = err?.data?.error;
      // Token expired or not linked - redirect to OAuth re-auth
      if (
        status === 401 ||
        errorCode === 'token_expired' ||
        errorCode === 'no_access_token'
      ) {
        toast(t('PROFILE.METAFY_REDIRECTING'), {
          position: 'top-center'
        });
        if (metafyInfo) {
          window.location.href = metafyInfo;
        }
      } else {
        toast.error(t('PROFILE.METAFY_REFRESH_FAILED'), {
          position: 'top-center'
        });
      }
    }
  };

  // Helper function to determine community type
  const getCommunityType = (
    community: MetafyCommunity
  ): 'owned' | 'supported' | undefined => {
    // If type is explicitly set, use it
    if (community.type) {
      return community.type;
    }
    // If no type but community has content, assume it's a supporter community
    // (owner communities would have type set)
    return undefined;
  };

  return (
    <div
      className={`${styles.metafySection} ${
        !isMetafyLinked ? styles.connectionRow : ''
      } ${className ?? ''}`}
    >
      <h3>{t('PROFILE.METAFY_COMMUNITIES')}</h3>
      {!isMetafyLinked && (
        <p>
          <a href={metafyInfo}>{t('PROFILE.CONNECT_METAFY')}</a>
        </p>
      )}
      {isMetafyLinked && (
        <>
          <p>
            {t('PROFILE.METAFY_LINKED')} <br />
            <a href={metafyInfo ?? '#'} onClick={handleRefresh}>
              {isRefreshing
                ? t('PROFILE.REFRESHING')
                : t('PROFILE.REFRESH_METAFY_CONNECTION')}
            </a>
          </p>
          <button
            onClick={() => setShowCommunities(!showCommunities)}
            className={styles.metafyToggleButton}
          >
            {showCommunities
              ? t('PROFILE.HIDE_COMMUNITIES')
              : t('PROFILE.SHOW_COMMUNITIES')}
          </button>

          {showCommunities && (
            <div className={styles.metafyCommunitiesList}>
              {metafyCommunities && metafyCommunities.length > 0 ? (
                <div>
                  <div className={styles.metafyCommunitiesHeader}>
                    {t('PROFILE.YOUR_COMMUNITIES')}
                  </div>
                  {metafyCommunities.map((community, index) => {
                    const communityType = getCommunityType(community);
                    const isOwned = communityType === 'owned';
                    const isSupported =
                      communityType === 'supported' ||
                      (!communityType && metafyCommunities.length > 0);

                    return (
                      <div
                        key={community.id || index}
                        className={`${styles.metafyCommunityItem} ${
                          isOwned
                            ? styles.metafyCommunityOwned
                            : styles.metafyCommunitySupported
                        }`}
                      >
                        {isOwned && (
                          <div className={styles.metafyCommunityBadge}>
                            {t('PROFILE.OWNER')}
                          </div>
                        )}
                        {isSupported && (
                          <div className={styles.metafyCommunityBadge}>
                            {t('PROFILE.SUPPORTER')}
                          </div>
                        )}
                        {community.logo_url && (
                          <div className={styles.metafyCommunityLogo}>
                            <img
                              src={community.logo_url}
                              alt={community.title}
                            />
                          </div>
                        )}
                        <div className={styles.metafyCommunityName}>
                          {community.title ||
                            community.name ||
                            t('PROFILE.UNNAMED_COMMUNITY')}
                        </div>
                        {community.description && (
                          <div className={styles.metafyCommunityDescription}>
                            {community.description}
                          </div>
                        )}
                        {community.url && (
                          <div className={styles.metafyCommunityLink}>
                            <a
                              href={community.url}
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              {t('PROFILE.VISIT_COMMUNITY')}
                            </a>
                          </div>
                        )}
                        <div className={styles.metafyCommunityId}>
                          {t('PROFILE.COMMUNITY_ID', { id: community.id })}
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className={styles.metafyNoCommunities}>
                  {t('PROFILE.NO_COMMUNITIES')}
                </div>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default MetafySection;

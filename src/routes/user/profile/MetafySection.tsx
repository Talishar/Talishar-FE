import React, { useState } from 'react';
import { toast } from 'react-hot-toast';
import styles from './profile.module.css';
import { MetafyCommunity } from 'interface/API/MetafyAPI.php';
import { useRefreshMetafyCommunitiesMutation } from 'features/api/apiSlice';

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
  const [showCommunities, setShowCommunities] = useState(false);
  const [refreshMetafyCommunities, { isLoading: isRefreshing }] = useRefreshMetafyCommunitiesMutation();

  const handleDisconnect = async () => {
    // For now, we'll show a placeholder message
    toast.success('Metafy disconnection feature coming soon', {
      position: 'top-center'
    });
  };

  const handleRefresh = async (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    if (isRefreshing) return;
    try {
      await refreshMetafyCommunities().unwrap();
      toast.success('Metafy communities refreshed!', { position: 'top-center' });
    } catch (err: any) {
      const status = err?.status;
      const errorCode = err?.data?.error;
      // Token expired or not linked — redirect to OAuth re-auth
      if (status === 401 || errorCode === 'token_expired' || errorCode === 'no_access_token') {
        toast('Redirecting to re-connect your Metafy account...', { position: 'top-center' });
        if (metafyInfo) {
          window.location.href = metafyInfo;
        }
      } else {
        toast.error('Failed to refresh Metafy data. Please try again.', { position: 'top-center' });
      }
    }
  };

  // Helper function to determine community type
  const getCommunityType = (community: MetafyCommunity): 'owned' | 'supported' | undefined => {
    // If type is explicitly set, use it
    if (community.type) {
      return community.type;
    }
    // If no type but community has content, assume it's a supporter community
    // (owner communities would have type set)
    return undefined;
  };

  return (
    <div className={styles.metafySection}>
      <h3>Metafy Communities</h3>
      {!isMetafyLinked && (
        <p>
          <a href={metafyInfo}>Connect to Metafy</a>
        </p>
      )}
      {isMetafyLinked && (
        <>
          <p>
            You have linked your Metafy account. <br />
            <a href={metafyInfo ?? '#'} onClick={handleRefresh}>
              {isRefreshing ? 'Refreshing...' : 'Refresh your Metafy connection'}
            </a>
          </p>
          <button
            onClick={() => setShowCommunities(!showCommunities)}
            className={styles.metafyToggleButton}
          >
            {showCommunities ? 'Hide Communities' : 'Show Communities'}
          </button>

          {showCommunities && (
            <div className={styles.metafyCommunitiesList}>
              {metafyCommunities && metafyCommunities.length > 0 ? (
                <div>
                  <div className={styles.metafyCommunitiesHeader}>Your Communities:</div>
                  {metafyCommunities.map((community, index) => {
                    const communityType = getCommunityType(community);
                    const isOwned = communityType === 'owned';
                    const isSupported = communityType === 'supported' || (!communityType && metafyCommunities.length > 0);
                    
                    return (
                      <div
                        key={community.id || index}
                        className={`${styles.metafyCommunityItem} ${
                          isOwned ? styles.metafyCommunityOwned : styles.metafyCommunitySupported
                        }`}
                      >
                        {isOwned && (
                          <div className={styles.metafyCommunityBadge}>
                            👑 Owner
                          </div>
                        )}
                        {isSupported && (
                          <div className={styles.metafyCommunityBadge}>
                            💖 Supporter
                          </div>
                        )}
                        {community.logo_url && (
                          <div className={styles.metafyCommunityLogo}>
                            <img src={community.logo_url} alt={community.title} />
                          </div>
                        )}
                        <div className={styles.metafyCommunityName}>
                          {community.title || community.name || 'Unnamed Community'}
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
                              Visit Community →
                            </a>
                          </div>
                        )}
                        <div className={styles.metafyCommunityId}>
                          ID: {community.id}
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className={styles.metafyNoCommunities}>
                  No communities found. Community data will appear here once available.
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


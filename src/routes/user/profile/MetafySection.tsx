import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import styles from './profile.module.css';
import { MetafyCommunity } from 'interface/API/MetafyAPI.php';
import { BACKEND_URL } from 'appConstants';

interface MetafySectionProps {
  isMetafyLinked: boolean;
  metafyCommunities: MetafyCommunity[];
  metafyInfo: string;
  className?: string;
  onRefreshCommunities?: () => void;
}

const MetafySection: React.FC<MetafySectionProps> = ({
  isMetafyLinked,
  metafyCommunities,
  metafyInfo,
  className,
  onRefreshCommunities
}) => {
  const [showCommunities, setShowCommunities] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefreshMetafy = async () => {
    setIsRefreshing(true);
    try {
      const response = await fetch(`${BACKEND_URL}AccountFiles/RefreshMetafyCommunities.php`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include'
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to refresh Metafy communities');
      }

      toast.success('Metafy communities refreshed successfully!', {
        position: 'top-center'
      });

      // Trigger parent component to refresh communities data
      if (onRefreshCommunities) {
        onRefreshCommunities();
      } else {
        // Fallback: reload the page after a short delay
        setTimeout(() => {
          window.location.reload();
        }, 1000);
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An error occurred while refreshing';
      toast.error(errorMessage, {
        position: 'top-center'
      });
      console.error('Failed to refresh Metafy communities:', error);
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleDisconnect = async () => {
    // For now, we'll show a placeholder message
    toast.success('Metafy disconnection feature coming soon', {
      position: 'top-center'
    });
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
            <button
              onClick={handleRefreshMetafy}
              disabled={isRefreshing}
              className={styles.metafyRefreshButton}
              title="Refresh your Metafy community data from Metafy servers"
            >
              {isRefreshing ? 'Refreshing...' : 'Refresh your Metafy connection'}
            </button>
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


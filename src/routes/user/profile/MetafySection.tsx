import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import styles from './profile.module.css';
import { MetafyCommunity } from 'interface/API/MetafyAPI.php';

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

  useEffect(() => {
    console.log('[MetafySection] Component mounted/updated');
    console.log('[MetafySection] isMetafyLinked:', isMetafyLinked);
    console.log('[MetafySection] metafyCommunities:', metafyCommunities);
    console.log('[MetafySection] metafyCommunities length:', metafyCommunities?.length);
    
    if (metafyCommunities && metafyCommunities.length > 0) {
      metafyCommunities.forEach((community, index) => {
        console.log(`[MetafySection] Community ${index}:`, {
          id: community.id,
          title: community.title,
          type: community.type,
          subscription_tier: community.subscription_tier,
          tiers: community.tiers,
          full: community
        });
      });
    }
  }, [isMetafyLinked, metafyCommunities]);

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
            <a href={metafyInfo}>Refresh your Metafy connection</a>
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
                    
                    console.log(`[MetafySection] Rendering community ${index}:`, {
                      title: community.title,
                      id: community.id,
                      type: communityType,
                      isOwned,
                      isSupported
                    });
                    
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


import React, { useState } from 'react';
import { toast } from 'react-hot-toast';
import styles from './profile.module.css';
import { MetafyCommunity } from 'interface/API/MetafyAPI.php';

interface MetafySectionProps {
  isMetafyLinked: boolean;
  metafyCommunities: MetafyCommunity[];
  metafyInfo: string;
  isMod?: boolean;
  className?: string;
}

const MetafySection: React.FC<MetafySectionProps> = ({
  isMetafyLinked,
  metafyCommunities,
  metafyInfo,
  isMod = false,
  className
}) => {
  const [showCommunities, setShowCommunities] = useState(false);

  // Only show this section to moderators
  if (!isMod) {
    return null;
  }

  const handleDisconnect = async () => {
    // For now, we'll show a placeholder message
    toast.success('Metafy disconnection feature coming soon', {
      position: 'top-center'
    });
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
          <p>You have linked your Metafy account.</p>
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
                  {metafyCommunities.map((community, index) => (
                    <div
                      key={community.id || index}
                      className={styles.metafyCommunityItem}
                    >
                      <div className={styles.metafyCommunityName}>
                        {community.name || 'Unnamed Community'}
                      </div>
                      {community.description && (
                        <div className={styles.metafyCommunityDescription}>
                          {community.description}
                        </div>
                      )}
                      {community.website && (
                        <div className={styles.metafyCommunityLink}>
                          <a
                            href={community.website}
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
                  ))}
                </div>
              ) : (
                <div className={styles.metafyNoCommunities}>
                  No communities found. Community data will appear here once available.
                </div>
              )}
            </div>
          )}

          <div className={styles.metafyActionButtons}>
            <a href={metafyInfo} className={styles.metafyRefreshButton}>
              Refresh Connection
            </a>
            <button
              onClick={handleDisconnect}
              className={styles.metafyDisconnectButton}
            >
              Disconnect Metafy
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default MetafySection;


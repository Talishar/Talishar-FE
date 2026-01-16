import React, { useState } from 'react';
import { useAppSelector } from 'app/Hooks';
import { RootState } from 'app/Store';
import styles from './SpectatorCount.module.css';
import { FaEye } from 'react-icons/fa';

export default function SpectatorCount() {
  const spectatorCount = useAppSelector(
    (state: RootState) => state.game?.gameDynamicInfo?.spectatorCount ?? 0
  );
  const spectatorNames = useAppSelector(
    (state: RootState) => state.game?.gameDynamicInfo?.spectatorNames ?? []
  );
  const [showTooltip, setShowTooltip] = useState(false);

  // Hide component if no spectators
  if (spectatorCount === 0) {
    return null;
  }

  const tooltipText = spectatorNames.length > 0 
    ? spectatorNames.join('\n')
    : 'Anonymous spectators';

  return (
    <div className={styles.spectatorCountStyle}>
      <div
        className={styles.spectatorCountContainer}
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
      >
        <FaEye /> {spectatorCount === 1 ? 'Spectator' : 'Spectators'}: {spectatorCount}
        {showTooltip && (
          <div className={styles.tooltip}>
            {spectatorNames.length > 0 ? (
              <div>
                {spectatorNames.map((name, index) => (
                  <div key={index}>{name}</div>
                ))}
              </div>
            ) : (
              <div>Anonymous spectators</div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

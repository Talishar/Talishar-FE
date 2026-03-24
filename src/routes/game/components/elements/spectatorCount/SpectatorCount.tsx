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

  if (spectatorCount === 0) {
    return null;
  }

  return (
    <div className={styles.spectatorCountStyle}>
      <div
        className={styles.spectatorCountContainer}
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
      >
        <FaEye style={{ verticalAlign: 'middle' }} /> {spectatorCount === 1 ? 'Spectator' : 'Spectators'}:{' '}
        {spectatorCount}
        {showTooltip && spectatorNames.length > 0 && (
          <div className={styles.tooltip}>
            {spectatorNames.map((name, i) => (
              <div key={i}>{name}</div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

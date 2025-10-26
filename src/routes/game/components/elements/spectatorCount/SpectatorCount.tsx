import React from 'react';
import { useAppSelector } from 'app/Hooks';
import { RootState } from 'app/Store';
import styles from './SpectatorCount.module.css';
import { FaEye } from 'react-icons/fa';

export default function SpectatorCount() {
  const spectatorCount = useAppSelector(
    (state: RootState) => state.game.gameDynamicInfo.spectatorCount ?? 0
  );

  // Hide component if no spectators
  if (spectatorCount === 0) {
    return null;
  }

  return (
    <div className={styles.spectatorCountStyle}>
      <div>
        <FaEye /> Spectators: {spectatorCount}
      </div>
    </div>
  );
}

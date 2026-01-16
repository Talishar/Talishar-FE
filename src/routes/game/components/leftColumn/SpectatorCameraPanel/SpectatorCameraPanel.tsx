import React from 'react';
import { useAppDispatch, useAppSelector } from 'app/Hooks';
import { getGameInfo, setSpectatorCameraView } from 'features/game/GameSlice';
import styles from './SpectatorCameraPanel.module.css';
import { MdSwapVert } from 'react-icons/md';

export default function SpectatorCameraPanel() {
  const dispatch = useAppDispatch();
  const { playerID } = useAppSelector(getGameInfo);
  const spectatorCameraView = useAppSelector((state: any) => state.game.spectatorCameraView);

  // Only show if this is a spectator
  if (playerID !== 3) {
    return null;
  }

  const toggleView = () => {
    const newView = spectatorCameraView === 1 ? 2 : 1;
    dispatch(setSpectatorCameraView(newView));
  };

  return (
    <button 
      className={styles.cameraTab}
      onClick={toggleView}
      title={`Switch to Player ${spectatorCameraView === 1 ? 2 : 1} View`}
      aria-label={`Switch to Player ${spectatorCameraView === 1 ? 2 : 1} View`}
    >
      <div className={styles.buttonContent}>
        <MdSwapVert className={styles.icon} />
        <span className={styles.label}>P{spectatorCameraView === 1 ? '2' : '1'}</span>
      </div>
    </button>
  );
}

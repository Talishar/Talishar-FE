import React, { useState } from 'react';
import { useAppDispatch, useAppSelector } from 'app/Hooks';
import { getGameInfo, setSpectatorCameraView } from 'features/game/GameSlice';
import styles from './SpectatorCameraPanel.module.css';

export default function SpectatorCameraPanel() {
  const [isOpen, setIsOpen] = useState(false);
  const dispatch = useAppDispatch();
  const { playerID } = useAppSelector(getGameInfo);
  const spectatorCameraView = useAppSelector((state: any) => state.game.spectatorCameraView);

  // Only show if this is a spectator
  if (playerID !== 3) {
    return null;
  }

  const toggleView = (view: number) => {
    dispatch(setSpectatorCameraView(view));
  };

  return (
    <>
      <button 
        className={`${styles.cameraTab} ${isOpen ? styles.hidden : ''}`}
        onClick={() => setIsOpen(!isOpen)}
        title="Toggle Camera View"
      >
        Change View
      </button>
      {isOpen && <CameraPanel currentView={spectatorCameraView} onToggleView={toggleView} onClose={() => setIsOpen(false)} />}
    </>
  );
}

function CameraPanel({ 
  currentView,
  onToggleView,
  onClose 
}: { 
  currentView: number;
  onToggleView: (view: number) => void;
  onClose: () => void; 
}) {
  return (
    <div className={styles.cameraPanel}>
      <div className={styles.header}>
        <h3>Camera View</h3>
        <button className={styles.closeButton} onClick={onClose}>
          ×
        </button>
      </div>
      <div className={styles.content}>
        <p className={styles.description}>Choose which player to view:</p>
        
        <button 
          className={`${styles.viewButton} ${currentView === 1 ? styles.active : ''}`}
          onClick={() => onToggleView(1)}
        >
          Player 1
        </button>
        
        <button 
          className={`${styles.viewButton} ${currentView === 2 ? styles.active : ''}`}
          onClick={() => onToggleView(2)}
        >
          Player 2
        </button>
      </div>
    </div>
  );
}

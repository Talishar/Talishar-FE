import React from 'react';
import { useAppDispatch, useAppSelector } from 'app/Hooks';
import { getGameInfo, setSpectatorCameraView } from 'features/game/GameSlice';
import styles from './SpectatorCameraPanel.module.css';

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
    >
      {spectatorCameraView === 1 ? 'View: Player 1' : 'View: Player 2'}
    </button>
  );
}

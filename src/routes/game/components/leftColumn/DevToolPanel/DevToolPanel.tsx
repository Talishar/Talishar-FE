import React, { useId, useState, useMemo } from 'react';
import { useLocation } from 'react-router-dom';
import styles from './DevToolPanel.module.css';
import { useLoadDebugGameMutation } from 'features/api/apiSlice';
import { toast } from 'react-hot-toast';

export default function DevToolPanel() {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();

  // Extract game ID from URL (e.g., /game/play/1145 -> 1145)
  const gameIdFromUrl = useMemo(() => {
    const pathSegments = location.pathname.split('/');
    return pathSegments[pathSegments.length - 1];
  }, [location.pathname]);

  // Only show in dev environment and not on CreateGame page
  if (import.meta.env.PROD || location.pathname.includes('/create')) {
    return null;
  }

  return (
    <>
      <button 
        className={styles.devToolTab} 
        onClick={() => setIsOpen(!isOpen)}
        title="Toggle Dev Tool"
      >
        Dev Tool
      </button>
      {isOpen && <DevToolContent gameIdFromUrl={gameIdFromUrl} onClose={() => setIsOpen(false)} />}
    </>
  );
}

function DevToolContent({ gameIdFromUrl, onClose }: { gameIdFromUrl: string; onClose: () => void }) {
  const gameIDInput = useId();
  const localIDInput = useId();
  const [gameID, setGameID] = useState<string | undefined>(undefined);
  const [localGame, setLocalGame] = useState<string | undefined>(gameIdFromUrl);
  const [debugGameMutation] = useLoadDebugGameMutation();

  const handleButtonClick = (
    e: React.MouseEvent<HTMLButtonElement, MouseEvent>
  ) => {
    e.preventDefault();
    
    const performMutation = async () => {
      // Trim spaces from game IDs before sending
      await debugGameMutation({ 
        source: gameID?.trim(), 
        target: localGame?.trim() 
      });
      window.location.reload();
    };
    
    toast.promise(performMutation(), {
      loading: 'Loading debug game state...',
      success: 'Reloading...',
      error: 'Failed to load game state'
    });
  };

  return (
    <div className={styles.devToolPanel}>
      <div className={styles.header}>
        <h3>Dev Tool</h3>
        <button className={styles.closeButton} onClick={onClose}>
          ×
        </button>
      </div>
      <div className={styles.content}>
        <div className={styles.formGroup}>
          <label htmlFor={gameIDInput}>Debug game ID:</label>
          <input
            id={gameIDInput}
            type="text"
            onChange={(e) => setGameID(e.target.value)}
            placeholder="Enter game ID"
          />
        </div>
        <div className={styles.formGroup}>
          <label htmlFor={localIDInput}>Local game ID to overwrite:</label>
          <input
            id={localIDInput}
            type="text"
            value={localGame}
            onChange={(e) => setLocalGame(e.target.value)}
            placeholder="Enter local game ID"
          />
        </div>
        <button className={styles.submitButton} onClick={handleButtonClick}>
          Replace local game with debug game
        </button>
      </div>
    </div>
  );
}

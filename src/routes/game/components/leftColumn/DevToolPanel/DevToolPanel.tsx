import React, { useId, useState, useMemo } from 'react';
import { useLocation } from 'react-router-dom';
import styles from './DevToolPanel.module.css';
import { useLoadDebugGameMutation } from 'features/api/apiSlice';
import { toast } from 'react-hot-toast';
import { usePanelContext } from '../PanelContext';

export default function DevToolPanel() {
  const [isOpen, setIsOpen] = useState(false);
  const { setIsDevToolOpen, isManualModeOpen } = usePanelContext();
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
        className={`${styles.devToolTab} ${isOpen || isManualModeOpen ? styles.hidden : ''}`}
        onClick={() => {
          setIsOpen(!isOpen);
          setIsDevToolOpen(!isOpen);
        }}
        title="Toggle Dev Tool"
      >
        Dev Tool
      </button>
      {isOpen && <DevToolContent gameIdFromUrl={gameIdFromUrl} onClose={() => {
        setIsOpen(false);
        setIsDevToolOpen(false);
      }} />}
    </>
  );
}

function DevToolContent({ gameIdFromUrl, onClose }: { gameIdFromUrl: string; onClose: () => void }) {
  const gameIDInput = useId();
  const variantInput = useId();
  const localIDInput = useId();
  const [gameID, setGameID] = useState<string | undefined>(undefined);
  const [variant, setVariant] = useState<string>('0');
  const [localGame, setLocalGame] = useState<string | undefined>(gameIdFromUrl);
  const [debugGameMutation] = useLoadDebugGameMutation();

  const handleButtonClick = (
    e: React.MouseEvent<HTMLButtonElement, MouseEvent>
  ) => {
    e.preventDefault();
    
    const performMutation = async () => {
      // Construct the source game ID with variant
      const sourceGameID = `${gameID?.trim()}-${variant}`;
      
      try {
        const result = await debugGameMutation({ 
          source: sourceGameID, 
          target: localGame?.trim() 
        }).unwrap();
        
        // Only reload if mutation succeeds
        window.location.reload();
      } catch (error: any) {
        // Parse the error message from the backend or network error
        let errorMessage = 'Failed to load game state';
        
        if (error?.data?.error) {
          errorMessage = error.data.error;
        } else if (error?.message) {
          errorMessage = error.message;
        }
        
        // Improve message for missing bug reports
        if (errorMessage.includes('does not exist')) {
          errorMessage = `Bug report ${sourceGameID} does not exist. Please check the ID and variant.`;
        } else if (errorMessage.includes('PARSING ERROR')) {
          errorMessage = `Invalid bug report data for ${sourceGameID}. The files may be corrupted.`;
        }
        
        throw new Error(errorMessage);
      }
    };
    
    toast.promise(performMutation(), {
      loading: 'Loading debug game state...',
      success: 'Reloading...',
      error: (err: Error) => err.message || 'Failed to load game state'
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
            placeholder="Enter game ID (e.g., 111)"
          />
        </div>
        <div className={styles.formGroup}>
          <label htmlFor={variantInput}>Bug report variant:</label>
          <input
            id={variantInput}
            type="number"
            min="0"
            value={variant}
            onChange={(e) => setVariant(e.target.value)}
            placeholder="0"
          />
          <small style={{ display: 'block', marginTop: '4px', color: '#888' }}>
            Will load 111-0, 111-1, 111-2, etc.
          </small>
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

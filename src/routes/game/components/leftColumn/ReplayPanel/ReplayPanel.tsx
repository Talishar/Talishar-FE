import React, { useId, useState } from 'react';
import { useAppSelector } from 'app/Hooks';
import { getGameInfo } from 'features/game/GameSlice';
import { useLocation } from 'react-router-dom';
import styles from './ReplayPanel.module.css';
import { toast } from 'react-hot-toast';
import { BACKEND_URL, URL_END_POINT } from 'appConstants';

export default function ReplayPanel() {
  const [isOpen, setIsOpen] = useState(false);
  const gameInfo = useAppSelector(getGameInfo);
  const location = useLocation();

  // Debug: Log the isReplay status
  console.log('[ReplayPanel] gameInfo.isReplay:', gameInfo.isReplay);

  // Only show if this is a replay and not on CreateGame page
  if (!gameInfo.isReplay || location.pathname.includes('/create')) {
    return null;
  }

  return (
    <>
      <button 
        className={`${styles.replayTab} ${isOpen ? styles.hidden : ''}`}
        onClick={() => setIsOpen(!isOpen)}
        title="Toggle Replay Controls"
      >
        Replay
      </button>
      {isOpen && <ReplayContent gameInfo={gameInfo} onClose={() => setIsOpen(false)} />}
    </>
  );
}

function ReplayContent({ 
  gameInfo, 
  onClose 
}: { 
  gameInfo: any; 
  onClose: () => void; 
}) {
  const turnInputId = useId();
  const [turnNumber, setTurnNumber] = useState<string>('0');

  const loadTurn = async (turn: number) => {
    const performLoad = async () => {
      try {
        const response = await fetch(
          `${BACKEND_URL}LoadReplayTurn.php?gameName=${gameInfo.gameID}&playerID=${gameInfo.playerID}&turnNumber=${turn}`,
          {
            method: 'GET',
            credentials: 'include'
          }
        );

        const data = await response.json();

        if (data.errorMessage) {
          // Build detailed error message with available turns if provided
          let errorMsg = data.errorMessage;
          if (data.availableTurns && data.availableTurns.length > 0) {
            errorMsg += '\n\nAvailable turns: ' + data.availableTurns.join(', ');
          }
          throw new Error(errorMsg);
        }

        if (data.success) {
          // Reload the page to refresh the game state
          window.location.reload();
        }
      } catch (error: any) {
        const errorMsg = error?.message || 'Failed to load turn';
        throw new Error(errorMsg);
      }
    };

    toast.promise(performLoad(), {
      loading: `Loading turn ${turn}...`,
      success: `Turn ${turn} loaded!`,
      error: (err: Error) => err.message || 'Failed to load turn'
    });
  };

  const handleLoadTurn = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    const turn = parseInt(turnNumber, 10);
    if (isNaN(turn) || turn < 0) {
      toast.error('Please enter a valid turn number');
      return;
    }
    loadTurn(turn);
  };

  const handleReturnToStart = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    loadTurn(0);
  };

  const handlePreviousTurn = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    const turn = Math.max(0, parseInt(turnNumber, 10) - 1);
    setTurnNumber(turn.toString());
    loadTurn(turn);
  };

  const handleNextTurn = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    const turn = parseInt(turnNumber, 10) + 1;
    setTurnNumber(turn.toString());
    loadTurn(turn);
  };

  return (
    <div className={styles.replayPanel}>
      <div className={styles.header}>
        <h3>Replay Controls</h3>
        <button className={styles.closeButton} onClick={onClose}>
          ×
        </button>
      </div>
      <div className={styles.content}>
        <div className={styles.formGroup}>
          <label htmlFor={turnInputId}>Go to turn:</label>
          <input
            id={turnInputId}
            type="number"
            min="0"
            value={turnNumber}
            onChange={(e) => setTurnNumber(e.target.value)}
            placeholder="0"
          />
        </div>
        <button className={styles.submitButton} onClick={handleLoadTurn}>
          Load Turn
        </button>
        
        <div className={styles.divider}></div>
        
        <button className={styles.actionButton} onClick={handleReturnToStart}>
          Return to Start
        </button>
        
        <div className={styles.navButtons}>
          <button className={styles.navButton} onClick={handlePreviousTurn} title="Load previous turn">
            ← Previous
          </button>
          <button className={styles.navButton} onClick={handleNextTurn} title="Load next turn">
            Next →
          </button>
        </div>
      </div>
    </div>
  );
}

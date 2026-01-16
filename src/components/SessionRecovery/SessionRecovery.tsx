import React, { useEffect, useState } from 'react';
import styles from './SessionRecovery.module.css';
import useAuth from 'hooks/useAuth';
import { useGetLastActiveGameQuery } from 'features/api/apiSlice';
import { useNavigate } from 'react-router-dom';
import { deleteGameAuthKey, saveGameAuthKey, loadGameAuthKeyFromIndexedDB, loadGameUsername } from 'utils/LocalKeyManagement';
import { toast } from 'react-hot-toast';

const SessionRecovery: React.FC = () => {
  const navigate = useNavigate();
  const { isLoggedIn, currentUserName } = useAuth();
  const [isDismissed, setIsDismissed] = useState(false);
  const [showPrompt, setShowPrompt] = useState(false);
  const [isRecovering, setIsRecovering] = useState(false);

  // Only query if user is logged in
  const { data, isLoading } = useGetLastActiveGameQuery(undefined, {
    skip: !isLoggedIn || isDismissed,
    pollingInterval: 0 // No polling, query once
  });

  // Check if this specific game was dismissed
  useEffect(() => {
    if (!data?.gameName) return;

    const dismissalKey = `sessionRecoveryDismissed_${data.gameName}`;
    const dismissedTime = localStorage.getItem(dismissalKey);
    
    if (dismissedTime) {
      const hoursSinceDismissal = (Date.now() - new Date(dismissedTime).getTime()) / (1000 * 60 * 60);
      if (hoursSinceDismissal < 2) {
        // Show as dismissed for 2 hours
        setIsDismissed(true);
        return;
      } else {
        // Dismissal expired, allow showing again
        localStorage.removeItem(dismissalKey);
        setIsDismissed(false);
      }
    } else {
      setIsDismissed(false);
    }
  }, [data?.gameName]);

  // Auto-cleanup finished/invalid games
  useEffect(() => {
    if (!data?.gameName) return;
    
    // If game doesn't exist or is not in progress, auto-cleanup
    if (data?.gameExists === false || data?.gameInProgress === false) {
      // Game is finished or invalid, clear the stored data
      deleteGameAuthKey(data.gameName);
      
      // Mark as dismissed to prevent re-checking for 2 hours
      const dismissalKey = `sessionRecoveryDismissed_${data.gameName}`;
      localStorage.setItem(dismissalKey, new Date().toISOString());
      
      setIsDismissed(true);
      setShowPrompt(false);
    }
  }, [data?.gameName, data?.gameExists, data?.gameInProgress]);

  // Show prompt only if:
  // 1. User is logged in
  // 2. Game exists and is in progress
  // 3. Auth key is valid
  // 4. Not dismissed
  useEffect(() => {
    if (
      isLoggedIn &&
      !isDismissed &&
      data?.gameExists &&
      data?.gameInProgress &&
      !data?.authKeyMismatch &&
      data?.gameName
    ) {
      setShowPrompt(true);
    } else {
      setShowPrompt(false);
    }
  }, [data, isDismissed, isLoggedIn]);

  /**
   * Attempt to recover authKey from multiple sources if primary is unavailable
   */
  const attemptAuthKeyRecovery = async (gameId: number | string, playerID: number): Promise<string | undefined> => {
    try {
      // First try IndexedDB backup
      const idbAuthKey = await loadGameAuthKeyFromIndexedDB(gameId as number);
      if (idbAuthKey) {
        console.log('✅ Recovered authKey from IndexedDB');
        return idbAuthKey;
      }

      // Second try to recover from backend API (requires user to be logged in)
      if (isLoggedIn && currentUserName) {
        try {
          const response = await fetch(`/APIs/RecoverAuthKey.php?gameName=${gameId}&playerID=${playerID}`);
          if (response.ok) {
            const result = await response.json();
            if (result.success && result.authKey) {
              console.log('✅ Recovered authKey from backend');
              return result.authKey;
            }
          } else if (response.status === 410) {
            console.warn('Auth key not available in session, game may need rejoin');
          }
        } catch (error) {
          console.warn('Backend recovery failed:', error);
        }
      }
    } catch (error) {
      console.warn('Auth key recovery attempt failed:', error);
    }
    return undefined;
  };

  const handleRejoin = async () => {
    if (!data?.gameName || !data?.playerID) return;
    
    // Reject spectators (playerID == 3) from saving auth keys
    if (data.playerID === 3) {
      navigate(`/game/lobby/${data.gameName}`, {
        state: { playerID: data.playerID }
      });
      return;
    }

    setIsRecovering(true);
    
    try {
      let authKeyToUse = data?.authKey;

      // If server didn't provide authKey, attempt recovery
      if (!authKeyToUse) {
        console.log('⚠️ Server authKey unavailable, attempting recovery...');
        authKeyToUse = await attemptAuthKeyRecovery(data.gameName, data.playerID);

        if (!authKeyToUse) {
          toast.error('Unable to recover game session. Please rejoin the game.');
          setIsRecovering(false);
          return;
        }

        toast.success('Game session recovered!');
      }

      // Save auth key before navigating
      saveGameAuthKey(data.gameName, authKeyToUse, data.playerID, currentUserName || undefined);
      
      // Navigate to the game
      navigate(`/game/lobby/${data.gameName}`, {
        state: { playerID: data.playerID }
      });
    } catch (error) {
      console.error('Rejoin error:', error);
      toast.error('Failed to rejoin game. Please try again.');
      setIsRecovering(false);
    }
  };

  const handleDismiss = () => {
    if (!data?.gameName) return;
    
    setIsDismissed(true);
    // Remember the dismissal for THIS SPECIFIC GAME for 2 hours
    const dismissalKey = `sessionRecoveryDismissed_${data.gameName}`;
    localStorage.setItem(dismissalKey, new Date().toISOString());
  };

  if (!showPrompt || isLoading) {
    return null;
  }

  const opponentStatus = data?.opponentDisconnected ? ' (Opponent Disconnected)' : '';
  const gameId = data?.gameName;

  return (
    <div className={styles.container}>
      <div className={styles.message}>
        <h3 className={styles.title}>⚡ Resume Your Game?</h3>
        <p className={styles.description}>
          You have an active game <span className={styles.gameId}>#{gameId}</span> waiting
          {opponentStatus ? <span className={styles.opponentStatus}>{opponentStatus}</span> : ''}
        </p>
        <p className={styles.opponentInfo}>
          Opponent: <span className={styles.opponentName}>{data?.opponentName}</span>
        </p>
        <div className={styles.buttonGroup}>
          <button
            className={styles.rejoinButton}
            onClick={handleRejoin}
            disabled={isRecovering}
            title="Resume your game"
          >
            {isRecovering ? '⏳ Recovering...' : 'Rejoin Game'}
          </button>
          <button
            className={styles.dismissButton}
            onClick={handleDismiss}
            disabled={isRecovering}
            title="Dismiss for 2 hours"
          >
            Dismiss
          </button>
        </div>
      </div>
    </div>
  );
};

export default SessionRecovery;

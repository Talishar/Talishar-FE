import React from 'react';
import { useAppDispatch } from 'app/Hooks';
import { useLoadReplayMutation } from 'features/api/apiSlice';
import { toast } from 'react-hot-toast';
import classNames from 'classnames';
import { LoadReplayAPI } from 'interface/API/LoadReplayAPI.php';
import { setReplayStart } from 'features/game/GameSlice';
import { useNavigate } from 'react-router-dom';
import { SubmitHandler, useForm } from 'react-hook-form';
import styles from './LoadReplay.module.css';
import { GameLocationState } from 'interface/GameLocationState';

const LoadReplay = () => {
  return (
    <article>
      <h2>Replay Tool</h2>
      <ReplayGame />
    </article>
  );
};

const ReplayGame = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const [loadReplay, loadReplayResult] = useLoadReplayMutation();

  const {
    register,
    formState: { isSubmitting, errors },
    setError,
    handleSubmit,
  } = useForm<LoadReplayAPI>({
    mode: 'onBlur',
  });

  const onSubmit: SubmitHandler<LoadReplayAPI> = async (
    values: LoadReplayAPI
  ) => {
    try {
      if (!values.replayNumber) {
        throw new Error('Replay number is required. Please enter a valid replay game number.');
      }

      const response = await loadReplay(values).unwrap();
      if (response.error) {
        // Build detailed error message from backend response
        let errorMessage = response.error;
        
        if (response.missingFiles) {
          errorMessage += '\n\nMissing files:\n';
          Object.entries(response.missingFiles).forEach(([file, description]) => {
            errorMessage += `  • ${file}: ${description}\n`;
          });
        }

        if (response.copyErrors && Array.isArray(response.copyErrors)) {
          errorMessage += '\n\nCopy errors:\n';
          response.copyErrors.forEach((err: string) => {
            errorMessage += `  • ${err}\n`;
          });
        }

        if (response.debug) {
          errorMessage += '\n\n📋 Debug Information:\n';
          errorMessage += JSON.stringify(response.debug, null, 2);
        }

        throw new Error(errorMessage);
      } else {
        if (!response.playerID || !response.gameName || !response.authKey) {
          throw new Error('Server response incomplete. Missing: playerID, gameName, or authKey. Response: ' + JSON.stringify(response));
        }
        dispatch(
          setReplayStart({
            playerID: response.playerID ?? 0,
            gameID: response.gameName ?? 0,
            authKey: response.authKey ?? '',
          })
        );
        toast.success(`Replay loaded successfully! Game ID: ${response.gameName}`, { position: 'top-center' });
        navigate(`/game/play/${response.gameName}`, {
          state: { playerID: response.playerID ?? 0 } as GameLocationState
        });
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error('Replay load error:', errorMessage);
      toast.error(errorMessage, { position: 'top-center', duration: 6000 });
      setError('root.serverError', {
        type: 'custom',
        message: errorMessage
      });
    }
  };

  const buttonClass = classNames(styles.button, 'primary');

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
        <div>
        <label htmlFor="replayNumber">Replay game number:</label>
        <input
            id="replayNumber"
            type="number"
            placeholder="Enter replay number"
            {...register('replayNumber', { valueAsNumber: true })}
        ></input>
        <button
            type="submit"
            className={buttonClass}
            disabled={isSubmitting}
            aria-busy={isSubmitting}
            >
            Replay Game
            </button>
        </div>
        
        {errors.root?.serverError && (
          <div className={styles.errorContainer}>
            <strong className={styles.errorTitle}>⚠️ Error Loading Replay</strong>
            
            <div className={styles.errorMessage}>
              {errors.root.serverError.message}
            </div>
            
            <details className={styles.troubleshootingDetails}>
              <summary className={styles.troubleshootingSummary}>
                Troubleshooting Steps
              </summary>
              <div className={styles.troubleshootingContent}>
                <ol className={styles.troubleshootingList}>
                  <li className={styles.troubleshootingListItem}>
                    Open browser console: Press <kbd className={styles.kbd}>F12</kbd> → <strong>Console</strong> tab
                  </li>
                  <li className={styles.troubleshootingListItem}>
                    Look for <code className={styles.codeInline}>"Replay load error:"</code> message
                  </li>
                  <li className={styles.troubleshootingListItem}>
                    Verify replay directory exists at:
                    <div className={styles.pathBox}>
                      /Talishar/Replays/[replayNumber]/
                    </div>
                  </li>
                  <li className={styles.troubleshootingListItem}>
                    Ensure both required files exist:
                    <div className={styles.filesList}>
                      <div className={styles.fileItem}>
                        ✓ origGamestate.txt
                      </div>
                      <div className={styles.fileItemLast}>
                        ✓ commandfile.txt
                      </div>
                    </div>
                  </li>
                </ol>
              </div>
            </details>
          </div>
        )}
        
        {isSubmitting && (
          <div className={styles.loadingState}>
            Loading replay...
          </div>
        )}
    </form>
  );
}


export default LoadReplay;

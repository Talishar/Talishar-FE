import React from 'react';
import { useAppDispatch } from 'app/Hooks';
import {
  useGetSavedReplaysQuery,
  useLoadReplayMutation,
  useSetReplayFavoriteMutation
} from 'features/api/apiSlice';
import { FaRegStar, FaStar } from 'react-icons/fa';
import { SavedReplay } from 'interface/API/GetSavedReplays.php';
import { toast } from 'react-hot-toast';
import classNames from 'classnames';
import { LoadReplayAPI } from 'interface/API/LoadReplayAPI.php';
import { setReplayStart } from 'features/game/GameSlice';
import { useNavigate } from 'react-router-dom';
import { SubmitHandler, useForm } from 'react-hook-form';
import { TALISHAR_DISCORD_URL } from 'constants/socialLinks';
import styles from './LoadReplay.module.css';
import { GameLocationState } from 'interface/GameLocationState';
import PageBanner from 'components/PageBanner/PageBanner';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

const LoadReplay = () => {
  const { t } = useTranslation();
  return (
    <main className={styles.pageWrapper}>
      <PageBanner
        title={t('PAGES.REPLAY_TOOL')}
        subtitle="Review your saved games, revisit key turns, and improve your next match."
      />
      <article className={styles.articleContainer}>
        <ReplayGame />
        <div className={styles.betaDisclaimer}>
          <strong>⚠️ The Replay Tool is currently in Beta</strong>
          <p>
            The Replay Tool is currently in beta. If you encounter any issues,
            please report them in our Discord{' '}
            <a
              href={TALISHAR_DISCORD_URL}
              target="_blank"
              rel="noopener noreferrer"
            >
              #bug-reports
            </a>{' '}
            channel with your{' '}
            <span className={styles.betaDisclaimerHighlight}>
              Talishar username
            </span>{' '}
            and{' '}
            <span className={styles.betaDisclaimerHighlight}>
              replay number
            </span>
            .
          </p>
          <p>
            Please note: Replays you save might randomly stop working as engine
            changes get made during development.
          </p>
          <p>
            Replay saving is available to Metafy supporters. Everyone gets a
            base number of save slots, and higher support tiers unlock
            additional slots so you can keep more games around at once. See the{' '}
            <Link to="/premium">Premium</Link> page for tier details.
          </p>
        </div>
      </article>
    </main>
  );
};

const ReplayGame = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const [loadReplay, loadReplayResult] = useLoadReplayMutation();
  const [setReplayFavorite, { isLoading: isUpdatingFavorite }] =
    useSetReplayFavoriteMutation();
  const { data: savedReplayData, isLoading: isLoadingSavedReplays } =
    useGetSavedReplaysQuery();

  const {
    register,
    formState: { isSubmitting, errors },
    setError,
    handleSubmit
  } = useForm<LoadReplayAPI>({
    mode: 'onBlur'
  });

  const onSubmit: SubmitHandler<LoadReplayAPI> = async (
    values: LoadReplayAPI
  ) => {
    try {
      if (!values.replayNumber) {
        throw new Error(
          'Replay number is required. Please enter a valid replay game number.'
        );
      }

      const response = await loadReplay(values).unwrap();
      if (response.error) {
        // Build detailed error message from backend response
        let errorMessage = response.error;

        if (response.missingFiles) {
          errorMessage += '\n\nMissing files:\n';
          Object.entries(response.missingFiles).forEach(
            ([file, description]) => {
              errorMessage += `  • ${file}: ${description}\n`;
            }
          );
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
          throw new Error(
            'Server response incomplete. Missing: playerID, gameName, or authKey. Response: ' +
              JSON.stringify(response)
          );
        }
        dispatch(
          setReplayStart({
            playerID: response.playerID ?? 0,
            gameID: response.gameName ?? 0,
            authKey: response.authKey ?? '',
            replayNumber: values.replayNumber
          })
        );
        toast.success(
          `Replay loaded successfully! Game ID: ${response.gameName}`,
          { position: 'top-center' }
        );
        navigate(`/game/play/${response.gameName}`, {
          state: { playerID: response.playerID ?? 0 } as GameLocationState
        });
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      console.error('Replay load error:', errorMessage);
      toast.error(errorMessage, { position: 'top-center', duration: 6000 });
      setError('root.serverError', {
        type: 'custom',
        message: errorMessage
      });
    }
  };

  const buttonClass = classNames(styles.button, 'primary');
  const isLoadingReplay = isSubmitting || loadReplayResult.isLoading;
  const savedReplays = savedReplayData?.replays ?? [];
  const replayLabel = (replay: SavedReplay) => {
    const names = [replay.p1DisplayName, replay.p2DisplayName].filter(Boolean);
    return names.length
      ? names.join(' vs ')
      : 'Players unavailable for older replay';
  };
  const heroLabel = (replay: SavedReplay) => {
    const heroes = [replay.p1HeroName, replay.p2HeroName].filter(Boolean);
    return heroes.length === 2 ? heroes.join(' vs ') : '';
  };
  const toggleFavorite = async (replay: SavedReplay) => {
    try {
      await setReplayFavorite({
        replayNumber: replay.replayNumber,
        favorite: !replay.favorite
      }).unwrap();
    } catch {
      toast.error('Unable to update replay favorite. Please try again.');
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className={styles.replayForm}>
      <section
        className={styles.savedReplays}
        aria-labelledby="saved-replays-heading"
      >
        <div className={styles.savedReplaysHeader}>
          <div>
            <h2 id="saved-replays-heading">Your saved replays</h2>
            <p>Choose a replay to begin reviewing the match.</p>
            <p className={styles.favoriteExplanation}>
              Favorites are protected from automatic cleanup. When replay
              storage is full, the oldest non-favorite replay is removed.
            </p>
          </div>
          {isLoadingSavedReplays && (
            <span className={styles.replaysStatus}>Loading...</span>
          )}
        </div>
        {savedReplayData?.loggedIn === false ? (
          <p className={styles.emptyReplays}>
            Sign in to view your saved replays.
          </p>
        ) : !isLoadingSavedReplays && savedReplays.length === 0 ? (
          <p className={styles.emptyReplays}>
            No saved replays yet. Save a completed game to find it here.
          </p>
        ) : (
          <div className={styles.replayList}>
            {savedReplays.map((replay: SavedReplay) => (
              <article key={replay.replayNumber} className={styles.replayCard}>
                <button
                  type="button"
                  className={styles.replayCardMain}
                  onClick={() =>
                    onSubmit({ replayNumber: replay.replayNumber })
                  }
                  disabled={isLoadingReplay}
                >
                  <span className={styles.replayNumber}>
                    Replay #{replay.replayNumber}
                  </span>
                  <span className={styles.replayPlayers}>
                    {replayLabel(replay)}
                  </span>
                  {heroLabel(replay) && (
                    <span className={styles.replayHeroes}>
                      {heroLabel(replay)}
                    </span>
                  )}
                </button>
                <button
                  type="button"
                  className={`${styles.favoriteButton} ${
                    replay.favorite ? styles.favoriteActive : ''
                  }`}
                  onClick={() => toggleFavorite(replay)}
                  disabled={isUpdatingFavorite}
                  aria-label={`${replay.favorite ? 'Remove' : 'Add'} Replay #${
                    replay.replayNumber
                  } ${replay.favorite ? 'from' : 'to'} favorites`}
                  aria-pressed={replay.favorite}
                  title={
                    replay.favorite
                      ? 'Remove from favorites'
                      : 'Keep this replay'
                  }
                >
                  {replay.favorite ? <FaStar /> : <FaRegStar />}
                </button>
              </article>
            ))}
          </div>
        )}
      </section>

{/*       <details className={styles.manualReplay}>
        <summary>Load by replay number</summary>
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
            disabled={isLoadingReplay}
            aria-busy={isLoadingReplay}
          >
            Replay Game
          </button>
        </div>
      </details> */}

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
                  Open browser console: Press{' '}
                  <kbd className={styles.kbd}>F12</kbd> →{' '}
                  <strong>Console</strong> tab
                </li>
                <li className={styles.troubleshootingListItem}>
                  Look for{' '}
                  <code className={styles.codeInline}>
                    "Replay load error:"
                  </code>{' '}
                  message
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
                    <div className={styles.fileItem}>✓ origGamestate.txt</div>
                    <div className={styles.fileItemLast}>✓ commandfile.txt</div>
                  </div>
                </li>
              </ol>
            </div>
          </details>
        </div>
      )}

      {isSubmitting && (
        <div className={styles.loadingState}>Loading replay...</div>
      )}
    </form>
  );
};

export default LoadReplay;

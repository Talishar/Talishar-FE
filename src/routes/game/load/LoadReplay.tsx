import { useAppDispatch, useAppSelector } from 'app/Hooks';
import {
  useGetSavedReplaysQuery,
  useLoadReplayMutation,
  useSetReplayFavoriteMutation,
  useShareReplayMutation
} from 'features/api/apiSlice';
import { FaRegStar, FaStar } from 'react-icons/fa';
import { MdShare } from 'react-icons/md';
import { selectIsPatron } from 'features/auth/authSlice';
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
import { Trans, useTranslation } from 'react-i18next';

const LoadReplay = () => {
  const { t } = useTranslation();
  return (
    <main className={styles.pageWrapper}>
      <PageBanner
        title={t('PAGES.REPLAY_TOOL')}
        subtitle={t('LOAD_REPLAY.SUBTITLE')}
      />
      <article className={styles.articleContainer}>
        <ReplayGame />
        <div className={styles.betaDisclaimer}>
          <strong>{t('LOAD_REPLAY.BETA_TITLE')}</strong>
          <p>
            <Trans
              i18nKey="LOAD_REPLAY.BETA_BODY"
              components={{
                2: (
                  <a
                    href={TALISHAR_DISCORD_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                  />
                ),
                6: <span className={styles.betaDisclaimerHighlight} />,
                10: <span className={styles.betaDisclaimerHighlight} />
              }}
            />
          </p>
          <p>{t('LOAD_REPLAY.BETA_NOTE')}</p>
          <p>
            <Trans
              i18nKey="LOAD_REPLAY.SUPPORTER_INFO"
              components={{ 2: <Link to="/premium" /> }}
            />
          </p>
        </div>
      </article>
    </main>
  );
};

const ReplayGame = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const [loadReplay, loadReplayResult] = useLoadReplayMutation();
  const [setReplayFavorite, { isLoading: isUpdatingFavorite }] =
    useSetReplayFavoriteMutation();
  const [shareReplay, { isLoading: isSharing }] = useShareReplayMutation();
  const isPatron = useAppSelector(selectIsPatron);
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
  const shareSavedReplay = async (replay: SavedReplay) => {
    try {
      const result = await shareReplay({
        replayNumber: replay.replayNumber
      }).unwrap();
      if (!result.token)
        throw new Error(result.error || 'No share link created.');

      await navigator.clipboard.writeText(
        `${window.location.origin}/replay/shared?token=${result.token}`
      );
      toast.success('Share link copied to clipboard!');
    } catch (error) {
      const apiError = error as { data?: { error?: string } };
      toast.error(
        error instanceof Error
          ? error.message
          : apiError.data?.error || 'Failed to create share link.'
      );
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
            <h2 id="saved-replays-heading">
              {t('LOAD_REPLAY.SAVED_REPLAYS_TITLE')}
            </h2>
            <p>{t('LOAD_REPLAY.SAVED_REPLAYS_SUBTITLE')}</p>
            <p className={styles.favoriteExplanation}>
              {t('LOAD_REPLAY.FAVORITES_EXPLANATION')}
            </p>
          </div>
          {isLoadingSavedReplays && (
            <span className={styles.replaysStatus}>
              {t('LOAD_REPLAY.LOADING')}
            </span>
          )}
        </div>
        {savedReplayData?.loggedIn === false ? (
          <p className={styles.emptyReplays}>
            {t('LOAD_REPLAY.SIGN_IN_TO_VIEW')}
          </p>
        ) : !isLoadingSavedReplays && savedReplays.length === 0 ? (
          <p className={styles.emptyReplays}>
            {t('LOAD_REPLAY.NO_SAVED_REPLAYS')}
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
                    {t('LOAD_REPLAY.REPLAY_NUMBER', {
                      number: replay.replayNumber
                    })}
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
                {isPatron && (
                  <button
                    type="button"
                    className={styles.shareButton}
                    onClick={() => shareSavedReplay(replay)}
                    disabled={isSharing}
                    aria-label={`Copy a shareable link for Replay #${replay.replayNumber}`}
                    title={t('LOAD_REPLAY.COPY_SHAREABLE_LINK')}
                  >
                    <MdShare />
                  </button>
                )}
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
          <strong className={styles.errorTitle}>
            {t('LOAD_REPLAY.ERROR_LOADING_REPLAY')}
          </strong>

          <div className={styles.errorMessage}>
            {errors.root.serverError.message}
          </div>

          <details className={styles.troubleshootingDetails}>
            <summary className={styles.troubleshootingSummary}>
              {t('LOAD_REPLAY.TROUBLESHOOTING_STEPS')}
            </summary>
            <div className={styles.troubleshootingContent}>
              <ol className={styles.troubleshootingList}>
                <li className={styles.troubleshootingListItem}>
                  <Trans
                    i18nKey="LOAD_REPLAY.STEP_OPEN_CONSOLE"
                    components={{
                      2: <kbd className={styles.kbd} />,
                      5: <strong />
                    }}
                  />
                </li>
                <li className={styles.troubleshootingListItem}>
                  <Trans
                    i18nKey="LOAD_REPLAY.STEP_LOOK_FOR"
                    components={{
                      2: <code className={styles.codeInline} />
                    }}
                  />
                </li>
                <li className={styles.troubleshootingListItem}>
                  {t('LOAD_REPLAY.VERIFY_DIRECTORY')}
                  <div className={styles.pathBox}>
                    /Talishar/Replays/[replayNumber]/
                  </div>
                </li>
                <li className={styles.troubleshootingListItem}>
                  {t('LOAD_REPLAY.ENSURE_FILES')}
                  <div className={styles.filesList}>
                    <div className={styles.fileItem}>
                      {t('LOAD_REPLAY.FILE_ORIG')}
                    </div>
                    <div className={styles.fileItemLast}>
                      {t('LOAD_REPLAY.FILE_COMMAND')}
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
          {t('LOAD_REPLAY.LOADING_REPLAY')}
        </div>
      )}
    </form>
  );
};

export default LoadReplay;

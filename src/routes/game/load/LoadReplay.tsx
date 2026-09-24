import React, { useState } from 'react';
import { useAppDispatch } from 'app/Hooks';
import {
  useDeleteReplayMutation,
  useCreateSnapshotGameMutation,
  useGetSavedReplaysQuery,
  useLoadReplayMutation,
  useSetReplayFavoriteMutation,
  useShareReplayMutation
} from 'features/api/apiSlice';
import { FaRegStar, FaStar } from 'react-icons/fa';
import { MdDeleteOutline, MdShare } from 'react-icons/md';
import {
  GetSavedReplaysResponse,
  SavedReplay
} from 'interface/API/GetSavedReplays.php';
import { toast } from 'react-hot-toast';
import { LoadReplayAPI } from 'interface/API/LoadReplayAPI.php';
import { setGameStart, setReplayStart } from 'features/game/GameSlice';
import { useNavigate } from 'react-router-dom';
import { SubmitHandler, useForm } from 'react-hook-form';
import { TALISHAR_DISCORD_URL } from 'constants/socialLinks';
import styles from './LoadReplay.module.css';
import { GameLocationState } from 'interface/GameLocationState';
import PageBanner from 'components/PageBanner/PageBanner';
import AdRailLayout from 'components/ads/AdRailLayout';
import { Link } from 'react-router-dom';
import { Trans, useTranslation } from 'react-i18next';

interface PreparedSnapshot {
  snapshotNumber: number;
  gameName: number;
  playerID: number;
  authKey: string;
  inviteUrl: string;
}

const LoadReplay = () => {
  const { t } = useTranslation();
  return (
    <main className={styles.pageWrapper}>
      <PageBanner
        title={t('PAGES.REPLAY_TOOL')}
        subtitle={t('LOAD_REPLAY.SUBTITLE')}
      />
      <AdRailLayout>
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
      </AdRailLayout>
    </main>
  );
};

const ReplaySlotMeter = ({
  savedReplayData
}: {
  savedReplayData: GetSavedReplaysResponse;
}) => {
  const { t } = useTranslation();
  const maxSlots = savedReplayData.maxSlots ?? 0;
  if (maxSlots <= 0) return null;

  const favoriteSlots = Math.min(savedReplayData.favoriteSlots ?? 0, maxSlots);
  const freeSlots = Math.max(maxSlots - favoriteSlots, 0);
  const canUpgrade = savedReplayData.nextSlotTier !== null;

  return (
    <div className={styles.slotMeter}>
      <div className={styles.slotMeterHeader}>
        <span className={styles.slotMeterCount}>
          {t('LOAD_REPLAY.SLOTS_USED', { used: favoriteSlots, max: maxSlots })}
        </span>
        <span className={styles.slotMeterBreakdown}>
          {t('LOAD_REPLAY.SLOTS_FREE', { count: freeSlots })}
        </span>
      </div>
      <div
        className={styles.slotTrack}
        role="img"
        aria-label={t('LOAD_REPLAY.SLOTS_USED', {
          used: favoriteSlots,
          max: maxSlots
        })}
      >
        {Array.from({ length: maxSlots }, (_, index) => (
          <span
            key={index}
            className={`${styles.slotSegment} ${
              index < favoriteSlots ? styles.slotSegmentFavorite : ''
            }`}
          />
        ))}
      </div>
      <p className={styles.slotMeterNote}>
        {freeSlots === 0
          ? t('LOAD_REPLAY.SLOTS_FULL')
          : t('LOAD_REPLAY.SLOTS_AVAILABLE', { count: freeSlots })}{' '}
        {canUpgrade && (
          <Link to="/premium" className={styles.slotUpgradeLink}>
            {t('LOAD_REPLAY.SLOTS_UPGRADE')}
          </Link>
        )}
      </p>
    </div>
  );
};

const ReplayGame = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const [loadReplay, loadReplayResult] = useLoadReplayMutation();
  const [createSnapshotGame, { isLoading: isStartingSnapshot }] =
    useCreateSnapshotGameMutation();
  const [setReplayFavorite, { isLoading: isUpdatingFavorite }] =
    useSetReplayFavoriteMutation();
  const [shareReplay, { isLoading: isSharing }] = useShareReplayMutation();
  const [deleteReplay] = useDeleteReplayMutation();
  const [deletingReplayNumber, setDeletingReplayNumber] = useState<
    number | null
  >(null);
  const [preparedSnapshot, setPreparedSnapshot] =
    useState<PreparedSnapshot | null>(null);
  const { data: savedReplayData, isLoading: isLoadingSavedReplays } =
    useGetSavedReplaysQuery();

  const {
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

  const isLoadingReplay = isSubmitting || loadReplayResult.isLoading;
  const savedReplays = savedReplayData?.replays ?? [];
  const snapshots = savedReplays.filter((entry) => entry.type === 'snapshot');
  const replays = savedReplays.filter((entry) => entry.type !== 'snapshot');
  const startSnapshot = async (snapshot: SavedReplay) => {
    if (preparedSnapshot?.snapshotNumber === snapshot.replayNumber) return;
    try {
      const result = await createSnapshotGame({
        snapshotNumber: snapshot.replayNumber
      }).unwrap();
      if (
        !result.success ||
        !result.gameName ||
        !result.authKey ||
        !result.inviteToken
      ) {
        throw new Error(result.error || t('LOAD_REPLAY.SNAPSHOT_START_ERROR'));
      }
      const inviteUrl = `${window.location.origin}/snapshot/join?game=${result.gameName}&token=${result.inviteToken}`;
      sessionStorage.setItem(
        `talishar_snapshot_invite_${result.gameName}`,
        inviteUrl
      );
      setPreparedSnapshot({
        snapshotNumber: snapshot.replayNumber,
        gameName: result.gameName,
        playerID: result.playerID,
        authKey: result.authKey,
        inviteUrl
      });
      try {
        await navigator.clipboard.writeText(inviteUrl);
        toast.success(t('LOAD_REPLAY.SNAPSHOT_INVITE_COPIED'));
      } catch {
        toast(t('LOAD_REPLAY.SNAPSHOT_INVITE_VISIBLE'));
      }
    } catch (error) {
      const apiError = error as { data?: { error?: string } };
      toast.error(
        apiError.data?.error ||
          (error instanceof Error
            ? error.message
            : t('LOAD_REPLAY.SNAPSHOT_START_ERROR'))
      );
    }
  };
  const openSnapshotSeat = () => {
    if (!preparedSnapshot) return;
    dispatch(
      setGameStart({
        playerID: preparedSnapshot.playerID,
        gameID: preparedSnapshot.gameName,
        authKey: preparedSnapshot.authKey
      })
    );
    navigate(`/game/play/${preparedSnapshot.gameName}`, {
      state: {
        playerID: preparedSnapshot.playerID,
        authKey: preparedSnapshot.authKey
      } as GameLocationState
    });
  };
  const copySnapshotInvite = async () => {
    if (!preparedSnapshot) return;
    try {
      await navigator.clipboard.writeText(preparedSnapshot.inviteUrl);
      toast.success(t('LOAD_REPLAY.SNAPSHOT_INVITE_COPIED'));
    } catch {
      toast.error(t('LOAD_REPLAY.SNAPSHOT_COPY_FAILED'));
    }
  };
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
  const savedAtLabel = (replay: SavedReplay) => {
    if (!Number.isFinite(replay.savedAt) || replay.savedAt <= 0) {
      return t('LOAD_REPLAY.SAVED_AT_UNKNOWN');
    }

    return t('LOAD_REPLAY.SAVED_AT', {
      date: new Intl.DateTimeFormat(i18n.resolvedLanguage || i18n.language, {
        dateStyle: 'medium',
        timeStyle: 'short'
      }).format(new Date(replay.savedAt * 1000))
    });
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
  const deleteSavedReplay = async (replay: SavedReplay) => {
    if (
      !window.confirm(
        t(
          replay.type === 'snapshot'
            ? 'LOAD_REPLAY.DELETE_SNAPSHOT_CONFIRM'
            : 'LOAD_REPLAY.DELETE_CONFIRM',
          { number: replay.replayNumber }
        )
      )
    ) {
      return;
    }

    setDeletingReplayNumber(replay.replayNumber);
    try {
      await deleteReplay({ replayNumber: replay.replayNumber }).unwrap();
      toast.success(
        t(
          replay.type === 'snapshot'
            ? 'LOAD_REPLAY.DELETE_SNAPSHOT_SUCCESS'
            : 'LOAD_REPLAY.DELETE_SUCCESS',
          { number: replay.replayNumber }
        )
      );
    } catch (error) {
      const apiError = error as { data?: { error?: string } };
      toast.error(apiError.data?.error || t('LOAD_REPLAY.DELETE_ERROR'));
    } finally {
      setDeletingReplayNumber(null);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className={styles.replayForm}>
      <section
        className={styles.savedReplays}
        aria-labelledby="saved-snapshots-heading"
      >
        <div className={styles.savedReplaysHeader}>
          <div>
            <h2 id="saved-snapshots-heading">
              {t('LOAD_REPLAY.SNAPSHOTS_TITLE')}
            </h2>
            <p>{t('LOAD_REPLAY.SNAPSHOTS_SUBTITLE')}</p>
            <p className={styles.favoriteExplanation}>
              {t('LOAD_REPLAY.SNAPSHOTS_TWO_TABS')}
            </p>
          </div>
        </div>
        {savedReplayData?.loggedIn === false ? (
          <p className={styles.emptyReplays}>
            {t('LOAD_REPLAY.SIGN_IN_TO_VIEW')}
          </p>
        ) : !isLoadingSavedReplays && snapshots.length === 0 ? (
          <p className={styles.emptyReplays}>{t('LOAD_REPLAY.NO_SNAPSHOTS')}</p>
        ) : (
          <div className={styles.replayList}>
            {snapshots.map((snapshot) => (
              <article
                key={snapshot.replayNumber}
                className={styles.replayCard}
              >
                <button
                  type="button"
                  className={styles.replayCardMain}
                  onClick={() => startSnapshot(snapshot)}
                  disabled={isStartingSnapshot}
                >
                  <span className={styles.replayNumber}>
                    {t('LOAD_REPLAY.SNAPSHOT_NUMBER', {
                      number: snapshot.replayNumber
                    })}
                  </span>
                  <span className={styles.replayPlayers}>
                    {replayLabel(snapshot)}
                  </span>
                  {heroLabel(snapshot) && (
                    <span className={styles.replayHeroes}>
                      {heroLabel(snapshot)}
                    </span>
                  )}
                  <span className={styles.replaySavedAt}>
                    {savedAtLabel(snapshot)}
                  </span>
                </button>
                <button
                  type="button"
                  className={`${styles.favoriteButton} ${
                    snapshot.favorite ? styles.favoriteActive : ''
                  }`}
                  onClick={() => toggleFavorite(snapshot)}
                  disabled={isUpdatingFavorite}
                  aria-label={`${
                    snapshot.favorite ? 'Remove' : 'Add'
                  } Snapshot #${snapshot.replayNumber} ${
                    snapshot.favorite ? 'from' : 'to'
                  } favorites`}
                  aria-pressed={snapshot.favorite}
                  title={
                    snapshot.favorite
                      ? 'Remove from favorites'
                      : 'Keep this snapshot'
                  }
                >
                  {snapshot.favorite ? <FaStar /> : <FaRegStar />}
                </button>
                <button
                  type="button"
                  className={styles.shareButton}
                  onClick={() => startSnapshot(snapshot)}
                  disabled={isStartingSnapshot}
                  aria-label={t('LOAD_REPLAY.SHARE_SNAPSHOT_ARIA', {
                    number: snapshot.replayNumber
                  })}
                  title={t('LOAD_REPLAY.SHARE_SNAPSHOT')}
                >
                  <MdShare />
                </button>
                <button
                  type="button"
                  className={styles.deleteButton}
                  onClick={() => deleteSavedReplay(snapshot)}
                  disabled={deletingReplayNumber !== null}
                  aria-label={t('LOAD_REPLAY.DELETE_SNAPSHOT_ARIA', {
                    number: snapshot.replayNumber
                  })}
                  title={t('LOAD_REPLAY.DELETE_SNAPSHOT')}
                >
                  <MdDeleteOutline />
                </button>
              </article>
            ))}
          </div>
        )}
        {preparedSnapshot && (
          <div className={styles.snapshotInvitePanel} role="status">
            <h3>
              {t('LOAD_REPLAY.SNAPSHOT_INVITE_READY', {
                number: preparedSnapshot.snapshotNumber
              })}
            </h3>
            <p>{t('LOAD_REPLAY.SNAPSHOT_INVITE_HELP')}</p>
            <input
              aria-label={t('LOAD_REPLAY.SNAPSHOT_INVITE_LABEL')}
              value={preparedSnapshot.inviteUrl}
              readOnly
              onFocus={(event) => event.currentTarget.select()}
            />
            <div className={styles.snapshotInviteActions}>
              <button type="button" onClick={copySnapshotInvite}>
                {t('LOAD_REPLAY.SNAPSHOT_COPY_LINK')}
              </button>
              <button type="button" onClick={openSnapshotSeat}>
                {t('LOAD_REPLAY.SNAPSHOT_OPEN_SEAT')}
              </button>
            </div>
          </div>
        )}
      </section>
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
        {savedReplayData?.loggedIn && (
          <ReplaySlotMeter savedReplayData={savedReplayData} />
        )}
        {savedReplayData?.loggedIn === false ? (
          <p className={styles.emptyReplays}>
            {t('LOAD_REPLAY.SIGN_IN_TO_VIEW')}
          </p>
        ) : !isLoadingSavedReplays && replays.length === 0 ? (
          <p className={styles.emptyReplays}>
            {t('LOAD_REPLAY.NO_SAVED_REPLAYS')}
          </p>
        ) : (
          <div className={styles.replayList}>
            {replays.map((replay: SavedReplay) => (
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
                  <span className={styles.replaySavedAt}>
                    {savedAtLabel(replay)}
                  </span>
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
                <button
                  type="button"
                  className={styles.deleteButton}
                  onClick={() => deleteSavedReplay(replay)}
                  disabled={deletingReplayNumber !== null}
                  aria-label={t('LOAD_REPLAY.DELETE_ARIA_LABEL', {
                    number: replay.replayNumber
                  })}
                  title={t('LOAD_REPLAY.DELETE_REPLAY')}
                >
                  <MdDeleteOutline />
                </button>
              </article>
            ))}
          </div>
        )}
      </section>

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

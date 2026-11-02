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
import { FaPlay, FaRegStar, FaStar } from 'react-icons/fa';
import {
  MdDeleteOutline,
  MdGridView,
  MdShare,
  MdViewList
} from 'react-icons/md';
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
import useAdScript from 'hooks/useAdScript';
import useSupporterStatus from 'hooks/useSupporterStatus';
import { Link } from 'react-router-dom';
import { Trans, useTranslation } from 'react-i18next';
import { generateCroppedImageUrl } from 'utils/cropImages';

interface PreparedSnapshot {
  snapshotNumber: number;
  gameName: number;
  playerID: number;
  authKey: string;
  inviteUrl: string;
}

const LoadReplay = () => {
  const { t } = useTranslation();
  const { showAds } = useSupporterStatus();
  useAdScript(showAds);
  return (
    <main className={styles.pageWrapper}>
      <PageBanner
        title={t('PAGES.REPLAY_TOOL')}
        subtitle={t('LOAD_REPLAY.SUBTITLE')}
      />
      <article className={styles.articleContainer}>
        <ReplayGame />
      </article>
    </main>
  );
};

type SaveFilter = 'all' | 'replays' | 'snapshots' | 'favorites';
type SaveView = 'cards' | 'list';

const SAVE_VIEW_KEY = 'talishar_replay_view_v1';
const UNKNOWN_HERO_CROP = generateCroppedImageUrl('UNKNOWNHERO');

const readSaveView = (): SaveView => {
  try {
    return localStorage.getItem(SAVE_VIEW_KEY) === 'list' ? 'list' : 'cards';
  } catch {
    return 'cards';
  }
};

const HeroCrop = ({ heroId }: { heroId: string }) => (
  <img
    src={heroId ? generateCroppedImageUrl(heroId) : UNKNOWN_HERO_CROP}
    alt=""
    loading="lazy"
    onError={(event) => {
      const image = event.currentTarget;
      if (image.src !== UNKNOWN_HERO_CROP) image.src = UNKNOWN_HERO_CROP;
    }}
  />
);

const ReplaySlotMeter = ({
  savedReplayData
}: {
  savedReplayData: GetSavedReplaysResponse;
}) => {
  const { t } = useTranslation();
  const maxSlots = savedReplayData.maxSlots ?? 0;
  if (maxSlots <= 0) return null;

  const usedSlots = Math.min(
    savedReplayData.usedSlots ?? savedReplayData.replays.length,
    maxSlots
  );
  const favoriteSlots = Math.min(savedReplayData.favoriteSlots ?? 0, usedSlots);
  const otherSlots = usedSlots - favoriteSlots;
  const freeSlots = maxSlots - usedSlots;
  const canUpgrade = savedReplayData.nextSlotTier !== null;
  const usedLabel = t('LOAD_REPLAY.STORAGE_USED', {
    used: usedSlots,
    max: maxSlots
  });

  return (
    <div className={styles.slotMeter}>
      <div className={styles.slotMeterHeader}>
        <span className={styles.slotMeterCount}>{usedLabel}</span>
        {canUpgrade && (
          <Link to="/premium" className={styles.slotUpgradeLink}>
            {t('LOAD_REPLAY.SLOTS_UPGRADE')}
          </Link>
        )}
      </div>
      <div className={styles.slotTrack} role="img" aria-label={usedLabel}>
        {Array.from({ length: maxSlots }, (_, index) => (
          <span
            key={index}
            className={`${styles.slotSegment} ${
              index < favoriteSlots
                ? styles.slotSegmentFavorite
                : index < usedSlots
                ? styles.slotSegmentUsed
                : ''
            }`}
          />
        ))}
      </div>
      <div className={styles.slotLegend}>
        <span>
          <i className={styles.slotSegmentFavorite} />
          {t('LOAD_REPLAY.STORAGE_FAVORITES', { count: favoriteSlots })}
        </span>
        <span>
          <i className={styles.slotSegmentUsed} />
          {t('LOAD_REPLAY.STORAGE_OTHER', { count: otherSlots })}
        </span>
        <span>
          <i />
          {t('LOAD_REPLAY.SLOTS_FREE', { count: freeSlots })}
        </span>
      </div>
      <p className={styles.slotMeterNote}>
        {favoriteSlots === maxSlots
          ? t('LOAD_REPLAY.STORAGE_ALL_FAVORITES')
          : t('LOAD_REPLAY.STORAGE_NOTE')}
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
  const [saveFilter, setSaveFilter] = useState<SaveFilter>('all');
  const [saveView, setSaveView] = useState<SaveView>(readSaveView);
  const [searchQuery, setSearchQuery] = useState('');

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
  const saveCounts: Record<SaveFilter, number> = {
    all: savedReplays.length,
    replays: savedReplays.filter((entry) => entry.type !== 'snapshot').length,
    snapshots: savedReplays.filter((entry) => entry.type === 'snapshot').length,
    favorites: savedReplays.filter((entry) => entry.favorite).length
  };
  const saveFilterLabels: Record<SaveFilter, string> = {
    all: t('LOAD_REPLAY.FILTER_ALL'),
    replays: t('LOAD_REPLAY.FILTER_REPLAYS'),
    snapshots: t('LOAD_REPLAY.FILTER_SNAPSHOTS'),
    favorites: t('LOAD_REPLAY.FILTER_FAVORITES')
  };
  const removedNextNumber =
    (savedReplayData?.maxSlots ?? 0) > 0
      ? savedReplays
          .filter((entry) => !entry.favorite)
          .reduce<number | null>(
            (oldest, entry) =>
              oldest === null || entry.replayNumber < oldest
                ? entry.replayNumber
                : oldest,
            null
          )
      : null;
  const normalizedQuery = searchQuery.trim().toLowerCase();
  const visibleSaves = savedReplays.filter((entry) => {
    if (saveFilter === 'replays' && entry.type === 'snapshot') return false;
    if (saveFilter === 'snapshots' && entry.type !== 'snapshot') return false;
    if (saveFilter === 'favorites' && !entry.favorite) return false;
    if (!normalizedQuery) return true;
    return [
      entry.p1DisplayName,
      entry.p2DisplayName,
      entry.p1HeroName,
      entry.p2HeroName
    ].some((value) => value.toLowerCase().includes(normalizedQuery));
  });
  const emptySavesMessage =
    savedReplays.length === 0
      ? t('LOAD_REPLAY.NO_SAVES')
      : normalizedQuery
      ? t('LOAD_REPLAY.NO_MATCHES')
      : saveFilter === 'replays'
      ? t('LOAD_REPLAY.NO_SAVED_REPLAYS')
      : saveFilter === 'snapshots'
      ? t('LOAD_REPLAY.NO_SNAPSHOTS')
      : t('LOAD_REPLAY.NO_FAVORITES');
  const changeSaveView = (view: SaveView) => {
    setSaveView(view);
    try {
      localStorage.setItem(SAVE_VIEW_KEY, view);
    } catch {
      // The layout choice is a convenience; it still applies for this visit.
    }
  };
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

  const renderSave = (entry: SavedReplay) => {
    const isSnapshot = entry.type === 'snapshot';
    const isList = saveView === 'list';
    const numberLabel = t(
      isSnapshot ? 'LOAD_REPLAY.SNAPSHOT_NUMBER' : 'LOAD_REPLAY.REPLAY_NUMBER',
      { number: entry.replayNumber }
    );
    const heroes = heroLabel(entry);
    const favoriteButton = (
      <button
        type="button"
        className={`${styles.favoriteButton} ${
          entry.favorite ? styles.favoriteActive : ''
        }`}
        onClick={() => toggleFavorite(entry)}
        disabled={isUpdatingFavorite}
        aria-label={`${entry.favorite ? 'Remove' : 'Add'} ${numberLabel} ${
          entry.favorite ? 'from' : 'to'
        } favorites`}
        aria-pressed={entry.favorite}
        title={
          entry.favorite
            ? 'Remove from favorites'
            : isSnapshot
            ? 'Keep this snapshot'
            : 'Keep this replay'
        }
      >
        {entry.favorite ? <FaStar /> : <FaRegStar />}
      </button>
    );

    return (
      <article
        key={entry.replayNumber}
        className={isList ? styles.saveRow : styles.saveCard}
      >
        {isList ? (
          <div className={styles.rowPortraits} aria-hidden="true">
            <HeroCrop heroId={entry.p1HeroCardId} />
            <HeroCrop heroId={entry.p2HeroCardId} />
          </div>
        ) : (
          <div className={styles.matchupArt} aria-hidden="true">
            <HeroCrop heroId={entry.p1HeroCardId} />
            <HeroCrop heroId={entry.p2HeroCardId} />
          </div>
        )}
        <div className={styles.saveInfo}>
          <div className={styles.saveTitleRow}>
            <span className={styles.replayNumber}>{numberLabel}</span>
            {entry.replayNumber === removedNextNumber && (
              <span className={styles.removedNext}>
                {t('LOAD_REPLAY.REMOVED_NEXT')}
              </span>
            )}
            {!isList && favoriteButton}
          </div>
          <span className={styles.replayPlayers} title={replayLabel(entry)}>
            {replayLabel(entry)}
          </span>
          {heroes && (
            <span className={styles.replayHeroes} title={heroes}>
              {heroes}
            </span>
          )}
          <span className={styles.replaySavedAt}>{savedAtLabel(entry)}</span>
        </div>
        <div className={styles.saveActions}>
          <button
            type="button"
            className={styles.openButton}
            onClick={() =>
              isSnapshot
                ? startSnapshot(entry)
                : onSubmit({ replayNumber: entry.replayNumber })
            }
            disabled={isSnapshot ? isStartingSnapshot : isLoadingReplay}
          >
            <FaPlay aria-hidden="true" />
            {isSnapshot ? t('LOAD_REPLAY.START_GAME') : t('LOAD_REPLAY.WATCH')}
          </button>
          {isList && favoriteButton}
          <button
            type="button"
            className={styles.shareButton}
            onClick={() =>
              isSnapshot ? startSnapshot(entry) : shareSavedReplay(entry)
            }
            disabled={isSnapshot ? isStartingSnapshot : isSharing}
            aria-label={
              isSnapshot
                ? t('LOAD_REPLAY.SHARE_SNAPSHOT_ARIA', {
                    number: entry.replayNumber
                  })
                : `Copy a shareable link for Replay #${entry.replayNumber}`
            }
            title={
              isSnapshot
                ? t('LOAD_REPLAY.SHARE_SNAPSHOT')
                : t('LOAD_REPLAY.COPY_SHAREABLE_LINK')
            }
          >
            <MdShare />
          </button>
          <button
            type="button"
            className={styles.deleteButton}
            onClick={() => deleteSavedReplay(entry)}
            disabled={deletingReplayNumber !== null}
            aria-label={
              isSnapshot
                ? t('LOAD_REPLAY.DELETE_SNAPSHOT_ARIA', {
                    number: entry.replayNumber
                  })
                : t('LOAD_REPLAY.DELETE_ARIA_LABEL', {
                    number: entry.replayNumber
                  })
            }
            title={
              isSnapshot
                ? t('LOAD_REPLAY.DELETE_SNAPSHOT')
                : t('LOAD_REPLAY.DELETE_REPLAY')
            }
          >
            <MdDeleteOutline />
          </button>
        </div>
      </article>
    );
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className={styles.replayForm}>
      <section
        className={styles.savedReplays}
        aria-labelledby="saved-replays-heading"
      >
        <div className={styles.savedReplaysHeader}>
          <div>
            <h2 id="saved-replays-heading">{t('LOAD_REPLAY.SAVES_TITLE')}</h2>
            <p>{t('LOAD_REPLAY.SAVES_SUBTITLE')}</p>
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
        ) : (
          <>
            {savedReplayData?.loggedIn && (
              <ReplaySlotMeter savedReplayData={savedReplayData} />
            )}
            {preparedSnapshot && (
              <div className={styles.snapshotInvitePanel} role="status">
                <h3>
                  {t('LOAD_REPLAY.SNAPSHOT_INVITE_READY', {
                    number: preparedSnapshot.snapshotNumber
                  })}
                </h3>
                <p>
                  {t('LOAD_REPLAY.SNAPSHOT_INVITE_HELP')}{' '}
                  {t('LOAD_REPLAY.SNAPSHOTS_TWO_TABS')}
                </p>
                <div className={styles.snapshotInviteRow}>
                  <input
                    aria-label={t('LOAD_REPLAY.SNAPSHOT_INVITE_LABEL')}
                    value={preparedSnapshot.inviteUrl}
                    readOnly
                    onFocus={(event) => event.currentTarget.select()}
                  />
                  <button
                    type="button"
                    className={styles.snapshotCopyButton}
                    onClick={copySnapshotInvite}
                  >
                    {t('LOAD_REPLAY.SNAPSHOT_COPY_LINK')}
                  </button>
                  <button type="button" onClick={openSnapshotSeat}>
                    {t('LOAD_REPLAY.SNAPSHOT_OPEN_SEAT')}
                  </button>
                </div>
              </div>
            )}
            <div className={styles.saveToolbar}>
              <div
                className={styles.segmented}
                role="group"
                aria-label={t('LOAD_REPLAY.FILTER_LABEL')}
              >
                {(
                  ['all', 'replays', 'snapshots', 'favorites'] as SaveFilter[]
                ).map((value) => (
                  <button
                    key={value}
                    type="button"
                    aria-pressed={saveFilter === value}
                    onClick={() => setSaveFilter(value)}
                    className={saveFilter === value ? styles.activeSegment : ''}
                  >
                    {saveFilterLabels[value]}
                    <span className={styles.segmentCount}>
                      {saveCounts[value]}
                    </span>
                  </button>
                ))}
              </div>
              <div className={styles.saveToolbarEnd}>
                <input
                  type="search"
                  className={styles.saveSearch}
                  value={searchQuery}
                  onChange={(event) => setSearchQuery(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter') event.preventDefault();
                  }}
                  placeholder={t('LOAD_REPLAY.SEARCH_PLACEHOLDER')}
                  aria-label={t('LOAD_REPLAY.SEARCH_LABEL')}
                />
                <div
                  className={styles.segmented}
                  role="group"
                  aria-label={t('LOAD_REPLAY.VIEW_LABEL')}
                >
                  <button
                    type="button"
                    aria-pressed={saveView === 'cards'}
                    onClick={() => changeSaveView('cards')}
                    className={saveView === 'cards' ? styles.activeSegment : ''}
                    aria-label={t('LOAD_REPLAY.VIEW_CARDS')}
                    title={t('LOAD_REPLAY.VIEW_CARDS')}
                  >
                    <MdGridView aria-hidden="true" />
                  </button>
                  <button
                    type="button"
                    aria-pressed={saveView === 'list'}
                    onClick={() => changeSaveView('list')}
                    className={saveView === 'list' ? styles.activeSegment : ''}
                    aria-label={t('LOAD_REPLAY.VIEW_LIST')}
                    title={t('LOAD_REPLAY.VIEW_LIST')}
                  >
                    <MdViewList aria-hidden="true" />
                  </button>
                </div>
              </div>
            </div>
            {!isLoadingSavedReplays && visibleSaves.length === 0 ? (
              <p className={styles.emptyReplays}>{emptySavesMessage}</p>
            ) : (
              <div
                className={
                  saveView === 'list' ? styles.saveList : styles.replayList
                }
              >
                {visibleSaves.map(renderSave)}
              </div>
            )}
          </>
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

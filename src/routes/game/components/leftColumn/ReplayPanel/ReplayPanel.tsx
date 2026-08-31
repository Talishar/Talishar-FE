import React, { useEffect, useId, useMemo, useState } from 'react';
import { useAppDispatch, useAppSelector } from 'app/Hooks';
import {
  submitButton,
  getGameInfo,
  setReplayStart,
  setSpectatorCameraView
} from 'features/game/GameSlice';
import { RootState } from 'app/Store';
import { selectIsPatron } from 'features/auth/authSlice';
import { useLocation, useNavigate } from 'react-router-dom';
import { createPortal } from 'react-dom';
import styles from './ReplayPanel.module.css';
import { toast } from 'react-hot-toast';
import { PROCESS_INPUT } from 'appConstants';
import { MdClose, MdShare, MdSwapVert } from 'react-icons/md';
import { useTranslation } from 'react-i18next';
import {
  useGetReplayTurnsQuery,
  useLoadReplayMutation,
  useShareReplayMutation
} from 'features/api/apiSlice';
import { GameLocationState } from 'interface/GameLocationState';
import { usePlayerInputInProgress } from 'hooks/usePlayerInputInProgress';
import {
  REPLAY_PLAYBACK_SPEEDS,
  ReplayPlaybackSpeed,
  useReplayPlayback
} from '../../../play/ReplayPlaybackContext';

const TURN_MARKER_RE = /^\[\[TURN_START:(\d+):(\d+)\]\]$/;
const COMBAT_RE =
  /\b(?:played|activated|blocked with|attack|chain link|combat resolved)\b/i;
const DAMAGE_RE = /\b(?:damage|lost life|gained life|won|conceded|forfeit)\b/i;

type ReplayTurn = {
  number: number;
  player: 1 | 2;
  hasCombat: boolean;
  hasDamage: boolean;
};

function toPlainText(message: string) {
  return message
    .replace(/<[^>]+>/g, '')
    .replace(/{{.*?\|(.+?)(?:\|.*?)?}}/g, '$1');
}

function getChatReplayTurns(chatLog: string[] | undefined): ReplayTurn[] {
  const turns: ReplayTurn[] = [];
  let activeTurn: ReplayTurn | undefined;

  for (const message of chatLog ?? []) {
    const text = toPlainText(message);
    const marker = text.match(TURN_MARKER_RE);
    if (marker) {
      activeTurn = {
        number: Number(marker[1]),
        player: Number(marker[2]) as 1 | 2,
        hasCombat: false,
        hasDamage: false
      };
      turns.push(activeTurn);
      continue;
    }
    if (activeTurn) {
      activeTurn.hasCombat ||= COMBAT_RE.test(text);
      activeTurn.hasDamage ||= DAMAGE_RE.test(text);
    }
  }

  return turns;
}

export default function ReplayPanel() {
  const [isOpen, setIsOpen] = useState(false);
  const gameInfo = useAppSelector(getGameInfo);
  const location = useLocation();
  const { t } = useTranslation();

  if (!gameInfo.isReplay || location.pathname.includes('/create')) return null;

  return createPortal(
    <>
      <button
        className={`${styles.replayTab} ${isOpen ? styles.hidden : ''}`}
        onClick={() => setIsOpen(true)}
        title={t('MATCH_REVIEW.OPEN_MATCH_REVIEW')}
        aria-label={t('MATCH_REVIEW.OPEN_MATCH_REVIEW')}
      >
        {t('MATCH_REVIEW.REPLAY')}
      </button>
      {isOpen && (
        <ReplayContent gameInfo={gameInfo} onClose={() => setIsOpen(false)} />
      )}
    </>,
    document.body
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
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { t } = useTranslation();
  const chatLog = useAppSelector((state: RootState) => state.game.chatLog);
  const currentTurnNumber = useAppSelector(
    (state: RootState) => state.game.gameDynamicInfo.turnNo
  );
  const currentTurnPlayer = useAppSelector(
    (state: RootState) => state.game.turnPlayer
  );
  const localPlayerName = useAppSelector(
    (state: RootState) => state.game.playerOne.Name
  );
  const localOpponentName = useAppSelector(
    (state: RootState) => state.game.playerTwo.Name
  );
  const spectatorCameraView = useAppSelector(
    (state: RootState) => state.game.spectatorCameraView
  );
  const isPatron = useAppSelector(selectIsPatron);
  const [shareReplay, { isLoading: isSharing }] = useShareReplayMutation();
  const [reloadReplay, { isLoading: isReloadingReplay }] =
    useLoadReplayMutation();
  const { data: savedTurnsData } = useGetReplayTurnsQuery(gameInfo.gameID, {
    skip: !gameInfo.gameID
  });
  const [turnNumber, setTurnNumber] = useState(String(currentTurnNumber ?? 0));
  const [selectedTurnKey, setSelectedTurnKey] = useState(
    currentTurnNumber !== undefined &&
      (currentTurnPlayer === 1 || currentTurnPlayer === 2)
      ? `${currentTurnPlayer}-${currentTurnNumber}`
      : ''
  );
  const isRequestInProgress = usePlayerInputInProgress();
  const {
    pausePlayback,
    playbackSpeed,
    setPlaybackSpeed,
    setUseSpaceToAdvanceOneStep,
    useSpaceToAdvanceOneStep
  } = useReplayPlayback();

  const chatTurns = useMemo(() => getChatReplayTurns(chatLog), [chatLog]);
  const chatTurnsByKey = useMemo(
    () =>
      new Map(chatTurns.map((turn) => [`${turn.player}-${turn.number}`, turn])),
    [chatTurns]
  );
  const reviewTurns = useMemo<ReplayTurn[]>(() => {
    const savedTurns: Array<{ player: 1 | 2; number: number }> =
      savedTurnsData?.turns ?? [];
    if (savedTurns.length) {
      return savedTurns.map((turn) => {
        const chatTurn = chatTurnsByKey.get(`${turn.player}-${turn.number}`);
        return {
          ...turn,
          hasCombat: chatTurn?.hasCombat ?? false,
          hasDamage: chatTurn?.hasDamage ?? false
        };
      });
    }
    if (
      chatTurns.length ||
      !currentTurnNumber ||
      (currentTurnPlayer !== 1 && currentTurnPlayer !== 2)
    )
      return chatTurns;
    return [
      {
        number: currentTurnNumber,
        player: currentTurnPlayer,
        hasCombat: false,
        hasDamage: false
      }
    ];
  }, [
    chatTurns,
    chatTurnsByKey,
    savedTurnsData,
    currentTurnNumber,
    currentTurnPlayer
  ]);
  const selectedTurn = Number(turnNumber);
  const maxSavedTurn = Math.max(0, ...reviewTurns.map((turn) => turn.number));
  const playerNames: Record<1 | 2, string> =
    gameInfo.playerID === 1
      ? { 1: localPlayerName || 'Player 1', 2: localOpponentName || 'Player 2' }
      : {
          1: localOpponentName || 'Player 1',
          2: localPlayerName || 'Player 2'
        };
  const canScrollTimeline = reviewTurns.length > 3;
  const cameraView: 1 | 2 = spectatorCameraView === 2 ? 2 : 1;
  const nextCameraView: 1 | 2 = cameraView === 1 ? 2 : 1;

  const toggleCameraView = () => {
    dispatch(setSpectatorCameraView(nextCameraView));
  };

  useEffect(() => {
    if (currentTurnNumber !== undefined) {
      setTurnNumber(String(currentTurnNumber));
      setSelectedTurnKey(
        currentTurnPlayer === 1 || currentTurnPlayer === 2
          ? `${currentTurnPlayer}-${currentTurnNumber}`
          : ''
      );
    }
  }, [currentTurnNumber, currentTurnPlayer]);

  const loadTurn = (turn: ReplayTurn | { number: number; player?: number }) => {
    if (
      isRequestInProgress ||
      !Number.isInteger(turn.number) ||
      turn.number < 0
    )
      return;
    pausePlayback();
    const target =
      turn.player === 1 || turn.player === 2
        ? `${turn.player}-${turn.number}`
        : String(turn.number);
    setTurnNumber(String(turn.number));
    setSelectedTurnKey(
      turn.player === 1 || turn.player === 2
        ? `${turn.player}-${turn.number}`
        : ''
    );
    const request = dispatch(
      submitButton({
        button: { mode: PROCESS_INPUT.HOP_TO_TURN, cardID: target }
      })
    ).unwrap();
    toast.promise(request, {
      loading: `Loading turn ${turn.number}…`,
      success: `Turn ${turn.number} loaded`,
      error: 'Unable to load that turn'
    });
  };

  const moveToAdjacent = (direction: -1 | 1, importantOnly = false) => {
    const targets = importantOnly
      ? reviewTurns.filter((turn) => turn.hasCombat || turn.hasDamage)
      : reviewTurns;
    if (!targets.length) return;
    const currentIndex = targets.findIndex(
      (turn) => `${turn.player}-${turn.number}` === selectedTurnKey
    );
    const nextIndex =
      currentIndex >= 0
        ? currentIndex + direction
        : direction === 1
        ? targets.findIndex((turn) => turn.number >= selectedTurn)
        : [...targets].map((turn) => turn.number).lastIndexOf(selectedTurn);
    const next = targets[nextIndex];
    if (next) loadTurn(next);
  };

  const loadInputTurn = () => {
    const requestedTurn = Number(turnNumber);
    if (
      requestedTurn !== 0 &&
      !reviewTurns.some((turn) => turn.number === requestedTurn)
    ) {
      toast.error(
        maxSavedTurn
          ? `Enter a saved turn between 1 and ${maxSavedTurn}, or 0 for the start.`
          : 'Saved turns are still loading.'
      );
      return;
    }
    loadTurn({ number: requestedTurn });
  };

  const returnToStart = async () => {
    pausePlayback();
    if (!gameInfo?.replayNumber) {
      loadTurn({ number: 0 });
      return;
    }

    try {
      const response = await reloadReplay({
        replayNumber: gameInfo.replayNumber
      }).unwrap();
      if (
        response.error ||
        !response.playerID ||
        !response.gameName ||
        !response.authKey
      ) {
        throw new Error(response.error || 'Unable to restart this replay.');
      }
      dispatch(
        setReplayStart({
          playerID: response.playerID,
          gameID: response.gameName,
          authKey: response.authKey,
          replayNumber: gameInfo.replayNumber
        })
      );
      navigate(`/game/play/${response.gameName}`, {
        state: { playerID: response.playerID } as GameLocationState
      });
      toast.success('Returned to the start of the replay.');
    } catch (error: any) {
      toast.error(
        error?.message || error?.data?.error || 'Unable to restart this replay.'
      );
    }
  };

  const handleShare = async () => {
    if (!gameInfo?.replayNumber)
      return toast.error(
        'Replay number not available. Please reload the replay.'
      );
    try {
      const result = await shareReplay({
        replayNumber: gameInfo.replayNumber
      }).unwrap();
      if (result.error) throw new Error(result.error);
      await navigator.clipboard.writeText(
        `${window.location.origin}/replay/shared?token=${result.token}`
      );
      toast.success('Share link copied to clipboard!');
    } catch (err: any) {
      toast.error(
        err?.message || err?.data?.error || 'Failed to create share link.'
      );
    }
  };

  return (
    <aside
      className={styles.replayPanel}
      aria-label={t('MATCH_REVIEW.MATCH_REVIEW')}
    >
      <div className={styles.header}>
        <div>
          <h3>{t('MATCH_REVIEW.MATCH_REVIEW_TITLE')}</h3>
          <span className={styles.subheading}>
            {t('MATCH_REVIEW.JUMP_TO_ANY_SAVED_TURN')}
          </span>
        </div>
        <button
          type="button"
          className={styles.closeButton}
          onClick={onClose}
          aria-label={t('MATCH_REVIEW.CLOSE_MATCH_REVIEW')}
        >
          <MdClose aria-hidden="true" />
        </button>
      </div>
      <div className={styles.content}>
        <section className={styles.playbackSection}>
          <div className={styles.sectionHeading}>
            <span>{t('MATCH_REVIEW.PLAYBACK')}</span>
          </div>
          <label className={styles.stepModeToggle}>
            <input
              type="checkbox"
              checked={useSpaceToAdvanceOneStep}
              onChange={(event) =>
                setUseSpaceToAdvanceOneStep(event.target.checked)
              }
            />
            <span>{t('MATCH_REVIEW.SPACE_ADVANCES_ONE_STEP')}</span>
          </label>
          <label className={styles.speedControl}>
            <span>{t('MATCH_REVIEW.PLAYBACK_SPEED')}</span>
            <select
              value={playbackSpeed}
              onChange={(event) =>
                setPlaybackSpeed(
                  Number(event.target.value) as ReplayPlaybackSpeed
                )
              }
              disabled={useSpaceToAdvanceOneStep}
            >
              {REPLAY_PLAYBACK_SPEEDS.map((speed) => (
                <option key={speed} value={speed}>
                  {speed}×
                </option>
              ))}
            </select>
          </label>
          <div className={styles.cameraControl}>
            <span className={styles.cameraCurrent}>
              {t('MATCH_REVIEW.CAMERA')}: {playerNames[cameraView]}
            </span>
            <button
              type="button"
              className={styles.cameraButton}
              onClick={toggleCameraView}
              title={t('MATCH_REVIEW.SWITCH_CAMERA')}
              aria-label={t('MATCH_REVIEW.SWITCH_CAMERA')}
            >
              <MdSwapVert aria-hidden="true" />
              <span>P{nextCameraView}</span>
            </button>
          </div>
        </section>
        <section
          className={styles.timelineSection}
          aria-label={t('MATCH_REVIEW.TURN_TIMELINE')}
        >
          <div className={styles.sectionHeading}>
            <span>{t('MATCH_REVIEW.TIMELINE')}</span>
            <span>
              {reviewTurns.length
                ? `${reviewTurns.length} saved ${
                    reviewTurns.length === 1 ? 'turn' : 'turns'
                  }${canScrollTimeline ? ' - scroll right' : ''}`
                : 'Builds as you review'}
            </span>
          </div>
          {reviewTurns.length ? (
            <div
              className={styles.timeline}
              role="list"
              aria-label={t('MATCH_REVIEW.TIMELINE_ARIA')}
            >
              {reviewTurns.map((turn) => (
                <button
                  key={`${turn.player}-${turn.number}`}
                  className={`${styles.turnMarker} ${
                    `${turn.player}-${turn.number}` === selectedTurnKey
                      ? styles.activeTurn
                      : ''
                  }`}
                  onClick={() => loadTurn(turn)}
                  disabled={isRequestInProgress}
                  aria-label={`Load turn ${turn.number}, ${
                    playerNames[turn.player]
                  }`}
                >
                  <span className={styles.turnNumber}>
                    {t('MATCH_REVIEW.TURN')} {turn.number}
                  </span>
                  <span className={styles.turnPlayer}>
                    {playerNames[turn.player]}
                  </span>
                  {(turn.hasCombat || turn.hasDamage) && (
                    <span className={styles.turnEventSummary}>
                      {turn.hasCombat && 'Combat'}
                      {turn.hasCombat && turn.hasDamage && ' / '}
                      {turn.hasDamage && 'Life changed'}
                    </span>
                  )}
                  {(turn.hasCombat || turn.hasDamage) && (
                    <span
                      className={styles.turnEvents}
                      aria-label={`${turn.hasCombat ? 'combat' : ''}${
                        turn.hasCombat && turn.hasDamage ? ' and ' : ''
                      }${turn.hasDamage ? 'damage' : ''}`}
                    >
                      {turn.hasCombat && '⚔'}
                      {turn.hasDamage && '♥'}
                    </span>
                  )}
                </button>
              ))}
            </div>
          ) : (
            <p className={styles.emptyTimeline}>
              {t('MATCH_REVIEW.TIMELINE_EMPTY')}
            </p>
          )}
        </section>

        <div className={styles.navButtons}>
          <button
            className={styles.navButton}
            onClick={() => moveToAdjacent(-1)}
            disabled={isRequestInProgress || !reviewTurns.length}
            title={t('MATCH_REVIEW.PREVIOUS_TURN')}
          >
            <span className={styles.navArrow} aria-hidden="true">
              &larr;
            </span>
            <span>{t('MATCH_REVIEW.PREVIOUS_TURN')}</span>
            <span className={styles.navArrowPlaceholder} aria-hidden="true" />
          </button>
          <button
            className={styles.navButton}
            onClick={() => moveToAdjacent(1)}
            disabled={isRequestInProgress || !reviewTurns.length}
            title={t('MATCH_REVIEW.NEXT_TURN')}
          >
            <span className={styles.navArrowPlaceholder} aria-hidden="true" />
            <span>{t('MATCH_REVIEW.NEXT_TURN')}</span>
            <span className={styles.navArrow} aria-hidden="true">
              &rarr;
            </span>
          </button>
        </div>
        <div className={styles.divider} />
        <div className={styles.formGroup}>
          <label htmlFor={turnInputId}>
            {t('MATCH_REVIEW.JUMP_DIRECTLY_TO_TURN')}
            {` (0-${maxSavedTurn})`}
          </label>
          <div className={styles.jumpRow}>
            <input
              id={turnInputId}
              type="number"
              min="0"
              max={maxSavedTurn || undefined}
              value={turnNumber}
              onChange={(event) => setTurnNumber(event.target.value)}
              disabled={isRequestInProgress}
            />
            <button
              className={styles.submitButton}
              onClick={loadInputTurn}
              disabled={isRequestInProgress}
            >
              {t('MATCH_REVIEW.GO')}
            </button>
          </div>
        </div>
        <button
          className={styles.actionButton}
          onClick={returnToStart}
          disabled={isRequestInProgress || isReloadingReplay}
        >
          {isReloadingReplay
            ? t('MATCH_REVIEW.RETURNING_TO_START')
            : t('MATCH_REVIEW.RETURN_TO_START')}
        </button>
        {isPatron && gameInfo?.replayNumber && (
          <button
            className={styles.actionButton}
            onClick={handleShare}
            disabled={isSharing}
            title={t('MATCH_REVIEW.COPY_SHAREABLE_LINK')}
          >
            <MdShare />{' '}
            {isSharing
              ? t('MATCH_REVIEW.SHARING')
              : t('MATCH_REVIEW.SHARE_REPLAY')}
          </button>
        )}
      </div>
    </aside>
  );
}

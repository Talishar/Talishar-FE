import React, { useEffect, useId, useMemo, useState } from 'react';
import { useAppDispatch, useAppSelector } from 'app/Hooks';
import {
  submitButton,
  getGameInfo,
  setSpectatorCameraView
} from 'features/game/GameSlice';
import { RootState } from 'app/Store';
import { selectIsPatron } from 'features/auth/authSlice';
import { useLocation } from 'react-router-dom';
import styles from './ReplayPanel.module.css';
import { toast } from 'react-hot-toast';
import { PROCESS_INPUT } from 'appConstants';
import { MdSwapVert, MdShare } from 'react-icons/md';
import { useShareReplayMutation } from 'features/api/apiSlice';

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

function getReplayTurns(chatLog: string[] | undefined): ReplayTurn[] {
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

  if (!gameInfo.isReplay || location.pathname.includes('/create')) return null;

  return (
    <>
      <button
        className={`${styles.replayTab} ${isOpen ? styles.hidden : ''}`}
        onClick={() => setIsOpen(true)}
        title="Open match review"
        aria-label="Open match review"
      >
        Replay
      </button>
      {isOpen && (
        <ReplayContent gameInfo={gameInfo} onClose={() => setIsOpen(false)} />
      )}
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
  const dispatch = useAppDispatch();
  const chatLog = useAppSelector((state: RootState) => state.game.chatLog);
  const currentTurnNumber = useAppSelector(
    (state: RootState) => state.game.gameDynamicInfo.turnNo
  );
  const currentTurnPlayer = useAppSelector(
    (state: RootState) => state.game.turnPlayer
  );
  const spectatorCameraView = useAppSelector(
    (state: RootState) => state.game.spectatorCameraView
  );
  const localPlayerName = useAppSelector(
    (state: RootState) => state.game.playerOne.Name
  );
  const localOpponentName = useAppSelector(
    (state: RootState) => state.game.playerTwo.Name
  );
  const isPatron = useAppSelector(selectIsPatron);
  const [shareReplay, { isLoading: isSharing }] = useShareReplayMutation();
  const [turnNumber, setTurnNumber] = useState(String(currentTurnNumber ?? 0));
  const [isRequestInProgress, setIsRequestInProgress] = useState(false);

  const turns = useMemo(() => getReplayTurns(chatLog), [chatLog]);
  const reviewTurns = useMemo(() => {
    if (
      turns.length ||
      !currentTurnNumber ||
      (currentTurnPlayer !== 1 && currentTurnPlayer !== 2)
    )
      return turns;
    return [
      {
        number: currentTurnNumber,
        player: currentTurnPlayer,
        hasCombat: false,
        hasDamage: false
      }
    ];
  }, [turns, currentTurnNumber, currentTurnPlayer]);
  const selectedTurn = Number(turnNumber);
  const playerNames: Record<1 | 2, string> =
    gameInfo.playerID === 1
      ? { 1: localPlayerName || 'Player 1', 2: localOpponentName || 'Player 2' }
      : {
          1: localOpponentName || 'Player 1',
          2: localPlayerName || 'Player 2'
        };
  const canScrollTimeline = reviewTurns.length > 3;

  useEffect(() => {
    if (currentTurnNumber !== undefined)
      setTurnNumber(String(currentTurnNumber));
  }, [currentTurnNumber]);

  const loadTurn = (turn: ReplayTurn | { number: number; player?: number }) => {
    if (
      isRequestInProgress ||
      !Number.isInteger(turn.number) ||
      turn.number < 0
    )
      return;
    const target =
      turn.player === 1 || turn.player === 2
        ? `${turn.player}-${turn.number}`
        : String(turn.number);
    setIsRequestInProgress(true);
    setTurnNumber(String(turn.number));
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
    request.finally(() => setIsRequestInProgress(false));
  };

  const moveToAdjacent = (direction: -1 | 1, importantOnly = false) => {
    const targets = importantOnly
      ? reviewTurns.filter((turn) => turn.hasCombat || turn.hasDamage)
      : reviewTurns;
    if (!targets.length) return;
    const currentIndex = targets.findIndex(
      (turn) =>
        turn.number === selectedTurn &&
        (!currentTurnPlayer || turn.player === currentTurnPlayer)
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
      toast.error(err?.message || 'Failed to create share link.');
    }
  };

  return (
    <aside className={styles.replayPanel} aria-label="Match review">
      <div className={styles.header}>
        <div>
          <h3>Match Review</h3>
          <span className={styles.subheading}>Jump to any saved turn</span>
        </div>
        <button
          className={styles.closeButton}
          onClick={onClose}
          aria-label="Close match review"
        >
          ×
        </button>
      </div>
      <div className={styles.content}>
        <section className={styles.timelineSection} aria-label="Turn timeline">
          <div className={styles.sectionHeading}>
            <span>Timeline</span>
            <span>
              {reviewTurns.length
                ? `${reviewTurns.length} ${
                    reviewTurns.length === 1 ? 'turn' : 'turns'
                  }${canScrollTimeline ? ' - scroll right' : ''}`
                : 'Builds as you review'}
            </span>
          </div>
          {reviewTurns.length ? (
            <div
              className={styles.timeline}
              role="list"
              aria-label="Replay turn timeline. Scroll horizontally for more turns."
            >
              {reviewTurns.map((turn) => (
                <button
                  key={`${turn.player}-${turn.number}`}
                  className={`${styles.turnMarker} ${
                    turn.number === selectedTurn ? styles.activeTurn : ''
                  }`}
                  onClick={() => loadTurn(turn)}
                  disabled={isRequestInProgress}
                  aria-label={`Load turn ${turn.number}, ${
                    playerNames[turn.player]
                  }`}
                >
                  <span className={styles.turnNumber}>Turn {turn.number}</span>
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
              Turn markers appear here as the replay progresses. You can still
              jump directly below.
            </p>
          )}
        </section>

        <div className={styles.navButtons}>
          <button
            className={styles.navButton}
            onClick={() => moveToAdjacent(-1)}
            disabled={isRequestInProgress || !reviewTurns.length}
            title="Previous turn"
          >
            <span className={styles.navArrow} aria-hidden="true">
              &larr;
            </span>
            <span>Previous turn</span>
            <span className={styles.navArrowPlaceholder} aria-hidden="true" />
          </button>
          <button
            className={styles.navButton}
            onClick={() => moveToAdjacent(1)}
            disabled={isRequestInProgress || !reviewTurns.length}
            title="Next turn"
          >
            <span className={styles.navArrowPlaceholder} aria-hidden="true" />
            <span>Next turn</span>
            <span className={styles.navArrow} aria-hidden="true">
              &rarr;
            </span>
          </button>
        </div>
        <div className={styles.navButtons}>
          <button
            className={styles.eventButton}
            onClick={() => moveToAdjacent(-1, true)}
            disabled={
              isRequestInProgress ||
              !reviewTurns.some((turn) => turn.hasCombat || turn.hasDamage)
            }
          >
            Previous key event
          </button>
          <button
            className={styles.eventButton}
            onClick={() => moveToAdjacent(1, true)}
            disabled={
              isRequestInProgress ||
              !reviewTurns.some((turn) => turn.hasCombat || turn.hasDamage)
            }
          >
            Next key event
          </button>
        </div>

        <div className={styles.divider} />
        <div className={styles.formGroup}>
          <label htmlFor={turnInputId}>Jump directly to turn</label>
          <div className={styles.jumpRow}>
            <input
              id={turnInputId}
              type="number"
              min="0"
              value={turnNumber}
              onChange={(event) => setTurnNumber(event.target.value)}
              disabled={isRequestInProgress}
            />
            <button
              className={styles.submitButton}
              onClick={() => loadTurn({ number: Number(turnNumber) })}
              disabled={isRequestInProgress}
            >
              Go
            </button>
          </div>
        </div>
        <button
          className={styles.actionButton}
          onClick={() => loadTurn({ number: 0 })}
          disabled={isRequestInProgress}
        >
          Return to start
        </button>

        <div className={styles.divider} />
        <button
          className={styles.actionButton}
          onClick={() =>
            dispatch(setSpectatorCameraView(spectatorCameraView === 1 ? 2 : 1))
          }
          title={`Switch to Player ${
            spectatorCameraView === 1 ? 2 : 1
          } perspective`}
        >
          <MdSwapVert /> P{spectatorCameraView === 1 ? '2' : '1'} view
        </button>
        {isPatron && gameInfo?.replayNumber && (
          <button
            className={styles.actionButton}
            onClick={handleShare}
            disabled={isSharing}
            title="Copy a shareable link for this replay"
          >
            <MdShare /> {isSharing ? 'Sharing…' : 'Share replay'}
          </button>
        )}
      </div>
    </aside>
  );
}

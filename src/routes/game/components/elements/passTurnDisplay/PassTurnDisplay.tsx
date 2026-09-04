import React, {
  useEffect,
  useState,
  useCallback,
  useMemo,
  useRef
} from 'react';
import { useTranslation } from 'react-i18next';
import { submitButton, getGameInfo } from 'features/game/GameSlice';
import { useAppSelector, useAppDispatch } from 'app/Hooks';
import { RootState } from 'app/Store';
import styles from './PassTurnDisplay.module.css';
import classNames from 'classnames';
import { shallowEqual } from 'react-redux';
import { DEFAULT_SHORTCUTS, PROCESS_INPUT } from 'appConstants';
import useShortcut from 'hooks/useShortcut';
import useSetting from 'hooks/useSetting';
import useSound from 'use-sound';
import passTurnSound from 'sounds/prioritySound.wav';
import { createPortal } from 'react-dom';
import {
  getSettingsEntity,
  updateOptions
} from 'features/options/optionsSlice';
import {
  AUTO_PASS_TURN,
  DISABLE_HOLD_TO_AUTO_PASS
} from 'features/options/constants';
import { useReplayPlayback } from '../../../play/ReplayPlaybackContext';

// Arming AUTO affects every remaining priority window this turn, so require a
// clearly deliberate hold rather than treating an ordinary slow click as one.
const MOUSE_LONG_PRESS_MS = 900;
const TOUCH_LONG_PRESS_MS = 1200;
const HOLD_HINT_DELAY_MS = 180;
const HOLD_MOVE_TOLERANCE_PX = 12;
const TOUCH_HOLD_MOVE_TOLERANCE_PX = 18;

type HoldSession = {
  pointerId: number | null;
  origin: { x: number; y: number } | null;
  tolerance: number;
  thresholdMs: number;
  startedAt: number;
  hintShown: boolean;
  frame: number | null;
  onComplete: () => void;
};

function passSubtitle(
  turnPhase: string | undefined,
  t: (key: string) => string
): string {
  switch (turnPhase) {
    case 'B': // Defend step
      return t('PASS_TURN_DISPLAY.BLOCK');
    case 'A': // Attack reaction step
    case 'D': // Defense reaction step
      return t('PASS_TURN_DISPLAY.REACTION');
    case 'ARS': // End step
    case 'PDECK':
      return t('PASS_TURN_DISPLAY.END_TURN');
    case 'M': // Action phase
    default:
      return t('PASS_TURN_DISPLAY.PRIORITY');
  }
}

export default function PassTurnDisplay() {
  const { t } = useTranslation();
  const canPassPhase = useAppSelector(
    (state: RootState) => state.game.canPassPhase
  );
  const hasPriority = useAppSelector(
    (state: RootState) => state.game.hasPriority
  );
  const frameNumber = useAppSelector(
    (state: RootState) => state.game.gameDynamicInfo.lastUpdate
  );
  const playerID = useAppSelector(
    (state: RootState) => state.game.gameInfo.playerID
  );
  const isReplay = useAppSelector(
    (state: RootState) => state.game.gameInfo.isReplay
  );
  const priorityPlayer = useAppSelector(
    (state: RootState) => state.game.priorityPlayer
  );
  const turnPhaseEnum = useAppSelector(
    (state: RootState) => state.game.turnPhase?.turnPhase
  );
  const spectatorCameraView = useAppSelector(
    (state: RootState) => state.game.spectatorCameraView
  );
  const gameInfo = useAppSelector(getGameInfo, shallowEqual);
  const [showAreYouSureModal, setShowAreYouSureModal] =
    useState<boolean>(false);
  const [isPassClickDebounced, setIsPassClickDebounced] =
    useState<boolean>(false);
  const [isChargingHold, setIsChargingHold] = useState<boolean>(false);
  const [holdChargeMs, setHoldChargeMs] = useState<number>(
    MOUSE_LONG_PRESS_MS - HOLD_HINT_DELAY_MS
  );
  const [playPassTurnSound] = useSound(passTurnSound);
  const {
    activateReplayControl,
    isPlaying: isReplayPlaying,
    stepBackward,
    stepForward,
    useSpaceToAdvanceOneStep
  } = useReplayPlayback();
  // Ref so the priority-sound effect doesn't re-register when useSound creates a new function ref.
  const playPassTurnSoundRef = useRef(playPassTurnSound);
  playPassTurnSoundRef.current = playPassTurnSound;

  // Holds the debounce timer so it can be cleared on unmount (prevents setState after unmount).
  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  // The in-flight long press, plus the teardown for the listeners watching it.
  const holdSessionRef = useRef<HoldSession | null>(null);
  const holdDetachRef = useRef<(() => void) | null>(null);
  // Flag so the click that follows a completed hold is swallowed.
  const holdCompletedRef = useRef<boolean>(false);

  const preventPassPrompt = useAppSelector(
    (state: RootState) => state.game.preventPassPrompt
  );
  const isMuted = useAppSelector(
    (state: RootState) => getSettingsEntity(state)['MuteSound']?.value === '1'
  );
  // The armed state is one transient server-side flag, scoped to this player and
  // cleared by the server at the start of every turn. It is deliberately not the
  // account's Always Pass Priority preference: writing a long press into that
  // persisted it to the account and leaked auto-passing into later games.
  const autoPassTurnSetting = useSetting({ settingName: AUTO_PASS_TURN });
  const isHoldArmed = autoPassTurnSetting?.value === '1';
  const holdToAutoPassDisabledSetting = useSetting({
    settingName: DISABLE_HOLD_TO_AUTO_PASS
  });
  const isHoldToAutoPassDisabled = holdToAutoPassDisabledSetting?.value !== '0';

  const dispatch = useAppDispatch();

  useEffect(() => {
    if (hasPriority && !isMuted && playerID !== 3) {
      playPassTurnSoundRef.current();
    }
    // playPassTurnSound excluded: latest value always read from ref.
  }, [frameNumber, hasPriority, isMuted, playerID]);

  useEffect(() => {
    const link = document.getElementById('favicon') as HTMLLinkElement;
    if (hasPriority && link && playerID !== 3) {
      link.href = '/images/priorityGreen.ico';
    } else if (link) {
      link.href = '/images/priorityGrey.ico';
    }
  }, [hasPriority, playerID]);

  // Cleanup timers on unmount so setState is never called on an unmounted component.
  useEffect(
    () => () => {
      if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
      const session = holdSessionRef.current;
      if (session?.frame != null) cancelAnimationFrame(session.frame);
      holdSessionRef.current = null;
      holdDetachRef.current?.();
      holdDetachRef.current = null;
    },
    []
  );

  const onPassTurn = useCallback(
    (event?: KeyboardEvent | MouseEvent) => {
      if (isReplay) {
        if (event instanceof KeyboardEvent && event.repeat) return;
        activateReplayControl();
        return;
      }

      if (isPassClickDebounced) return;

      setIsPassClickDebounced(true);
      if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
      debounceTimerRef.current = setTimeout(() => {
        setIsPassClickDebounced(false);
        debounceTimerRef.current = null;
      }, 500);

      if (preventPassPrompt) {
        if (showAreYouSureModal) {
          // Modal is already open, treat SPACE shortcut as clicking Yes
          setShowAreYouSureModal(false);
          return dispatch(
            submitButton({ button: { mode: PROCESS_INPUT.PASS } })
          );
        }
        setShowAreYouSureModal(true);
        return;
      }
      return dispatch(submitButton({ button: { mode: PROCESS_INPUT.PASS } }));
    },
    [
      preventPassPrompt,
      showAreYouSureModal,
      dispatch,
      isPassClickDebounced,
      isReplay,
      activateReplayControl
    ]
  );

  const setAutoPassTurn = useCallback(
    (armed: boolean) => {
      return dispatch(
        updateOptions({
          game: gameInfo,
          settings: [{ name: AUTO_PASS_TURN, value: armed ? '1' : '0' }]
        })
      );
    },
    [dispatch, gameInfo]
  );

  const canHoldToAlwaysPass =
    canPassPhase === true &&
    !isHoldToAutoPassDisabled &&
    !isReplay &&
    playerID !== 3 &&
    !preventPassPrompt &&
    !showAreYouSureModal;

  const endHoldSession = useCallback(() => {
    const session = holdSessionRef.current;
    if (session?.frame != null) cancelAnimationFrame(session.frame);
    holdSessionRef.current = null;
    holdDetachRef.current?.();
    holdDetachRef.current = null;
  }, []);

  const cancelHold = useCallback(() => {
    endHoldSession();
    setIsChargingHold((charging) => (charging ? false : charging));
  }, [endHoldSession]);

  const startHold = useCallback(
    (
      onComplete: () => void,
      options?: {
        pointerId?: number;
        pointerType?: string;
        origin?: { x: number; y: number };
      }
    ) => {
      cancelHold();
      const isTouch =
        options?.pointerType !== undefined && options.pointerType !== 'mouse';
      const thresholdMs = isTouch ? TOUCH_LONG_PRESS_MS : MOUSE_LONG_PRESS_MS;
      const session: HoldSession = {
        pointerId: options?.pointerId ?? null,
        origin: options?.origin ?? null,
        tolerance: isTouch
          ? TOUCH_HOLD_MOVE_TOLERANCE_PX
          : HOLD_MOVE_TOLERANCE_PX,
        thresholdMs,
        startedAt: performance.now(),
        hintShown: false,
        frame: null,
        onComplete
      };
      holdSessionRef.current = session;
      setHoldChargeMs(thresholdMs - HOLD_HINT_DELAY_MS);

      const isOtherPointer = (event: Event) => {
        const pointerId = (event as PointerEvent).pointerId;
        return (
          session.pointerId !== null &&
          pointerId !== undefined &&
          pointerId !== session.pointerId
        );
      };
      const stop = (event: Event) => {
        if (isOtherPointer(event)) return;
        cancelHold();
      };
      const onPointerMove = (event: PointerEvent) => {
        if (isOtherPointer(event)) return;
        const origin = session.origin;
        if (!origin) return;
        const distance = Math.hypot(
          event.clientX - origin.x,
          event.clientY - origin.y
        );
        if (distance > session.tolerance) cancelHold();
      };
      window.addEventListener('pointerup', stop);
      window.addEventListener('pointercancel', stop);
      window.addEventListener('pointermove', onPointerMove, { passive: true });
      window.addEventListener('scroll', stop, true);
      document.addEventListener('visibilitychange', stop);
      holdDetachRef.current = () => {
        window.removeEventListener('pointerup', stop);
        window.removeEventListener('pointercancel', stop);
        window.removeEventListener('pointermove', onPointerMove);
        window.removeEventListener('scroll', stop, true);
        document.removeEventListener('visibilitychange', stop);
      };

      const tick = () => {
        if (holdSessionRef.current !== session) return;
        const elapsed = performance.now() - session.startedAt;
        if (!session.hintShown && elapsed >= HOLD_HINT_DELAY_MS) {
          session.hintShown = true;
          setIsChargingHold(true);
        }
        if (elapsed >= session.thresholdMs) {
          session.frame = null;
          endHoldSession();
          setIsChargingHold(false);
          session.onComplete();
          return;
        }
        session.frame = requestAnimationFrame(tick);
      };
      session.frame = requestAnimationFrame(tick);
    },
    [cancelHold, endHoldSession]
  );

  const disarmHold = useCallback(
    () => setAutoPassTurn(false),
    [setAutoPassTurn]
  );

  useEffect(() => {
    if (isHoldToAutoPassDisabled && isHoldArmed) disarmHold();
  }, [isHoldToAutoPassDisabled, isHoldArmed, disarmHold]);
  const armHold = useCallback(() => setAutoPassTurn(true), [setAutoPassTurn]);

  const holdChargeStyle = useMemo(
    () =>
      ({
        '--pass-hold-charge-duration': `${holdChargeMs}ms`
      } as React.CSSProperties),
    [holdChargeMs]
  );

  // Passing normally remains available while AUTO is armed; clicking the AUTO
  // control itself cancels it.
  const onPrimaryPassAction = useCallback(
    (event?: KeyboardEvent | MouseEvent) => {
      onPassTurn(event);
    },
    [onPassTurn]
  );

  // Always arms, never toggles: the active box gives no sign of being armed, so a
  // hold that silently cancelled would be unreadable. Re-arming is a no-op.
  const onHoldComplete = useCallback(async () => {
    holdCompletedRef.current = true;
    await onPassTurn();
    armHold();
  }, [armHold, onPassTurn]);

  // Space passes on key down as before; keeping it held arms auto-pass on top.
  const onPassTurnShortcut = useCallback(
    (event: KeyboardEvent | MouseEvent) => {
      const isKeyboard = event instanceof KeyboardEvent;
      if (isKeyboard && event.repeat) return;
      onPrimaryPassAction(event);
      if (isKeyboard && canHoldToAlwaysPass) {
        startHold(armHold);
      }
    },
    [onPrimaryPassAction, canHoldToAlwaysPass, startHold, armHold]
  );

  const onUndoKeyPress = useCallback(() => {
    if (isReplay) return;
    if (showAreYouSureModal) {
      // If modal is open, treat UNDO shortcut as clicking No (close modal)
      setShowAreYouSureModal(false);
    } else {
      // If modal is not open, allow normal undo action
      dispatch(submitButton({ button: { mode: PROCESS_INPUT.UNDO } }));
    }
  }, [isReplay, showAreYouSureModal, dispatch]);

  useShortcut(DEFAULT_SHORTCUTS.PASS_TURN, onPassTurnShortcut);
  useShortcut(DEFAULT_SHORTCUTS.PASS_MIDDLE_CLICK, onPrimaryPassAction);
  useShortcut(
    DEFAULT_SHORTCUTS.REPLAY_PREVIOUS_STEP,
    stepBackward,
    isReplay && !isReplayPlaying
  );
  useShortcut(
    DEFAULT_SHORTCUTS.REPLAY_NEXT_STEP,
    stepForward,
    isReplay && !isReplayPlaying
  );
  useShortcut(DEFAULT_SHORTCUTS.UNDO, onUndoKeyPress);

  // Releasing space - or losing the window - abandons a hold in progress.
  useEffect(() => {
    const onKeyUp = (event: KeyboardEvent) => {
      if (event.code === DEFAULT_SHORTCUTS.PASS_TURN) cancelHold();
    };
    window.addEventListener('keyup', onKeyUp);
    window.addEventListener('blur', cancelHold);
    return () => {
      window.removeEventListener('keyup', onKeyUp);
      window.removeEventListener('blur', cancelHold);
    };
  }, [cancelHold]);

  const onPassPointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
    if (event.button !== 0 || !event.isPrimary) return;
    holdCompletedRef.current = false;
    if (!canHoldToAlwaysPass) return;
    startHold(onHoldComplete, {
      pointerId: event.pointerId,
      pointerType: event.pointerType,
      origin: { x: event.clientX, y: event.clientY }
    });
  };

  const onPassClick = () => {
    cancelHold();
    if (holdCompletedRef.current) {
      holdCompletedRef.current = false;
      return;
    }
    onPrimaryPassAction();
  };

  const clickYes = (e: React.SyntheticEvent<HTMLButtonElement>) => {
    e.preventDefault();
    setShowAreYouSureModal(false);
    dispatch(submitButton({ button: { mode: PROCESS_INPUT.PASS } }));
  };

  const clickNo = (e: React.SyntheticEvent<HTMLButtonElement>) => {
    e.preventDefault();
    setShowAreYouSureModal(false);
  };

  if (canPassPhase === undefined && !isReplay) {
    return <div className={styles.passTurnDisplay}></div>;
  }

  // Spectator view - show priority indicator
  if (playerID === 3 && !isReplay) {
    const priority = priorityPlayer ?? (hasPriority ? 1 : 2);
    // In camera view 2 the board is flipped, so invert the arrow direction
    const isFlipped = spectatorCameraView === 2;
    const showUpArrow = isFlipped ? priority === 2 : priority === 1;
    const arrow = showUpArrow ? '▲' : '▼';

    return (
      <div className={styles.passTurnDisplay}>
        <div className={styles.spectatorDisplay}>
          <div className={styles.spectatorArrow}>{arrow}</div>
          <div className={styles.spectatorPlayerName}>
            {t('PASS_TURN_DISPLAY.PRIORITY')}
          </div>
        </div>
      </div>
    );
  }

  const showArmed = isHoldArmed && !isReplay;

  if (canPassPhase === true || isReplay) {
    if (showArmed) {
      return (
        <div
          className={classNames(styles.passTurnDisplay, styles.armedIdle)}
          onClick={disarmHold}
          role="button"
          aria-pressed={true}
          aria-label={t('PASS_TURN_DISPLAY.AUTO_PASS_CANCEL')}
          title={t('PASS_TURN_DISPLAY.AUTO_PASS_CANCEL')}
        >
          {t('PASS_TURN_DISPLAY.AUTO')}
        </div>
      );
    }
    const subtitle = isReplay
      ? t('PASS_TURN_DISPLAY.REPLAY')
      : passSubtitle(turnPhaseEnum, t);
    const replayLabel = useSpaceToAdvanceOneStep
      ? t('PASS_TURN_DISPLAY.PASS')
      : isReplayPlaying
      ? t('PASS_TURN_DISPLAY.PAUSE')
      : t('PASS_TURN_DISPLAY.PLAY');
    const passLabel = t('PASS_TURN_DISPLAY.PASS_PRIORITY');
    const passTitle = canHoldToAlwaysPass
      ? t('PASS_TURN_DISPLAY.TITLE_HOLD', { subtitle })
      : t('PASS_TURN_DISPLAY.TITLE', { subtitle });
    return (
      <>
        <div
          className={classNames(styles.passTurnDisplayActive, {
            [styles.replayControl]: isReplay,
            [styles.replayPlaying]: isReplay && isReplayPlaying,
            [styles.charging]: isChargingHold
          })}
          style={holdChargeStyle}
          onPointerDown={onPassPointerDown}
          onPointerUp={cancelHold}
          onPointerLeave={cancelHold}
          onPointerCancel={cancelHold}
          onContextMenu={(e) => e.preventDefault()}
          onClick={onPassClick}
          role="button"
          aria-label={
            isReplay
              ? useSpaceToAdvanceOneStep
                ? t('PASS_TURN_DISPLAY.ADVANCE_REPLAY')
                : isReplayPlaying
                ? t('PASS_TURN_DISPLAY.PAUSE_REPLAY')
                : t('PASS_TURN_DISPLAY.PLAY_REPLAY')
              : passLabel
          }
          title={passTitle}
        >
          <div>{isReplay ? replayLabel : t('PASS_TURN_DISPLAY.PASS')}</div>
          <div className={styles.subThing}>{subtitle}</div>
        </div>
        {showAreYouSureModal &&
          preventPassPrompt &&
          createPortal(
            <>
              <dialog open={showAreYouSureModal} className={styles.modal}>
                <div className={styles.container}>
                  <div className={styles.dialogHeader}>{preventPassPrompt}</div>
                  <div className={styles.dialogFooter}>
                    <button onClick={clickYes}>{t('GAME_LOBBY.YES')}</button>
                    <button onClick={clickNo}>{t('GAME_LOBBY.NO')}</button>
                  </div>
                </div>
              </dialog>
            </>,
            document.body
          )}
      </>
    );
  }

  if (canPassPhase === false) {
    // Auto-pass stays armed between priority windows, so the idle box keeps the
    // red state and stays clickable - otherwise there is no way back out of it.
    if (showArmed) {
      return (
        <div
          className={classNames(styles.passTurnDisplay, styles.armedIdle)}
          onClick={disarmHold}
          role="button"
          aria-pressed={true}
          aria-label={t('PASS_TURN_DISPLAY.AUTO_PASS_CANCEL')}
          title={t('PASS_TURN_DISPLAY.AUTO_PASS_CANCEL')}
        >
          {t('PASS_TURN_DISPLAY.AUTO')}
        </div>
      );
    }
    return (
      <div className={styles.passTurnDisplay}>
        {t('PASS_TURN_DISPLAY.WAIT')}
      </div>
    );
  }

  return null;
}

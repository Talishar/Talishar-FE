import React, { useEffect, useState, useCallback, useRef } from 'react';
import { submitButton } from 'features/game/GameSlice';
import { useAppSelector, useAppDispatch } from 'app/Hooks';
import { RootState } from 'app/Store';
import styles from './PassTurnDisplay.module.css';
import { DEFAULT_SHORTCUTS, PROCESS_INPUT } from 'appConstants';
import useShortcut from 'hooks/useShortcut';
import useSound from 'use-sound';
import passTurnSound from 'sounds/prioritySound.wav';
import { createPortal } from 'react-dom';
import { getSettingsEntity } from 'features/options/optionsSlice';

function passSubtitle(turnPhase: string | undefined): string {
  switch (turnPhase) {
    case 'B': // Defend step
      return 'Block';
    case 'A': // Attack reaction step
    case 'D': // Defense reaction step
      return 'Reaction';
    case 'ARS': // End step
    case 'PDECK':
      return 'end turn';
    case 'M': // Action phase
    default:
      return 'Priority';
  }
}

export default function PassTurnDisplay() {
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
  const [showAreYouSureModal, setShowAreYouSureModal] =
    useState<boolean>(false);
  const [isPassClickDebounced, setIsPassClickDebounced] =
    useState<boolean>(false);
  const [playPassTurnSound] = useSound(passTurnSound);
  // Ref so the priority-sound effect doesn't re-register when useSound creates a new function ref.
  const playPassTurnSoundRef = useRef(playPassTurnSound);
  playPassTurnSoundRef.current = playPassTurnSound;

  // Holds the debounce timer so it can be cleared on unmount (prevents setState after unmount).
  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const preventPassPrompt = useAppSelector(
    (state: RootState) => state.game.preventPassPrompt
  );
  const isMuted = useAppSelector(
    (state: RootState) => getSettingsEntity(state)['MuteSound']?.value === '1'
  );

  const dispatch = useAppDispatch();

  useEffect(() => {
    if (hasPriority && !isMuted && playerID !== 3) {
      playPassTurnSoundRef.current();
    }
    // playPassTurnSound excluded: latest value always read from ref.
  }, [frameNumber, hasPriority, isMuted, playerID]);

  useEffect(() => {
    let link = document.getElementById('favicon') as HTMLLinkElement;
    if (hasPriority && link && playerID !== 3) {
      link.href = '/images/priorityGreen.ico';
    } else if (link) {
      link.href = '/images/priorityGrey.ico';
    }
  }, [hasPriority, playerID]);

  // Cleanup debounce timer on unmount so setState is never called on an unmounted component.
  useEffect(() => () => {
    if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
  }, []);

  const onPassTurn = useCallback(() => {
    if (isPassClickDebounced) return;

    setIsPassClickDebounced(true);
    if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
    debounceTimerRef.current = setTimeout(() => {
      setIsPassClickDebounced(false);
      debounceTimerRef.current = null;
    }, 500);

    if (!isReplay && preventPassPrompt) {
      if (showAreYouSureModal) {
        // Modal is already open, treat SPACE shortcut as clicking Yes
        setShowAreYouSureModal(false);
        dispatch(submitButton({ button: { mode: PROCESS_INPUT.PASS } }));
      } else {
        setShowAreYouSureModal(true);
      }
    } else {
      dispatch(submitButton({ button: { mode: PROCESS_INPUT.PASS } }));
    }
  }, [
    preventPassPrompt,
    showAreYouSureModal,
    dispatch,
    isPassClickDebounced,
    isReplay
  ]);

  const onUndoKeyPress = useCallback(() => {
    if (showAreYouSureModal) {
      // If modal is open, treat UNDO shortcut as clicking No (close modal)
      setShowAreYouSureModal(false);
    } else {
      // If modal is not open, allow normal undo action
      dispatch(submitButton({ button: { mode: PROCESS_INPUT.UNDO } }));
    }
  }, [showAreYouSureModal, dispatch]);

  useShortcut(DEFAULT_SHORTCUTS.PASS_TURN, onPassTurn);
  useShortcut(DEFAULT_SHORTCUTS.PASS_MIDDLE_CLICK, onPassTurn);
  useShortcut(DEFAULT_SHORTCUTS.UNDO, onUndoKeyPress);

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
          <div className={styles.spectatorPlayerName}>Priority</div>
        </div>
      </div>
    );
  }

  if (canPassPhase === true || isReplay) {
    const subtitle = isReplay ? 'Replay' : passSubtitle(turnPhaseEnum);
    return (
      <>
        <div
          className={styles.passTurnDisplayActive}
          onClick={onPassTurn}
          role="button"
          aria-label={isReplay ? 'Advance replay' : 'Pass priority'}
          title={`${subtitle} · pass priority · Space`}
        >
          <div> PASS </div>
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
                    <button onClick={clickYes}>Yes</button>
                    <button onClick={clickNo}>No</button>
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
    return <div className={styles.passTurnDisplay}>WAIT</div>;
  }

  return null;
}

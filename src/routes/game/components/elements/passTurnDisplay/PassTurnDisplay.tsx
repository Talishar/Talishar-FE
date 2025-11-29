import React, { useEffect, useState, useCallback } from 'react';
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
  const turnPlayer = useAppSelector(
    (state: RootState) => state.game.turnPlayer
  );
  const priorityPlayer = useAppSelector(
    (state: RootState) => state.game.priorityPlayer
  );
  const [showAreYouSureModal, setShowAreYouSureModal] =
    useState<boolean>(false);
  const [playPassTurnSound] = useSound(passTurnSound);
  const preventPassPrompt = useAppSelector(
    (state: RootState) => state.game.preventPassPrompt
  );
  const settingsData = useAppSelector(getSettingsEntity);
  const initialValues = { mute: settingsData['MuteSound']?.value === '1' };
  
  const dispatch = useAppDispatch();
  
  useEffect(() => {
    if (hasPriority && !initialValues.mute && playerID !== 3) {
      playPassTurnSound();
    }
  }, [frameNumber, hasPriority, initialValues.mute, playerID, playPassTurnSound]);

  useEffect(() => {
    let link = document.getElementById('favicon') as HTMLLinkElement;
    if (hasPriority && link && playerID !== 3) {
      link.href = '/images/priorityGreen.ico';
    } else if (link) {
      link.href = '/images/priorityGrey.ico';
    }
  }, [hasPriority, playerID]);

  const onPassTurn = useCallback(() => {
    if (preventPassPrompt && !showAreYouSureModal) {
      setShowAreYouSureModal(true);
    } else {
      dispatch(submitButton({ button: { mode: PROCESS_INPUT.PASS } }));
    }
  }, [preventPassPrompt, showAreYouSureModal, dispatch]);

  useShortcut(DEFAULT_SHORTCUTS.PASS_TURN, onPassTurn);

  const clickYes = (e: React.SyntheticEvent<HTMLButtonElement>) => {
    e.preventDefault();
    setShowAreYouSureModal(false);
    dispatch(submitButton({ button: { mode: PROCESS_INPUT.PASS } }));
  };

  const clickNo = (e: React.SyntheticEvent<HTMLButtonElement>) => {
    e.preventDefault();
    setShowAreYouSureModal(false);
  };

  if (canPassPhase === undefined) {
    return <div className={styles.passTurnDisplay}></div>;
  }

  // Spectator view - show priority indicator
  if (playerID === 3) {
    // Use priorityPlayer to determine which player has priority
    // priorityPlayer 1 = top player, priorityPlayer 2 = bottom player
    // Fallback to checking hasPriority if priorityPlayer is undefined
    const priority = priorityPlayer ?? (hasPriority ? 1 : 2);
    const arrow = priority === 1 ? '▲' : '▼';
    
    return (
      <div className={styles.passTurnDisplay}>
        <div className={styles.spectatorDisplay}>
          <div className={styles.spectatorArrow}>{arrow}</div>
          <div className={styles.spectatorPlayerName}>Priority</div>
        </div>
      </div>
    );
  }

  if (canPassPhase === true) {
    return (
      <>
        <div className={styles.passTurnDisplayActive} onClick={onPassTurn}>
          <div> PASS </div>
          <div className={styles.subThing}>[spacebar]</div>
        </div>
        {showAreYouSureModal &&
          createPortal(
            <>
              <dialog open={showAreYouSureModal} className={styles.modal}>
                <article className={styles.container}>
                  <header className={styles.header}>{preventPassPrompt}</header>
                  <button className={styles.preventButtons} onClick={clickYes}>
                    Yes
                  </button>
                  <button className={styles.preventButtons} onClick={clickNo}>
                    No
                  </button>
                </article>
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

import React, { useEffect, useState } from 'react';
import { playCard, submitButton } from 'features/game/GameSlice';
import { useAppSelector, useAppDispatch } from 'app/Hooks';
import { RootState } from 'app/Store';
import styles from './PassTurnDisplay.module.css';
import { DEFAULT_SHORTCUTS, PROCESS_INPUT } from 'appConstants';
import useShortcut from 'hooks/useShortcut';
import useSound from 'use-sound';
import passTurnSound from 'sounds/prioritySound.wav';

export default function PassTurnDisplay() {
  const canPassPhase = useAppSelector(
    (state: RootState) => state.game.canPassPhase
  );
  const [canPassController, setCanPassController] = useState<boolean>(false);
  const [playPassTurnSound] = useSound(passTurnSound);

  const dispatch = useAppDispatch();

  const onPassTurn = () => {
    dispatch(submitButton({ button: { mode: PROCESS_INPUT.PASS } }));
    setCanPassController(true);
  };

  useShortcut(DEFAULT_SHORTCUTS.PASS_TURN, onPassTurn);

  useEffect(() => {
    if (canPassPhase && canPassController) {
      setCanPassController(false);
      playPassTurnSound();
    }
  }, [canPassController]);

  if (canPassPhase === undefined) {
    return <div className={styles.passTurnDisplay}></div>;
  }

  if (canPassPhase === true) {
    return (
      <div className={styles.passTurnDisplayActive} onClick={onPassTurn}>
        <div> PASS </div>
        <div className={styles.subThing}>[spacebar]</div>
      </div>
    );
  }

  if (canPassPhase === false) {
    return <div className={styles.passTurnDisplay}>WAIT</div>;
  }

  return null;
}

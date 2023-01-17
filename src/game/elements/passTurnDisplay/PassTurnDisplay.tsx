import React, { useEffect } from 'react';
import { playCard, submitButton } from '../../../features/game/GameSlice';
import { useAppSelector, useAppDispatch } from '../../../app/Hooks';
import { RootState } from '../../../app/Store';
import styles from './PassTurnDisplay.module.css';

export default function PassTurnDisplay() {
  const canPassPhase = useAppSelector(
    (state: RootState) => state.game.canPassPhase
  );

  const dispatch = useAppDispatch();

  const onPassTurn = () => {
    dispatch(submitButton({ button: { mode: 99 } }));
  };

  const pressKey = (e: KeyboardEvent) => {
    if (e.key == ' ') {
      onPassTurn();
    }
  };

  // TODO: Migrate the key listeners to a separate component
  // component can have customisable keys maybe
  useEffect(() => {
    document.addEventListener('keydown', pressKey, false);
    // return document.removeEventListener('keydown', pressKey, true);
  }, []);

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

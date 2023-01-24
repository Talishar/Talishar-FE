import React from 'react';
import { useAppSelector } from 'app/Hooks';
import { RootState } from 'app/Store';
import Displayrow from 'interface/Displayrow';
import styles from './PitchDisplay.module.css';

export default function PitchDisplay(prop: Displayrow) {
  const { isPlayer } = prop;

  let pitchAmount = useAppSelector((state: RootState) =>
    isPlayer
      ? state.game.playerOne.PitchRemaining
      : state.game.playerTwo.PitchRemaining
  );

  if (pitchAmount === undefined) {
    pitchAmount = 0;
  }

  return (
    <div className={styles.pitchOverlay}>
      <div className={styles.pitchBackground}>
        <div className={styles.pitchValue}>{pitchAmount}</div>
      </div>
    </div>
  );
}

import React from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../../app/Store';
import Displayrow from '../../interface/Displayrow';
import CardDisplay from '../elements/CardDisplay';
import Card from '../../features/Card';
import styles from './PitchDisplay.module.css';

export default function PitchDisplay(prop: Displayrow) {
  const { isPlayer } = prop;

  let pitchAmount = useSelector((state: RootState) =>
    isPlayer
      ? state.game.playerOne.PitchRemaining
      : state.game.playerTwo.PitchRemaining
  );

  if (pitchAmount === undefined) {
    pitchAmount = 0;
  }

  return (
    <div className={styles.pitchOverlay}>
      <div className={styles.pitchValue}>{pitchAmount}</div>
    </div>
  );
}

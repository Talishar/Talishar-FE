import React from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../../app/Store';
import { Displayrow } from '../../interface/displayrow';
import { CardDisplay } from '../elements/card';
import { Card } from '../../features/Card';
import styles from './cardzone.module.css';

export function PitchZone(prop: Displayrow) {
  let pitchZone: Card[] | undefined;

  if (prop.isPlayer) {
    pitchZone = useSelector((state: RootState) => state.game.playerOne.Pitch);
  } else {
    pitchZone = useSelector((state: RootState) => state.game.playerTwo.Pitch);
  }

  if (pitchZone === undefined) {
    return <div className={styles.pitchZone}>Pitch</div>;
  }

  const numInPitch = pitchZone.length;
  const cardToDisplay = pitchZone[numInPitch - 1];

  return (
    <div className={styles.pitchZone}>
      <CardDisplay card={cardToDisplay} num={numInPitch} />
    </div>
  );
}

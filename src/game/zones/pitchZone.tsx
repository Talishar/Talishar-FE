import React from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../../app/Store';
import Displayrow from '../../interface/displayrow';
import CardDisplay from '../elements/CardDisplay';
import styles from './Cardzone.module.css';
import PitchDisplay from '../elements/PitchDisplay';

export default function PitchZone(prop: Displayrow) {
  const { isPlayer } = prop;
  const { DisplayRow } = prop;

  const pitchZone = useSelector((state: RootState) =>
    isPlayer ? state.game.playerOne.Pitch : state.game.playerTwo.Pitch
  );

  if (pitchZone === undefined) {
    return <div className={styles.pitchZone}>Pitch</div>;
  }

  const numInPitch = pitchZone.length;
  const cardToDisplay = pitchZone[numInPitch - 1];

  return (
    <div className={styles.pitchZone}>
      <CardDisplay card={cardToDisplay} num={numInPitch} />
      <PitchDisplay isPlayer={isPlayer} DisplayRow={DisplayRow} />
    </div>
  );
}

import React from 'react';
import { useAppSelector } from '../../../app/Hooks';
import { RootState } from '../../../app/Store';
import Displayrow from '../../../interface/Displayrow';
import CardDisplay from '../../elements/cardDisplay/CardDisplay';
import styles from '../Cardzone.module.css';

export default function GlovesEqZone(prop: Displayrow) {
  const { isPlayer } = prop;

  const cardToDisplay = useAppSelector((state: RootState) =>
    isPlayer ? state.game.playerOne.GlovesEq : state.game.playerTwo.GlovesEq
  );

  if (cardToDisplay === undefined) {
    return <div className={styles.glovesZone}>Arms</div>;
  }

  return (
    <div className={styles.glovesZone}>
      <CardDisplay card={cardToDisplay} />
    </div>
  );
}

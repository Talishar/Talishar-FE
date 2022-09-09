import React from 'react';
import { useAppSelector } from '../../app/Hooks';
import { RootState } from '../../app/Store';
import Displayrow from '../../interface/Displayrow';
import CardDisplay from '../elements/CardDisplay';
import styles from './Cardzone.module.css';

export default function HeadEqZone(prop: Displayrow) {
  const { isPlayer } = prop;
  const cardToDisplay = useAppSelector((state: RootState) =>
    isPlayer ? state.game.playerOne.HeadEq : state.game.playerTwo.HeadEq
  );

  if (cardToDisplay === undefined) {
    return <div className={styles.hatZone}>Head</div>;
  }

  return (
    <div className={styles.hatZone}>
      <CardDisplay card={cardToDisplay} />
    </div>
  );
}

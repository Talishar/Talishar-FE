import React from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../../app/Store';
import Displayrow from '../../interface/Displayrow';
import CardDisplay from '../elements/CardDisplay';
import styles from './Cardzone.module.css';

export default function PermanentsZone(prop: Displayrow) {
  const { isPlayer } = prop;

  const permanents = useSelector((state: RootState) =>
    isPlayer ? state.game.playerOne.Permanents : state.game.playerTwo.Permanents
  );

  if (permanents === undefined || permanents.length === 0) {
    return (
      <div className={styles.permanentsWrapper}>
        <div className={styles.permanentsText}>
          <div>Permanents</div>
        </div>
      </div>
    );
  }

  //TODO: Stack permanents that are the same.
  return (
    <div className={styles.permanentsWrapper}>
      <div className={styles.permanentsText}>
        <div>Permanents</div>
      </div>
      <div className={styles.permanentsZone}>
        {permanents.map((card, ix) => {
          return (
            <div key={ix.toString()} className={styles.cardContainer}>
              <CardDisplay card={card} key={ix.toString()} />
            </div>
          );
        })}
      </div>
    </div>
  );
}

import React from 'react';
import { useAppSelector } from 'app/Hooks';
import { RootState } from 'app/Store';
import Displayrow from 'interface/Displayrow';
import CardDisplay from '../../elements/cardDisplay/CardDisplay';
import styles from './PermanentsZone.module.css';

export default function PermanentsZone(prop: Displayrow) {
  const { isPlayer } = prop;

  const permanents = useAppSelector((state: RootState) =>
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

  // TODO: Stack permanents that are the same.
  // We probably need to use some deepEqual library to assist with this.

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

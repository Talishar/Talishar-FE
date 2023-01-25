import { Field, useFormikContext } from 'formik';
import React from 'react';
import CardImage from 'routes/game/components/elements/cardImage/CardImage';
import { LobbyInfo } from '../../Join';
import styles from './Equipment.module.css';

const Equipment = (params: LobbyInfo) => {
  const { values } = useFormikContext();
  const hands = [
    ...params.deck.weapons,
    ...params.deck.weaponSB,
    ...params.deck.offhand,
    ...params.deck.offhandSB
  ];
  const head = [...params.deck.head, ...params.deck.headSB];
  const chest = [...params.deck.chest, ...params.deck.chestSB];
  const arms = [...params.deck.arms, ...params.deck.armsSB];
  const legs = [...params.deck.legs, ...params.deck.legsSB];
  return (
    <div className={styles.container}>
      <div className={styles.eqCategory}>
        <h3>Weapons / Off-Hand</h3>
        <div className={styles.categoryContainer}>
          {hands.map((card, ix) => {
            return (
              <div key={`deck${ix}`} className={styles.cardContainer}>
                <label>
                  <Field type="checkbox" name="weapons" value={`${card}`} />
                  <CardImage
                    src={`/cardsquares/${card}.webp`}
                    draggable={false}
                    className={styles.card}
                  />
                  <div className={styles.overlay}></div>
                </label>
              </div>
            );
          })}
        </div>
      </div>
      <div className={styles.eqCategory}>
        <h3>Head</h3>
        <div className={styles.categoryContainer}>
          {head.map((card, ix) => {
            return (
              <div key={`deck${ix}`} className={styles.cardContainer}>
                <label>
                  <Field type="radio" name="head" value={`${card}`} />
                  <CardImage
                    src={`/cardsquares/${card}.webp`}
                    draggable={false}
                    className={styles.card}
                  />
                  <div className={styles.overlay}></div>
                </label>
              </div>
            );
          })}
        </div>
      </div>
      <div className={styles.eqCategory}>
        <h3>Chest</h3>
        <div className={styles.categoryContainer}>
          {chest.map((card, ix) => {
            return (
              <div key={`deck${ix}`} className={styles.cardContainer}>
                <label>
                  <Field type="radio" name="chest" value={`${card}`} />
                  <CardImage
                    src={`/cardsquares/${card}.webp`}
                    draggable={false}
                    className={styles.card}
                  />
                  <div className={styles.overlay}></div>
                </label>
              </div>
            );
          })}
        </div>
      </div>
      <div className={styles.eqCategory}>
        <h3>Arms</h3>
        <div className={styles.categoryContainer}>
          {arms.map((card, ix) => {
            return (
              <div key={`deck${ix}`} className={styles.cardContainer}>
                <label className={styles.selection}>
                  <Field type="radio" name="arms" value={`${card}`} />
                  <CardImage
                    src={`/cardsquares/${card}.webp`}
                    draggable={false}
                    className={styles.card}
                  />
                  <div className={styles.overlay}></div>
                </label>
              </div>
            );
          })}
        </div>
      </div>
      <div className={styles.eqCategory}>
        <h3>Legs</h3>
        <div className={styles.categoryContainer}>
          {legs.map((card, ix) => {
            return (
              <div key={`deck${ix}`} className={styles.cardContainer}>
                <label>
                  <Field type="radio" name="legs" value={`${card}`} />
                  <CardImage
                    src={`/cardsquares/${card}.webp`}
                    draggable={false}
                    className={styles.card}
                  />
                  <div className={styles.overlay}></div>
                </label>
              </div>
            );
          })}
        </div>
      </div>
      <div className={styles.spacerDiv}></div>
    </div>
  );
};

export default Equipment;

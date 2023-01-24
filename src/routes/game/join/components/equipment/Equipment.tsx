import React from 'react';
import CardImage from 'routes/game/components/elements/cardImage/CardImage';
import { LobbyInfo } from '../../Join';
import styles from './Equipment.module.css';

const Equipment = (params: LobbyInfo) => {
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
      <h3>Weapons / Off-Hand</h3>
      <div className={styles.categoryContainer}>
        {hands.map((card, ix) => {
          return (
            <div key={`deck${ix}`} className={styles.cardContainer}>
              <CardImage
                src={`/cardsquares/${card}.webp`}
                draggable={false}
                className={styles.card}
              />
            </div>
          );
        })}
      </div>
      <h3>Head</h3>
      <div className={styles.categoryContainer}>
        {head.map((card, ix) => {
          return (
            <div key={`deck${ix}`} className={styles.cardContainer}>
              <CardImage
                src={`/cardsquares/${card}.webp`}
                draggable={false}
                className={styles.card}
              />
            </div>
          );
        })}
      </div>
      <h3>Chest</h3>
      <div className={styles.categoryContainer}>
        {chest.map((card, ix) => {
          return (
            <div key={`deck${ix}`} className={styles.cardContainer}>
              <CardImage
                src={`/cardsquares/${card}.webp`}
                draggable={false}
                className={styles.card}
              />
            </div>
          );
        })}
      </div>
      <h3>Arms</h3>
      <div className={styles.categoryContainer}>
        {arms.map((card, ix) => {
          return (
            <div key={`deck${ix}`} className={styles.cardContainer}>
              <CardImage
                src={`/cardsquares/${card}.webp`}
                draggable={false}
                className={styles.card}
              />
            </div>
          );
        })}
      </div>
      <h3>Legs</h3>
      <div className={styles.categoryContainer}>
        {legs.map((card, ix) => {
          return (
            <div key={`deck${ix}`} className={styles.cardContainer}>
              <CardImage
                src={`/cardsquares/${card}.webp`}
                draggable={false}
                className={styles.card}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Equipment;

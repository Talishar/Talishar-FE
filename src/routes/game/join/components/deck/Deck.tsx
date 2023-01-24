import React from 'react';
import CardImage from 'routes/game/components/elements/cardImage/CardImage';
import CardListZone from 'routes/game/components/zones/cardListZone/CardListZone';
import { LobbyInfo } from '../../Join';
import styles from './Deck.module.css';

const Deck = (params: LobbyInfo) => {
  const cardList = [...params.deck.cards, ...params.deck.cardsSB];
  return (
    <div className={styles.container}>
      {cardList.map((card, ix) => {
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
  );
};

export default Deck;

import { Field, useFormikContext } from 'formik';
import React from 'react';
import CardImage from 'routes/game/components/elements/cardImage/CardImage';
import { LobbyInfo } from '../../Join';
import styles from './Deck.module.css';

type DeckProps = {
  deck: String[];
};

const Deck = ({ deck }: DeckProps) => {
  const { values } = useFormikContext();

  return (
    <div className={styles.container}>
      {deck.map((card, ix) => {
        return (
          <div key={`deck${ix}`} className={styles.deckCardContainer}>
            <label>
              <Field type="checkbox" name="deck" value={`${card}`} />
              <CardImage
                src={`/cardsquares/${card.substring(0, 6)}.webp`}
                draggable={false}
                className={styles.card}
              />
            </label>
          </div>
        );
      })}
    </div>
  );
};

export default Deck;

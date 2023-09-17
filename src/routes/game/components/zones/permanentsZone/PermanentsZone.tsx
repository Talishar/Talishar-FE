import React from 'react';
import { useAppSelector } from 'app/Hooks';
import { RootState } from 'app/Store';
import Displayrow from 'interface/Displayrow';
import CardDisplay from '../../elements/cardDisplay/CardDisplay';
import styles from './PermanentsZone.module.css';
import { Card } from 'features/Card';
import isEqual from 'react-fast-compare';
import classNames from 'classnames';
import { shallowEqual } from 'react-redux';

export interface CardStack {
  card: Card;
  count: number;
}

export default function PermanentsZone(prop: Displayrow) {
  const { isPlayer } = prop;

  const permanents = useAppSelector(
    (state: RootState) =>
      isPlayer
        ? state.game.playerOne.Permanents
        : state.game.playerTwo.Permanents,
    shallowEqual
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

  const sortedPermanents = [...permanents];
  sortedPermanents.sort((a, b) => a.cardNumber.localeCompare(b.cardNumber));

  // Stack cards.
  let initialCardStack: CardStack[] = [];
  const cardStackArray = sortedPermanents.reduce((accumulator, currentCard) => {
    const cardCopy = { ...currentCard };
    const storedADO = currentCard.actionDataOverride;
    cardCopy.actionDataOverride = '';
    let isInAccumulator = false;
    let index = 0;
    // is current card in the cardStackArray already?
    for (const [ix, cardStack] of accumulator.entries()) {
      cardCopy.actionDataOverride = cardStack.card.actionDataOverride;
      if (isEqual(cardStack.card, cardCopy)) {
        isInAccumulator = true;
        index = ix;
        break;
      }
    }
    // if it is, +1 to count
    if (isInAccumulator) {
      accumulator[index].count = accumulator[index].count + 1;
      return accumulator;
    }
    // if it is not, append to accumulator.
    accumulator.push({ card: currentCard, count: 1 });
    return accumulator;
  }, initialCardStack);

  return (
    <div className={styles.permanentsWrapper}>
      <div className={styles.permanentsText}>
        <div>Permanents</div>
      </div>
      <div className={styles.permanentsZone}>
        {cardStackArray.map((cardStack, ix) => {
          const cardContainerStyles = classNames(
            {
              [styles.stacked]: cardStack.count > 1
            },
            styles.cardContainer
          );
          return (
            <div key={ix.toString()} className={cardContainerStyles}>
              <CardDisplay card={cardStack.card} key={ix.toString()} />
              {cardStack.count > 1 && (
                <div
                  title={`Stack of ${cardStack.count}`}
                  className={styles.counter}
                >
                  × {cardStack.count}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

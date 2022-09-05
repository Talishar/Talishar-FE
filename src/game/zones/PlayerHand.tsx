import React, { useRef, useState, useEffect } from 'react';
import { shallowEqual, useSelector } from 'react-redux';
import { RootState } from '../../app/Store';
import Card from '../../features/Card';
import styles from './PlayerHand.module.css';
import PlayerHandCard from '../elements/PlayerHandCard';

const MaxHandWidthPercentage = 50;

export default function PlayerHand() {
  const isPlayable = (card: Card) => {
    false;
  };

  const handCards = useSelector(
    (state: RootState) => state.game.playerOne.Hand
  );
  const arsenalCards = useSelector(
    (state: RootState) => state.game.playerOne.Arsenal
  );
  const playableBanishedCards = useSelector(
    (state: RootState) => state.game.playerOne.Banish?.filter(isPlayable),
    shallowEqual
  );
  const playableGraveyardCards = useSelector(
    (state: RootState) => state.game.playerOne.Graveyard?.filter(isPlayable),
    shallowEqual
  );

  let lengthOfCards = 0;
  lengthOfCards += handCards !== undefined ? handCards.length : 0;
  lengthOfCards += arsenalCards !== undefined ? arsenalCards.length : 0;
  lengthOfCards +=
    playableBanishedCards !== undefined ? playableBanishedCards.length : 0;
  lengthOfCards +=
    playableGraveyardCards !== undefined ? playableGraveyardCards.length : 0;

  const widthPercentage = Math.min(lengthOfCards * 5, MaxHandWidthPercentage);

  const widthfunction = { width: `${widthPercentage}%` };

  return (
    <div className={styles.handRow} style={widthfunction}>
      {handCards !== undefined &&
        handCards.map((card, ix) => {
          return (
            <PlayerHandCard
              card={card}
              key={ix}
              handSize={lengthOfCards}
              cardIndex={ix}
            />
          );
        })}
      {arsenalCards !== undefined &&
        arsenalCards.map((card, ix) => {
          return (
            <PlayerHandCard
              card={card}
              isArsenal
              key={ix}
              handSize={lengthOfCards}
              cardIndex={ix + handCards!.length}
            />
          );
        })}
    </div>
  );
}

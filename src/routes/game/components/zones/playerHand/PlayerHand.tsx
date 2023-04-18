import React from 'react';
import { shallowEqual } from 'react-redux';
import { RootState } from 'app/Store';
import { Card } from 'features/Card';
import styles from './PlayerHand.module.css';
import PlayerHandCard from '../../elements/playerHandCard/PlayerHandCard';
import { useAppSelector } from 'app/Hooks';
import useWindowDimensions from 'hooks/useWindowDimensions';
import { AnimatePresence } from 'framer-motion';

const MaxHandWidthPercentage = 50;

export default function PlayerHand() {
  const isPlayable = (card: Card) => {
    false;
  };
  const [width, height] = useWindowDimensions();

  const playerID = useAppSelector(
    (state: RootState) => state.game.gameInfo.playerID
  );

  let hasArsenal = true;

  const showArsenal = false;

  const handCards = useAppSelector(
    (state: RootState) => state.game.playerOne.Hand
  );
  const arsenalCards = useAppSelector(
    (state: RootState) => state.game.playerOne.Arsenal
  );
  const playableBanishedCards = useAppSelector((state: RootState) => {
    return state.game.playerOne.Banish?.filter(
      (card) => card.action != null && card.action != 0
    );
  }, shallowEqual);
  const playableGraveyardCards = useAppSelector(
    (state: RootState) => state.game.playerOne.Graveyard?.filter(isPlayable),
    shallowEqual
  );

  if (
    arsenalCards === undefined ||
    arsenalCards.length === 0 ||
    arsenalCards[0].cardNumber === ''
  ) {
    hasArsenal = false;
  }

  let lengthOfCards = 0;
  lengthOfCards += handCards !== undefined ? handCards.length : 0;
  lengthOfCards += arsenalCards !== undefined ? arsenalCards.length : 0;
  lengthOfCards +=
    playableBanishedCards !== undefined ? playableBanishedCards.length : 0;
  lengthOfCards +=
    playableGraveyardCards !== undefined ? playableGraveyardCards.length : 0;

  const widthPercentage = Math.min(lengthOfCards * 5, MaxHandWidthPercentage);

  const widthfunction =
    width > height ? { width: `${widthPercentage}%` } : { width: `75%` };

  if (playerID === 3) {
    return <></>;
  }

  return (
    <div className={styles.handRow} style={widthfunction}>
      <AnimatePresence>
        {handCards !== undefined &&
          handCards.map((card, ix) => {
            return (
              <PlayerHandCard card={card} key={`hand-${card.cardNumber}`} />
            );
          })}
        {hasArsenal &&
          showArsenal &&
          arsenalCards !== undefined &&
          arsenalCards.map((card, ix) => {
            return (
              <PlayerHandCard
                card={card}
                isArsenal
                key={`arsenal${card.cardNumber}`}
              />
            );
          })}
        {playableBanishedCards !== undefined &&
          playableBanishedCards.map((card, ix) => {
            return (
              <PlayerHandCard
                card={card}
                isBanished
                key={`banished-${card.cardNumber}`}
              />
            );
          })}
      </AnimatePresence>
    </div>
  );
}

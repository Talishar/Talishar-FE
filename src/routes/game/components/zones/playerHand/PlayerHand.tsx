import React, { useEffect, useState } from 'react';
import { shallowEqual } from 'react-redux';
import { RootState } from 'app/Store';
import { Card } from 'features/Card';
import styles from './PlayerHand.module.css';
import PlayerHandCard from '../../elements/playerHandCard/PlayerHandCard';
import { useAppDispatch, useAppSelector } from 'app/Hooks';
import useWindowDimensions from 'hooks/useWindowDimensions';
import { AnimatePresence } from 'framer-motion';
import { createPortal } from 'react-dom';

export default function PlayerHand() {
  const isPlayable = (card: Card) => {
    false;
  };
  const [width, height] = useWindowDimensions();

  const playerID = useAppSelector(
    (state: RootState) => state.game.gameInfo.playerID
  );

  const [playedCards, setPlayedCards] = useState<String[]>([]);

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

  const playableTheirBanishedCards = useAppSelector((state: RootState) => {
    return state.game.playerTwo.Banish?.filter(
      (card) => card.action != null && card.action != 0
    );
  }, shallowEqual);

  const playableGraveyardCards = useAppSelector((state: RootState) => {
    return state.game.playerOne.Graveyard?.filter(
      (card) => card.action != null && card.action != 0
    );
  }, shallowEqual);

  const addCardToPlayedCards = (cardName: string) => {
    const newArray = playedCards;
    newArray.push(cardName);
    setPlayedCards(newArray);
  };

  useEffect(() => {
    if (
      (handCards?.length === 0 || handCards === undefined) &&
      (playableBanishedCards?.length === 0 ||
        playableBanishedCards === undefined) &&
      (playableTheirBanishedCards?.length === 0 ||
        playableTheirBanishedCards === undefined) &&
      (playableGraveyardCards?.length === 0 ||
        playableGraveyardCards === undefined)
    ) {
      setPlayedCards([]);
    }
  }, [
    handCards,
    playableBanishedCards,
    playableTheirBanishedCards,
    playableGraveyardCards
  ]);

  if (
    arsenalCards === undefined ||
    arsenalCards.length === 0 ||
    arsenalCards[0].cardNumber === ''
  ) {
    hasArsenal = false;
  }

  let lengthOfCards = 0;
  lengthOfCards += handCards?.length ?? 0;
  lengthOfCards += arsenalCards?.length ?? 0;
  lengthOfCards += playableBanishedCards?.length ?? 0;
  lengthOfCards += playableGraveyardCards?.length ?? 0;
  lengthOfCards += playableTheirBanishedCards?.length ?? 0;

  if (playerID === 3) {
    return <></>;
  }

  const cardsInHandsAlready = [...playedCards];

  return (
    <>
      {createPortal(
        <>
          <div 
            className={styles.handRow}
            style={lengthOfCards > 5 ? { '--card-count': lengthOfCards } as React.CSSProperties : undefined}
            onContextMenu={(e)=> e.preventDefault()}
          >
            <AnimatePresence>
              {handCards !== undefined &&
                handCards.map((card, ix) => {
                  const cardCount = cardsInHandsAlready.filter(
                    (value) => value === card.cardNumber
                  ).length;
                  cardsInHandsAlready.push(card.cardNumber);
                  return (
                    <PlayerHandCard
                      card={card}
                      key={`hand-${card.cardNumber}-${cardCount}`}
                      addCardToPlayedCards={addCardToPlayedCards}
                      zIndex={-ix}
                    />
                  );
                })}
              {hasArsenal &&
                showArsenal &&
                arsenalCards !== undefined &&
                arsenalCards.map((card, ix) => {
                  const cardCount = cardsInHandsAlready.filter(
                    (value) => value === card.cardNumber
                  ).length;
                  cardsInHandsAlready.push(card.cardNumber);
                  return (
                    <PlayerHandCard
                      card={card}
                      isArsenal
                      key={`arsenal-${card.cardNumber}-${cardCount}`}
                      addCardToPlayedCards={addCardToPlayedCards}
                      zIndex={-(ix + (handCards?.length ?? 0))}
                    />
                  );
                })}
              {playableBanishedCards !== undefined &&
                playableBanishedCards.map((card, ix) => {
                  const cardCount = cardsInHandsAlready.filter(
                    (value) => value === card.cardNumber
                  ).length;
                  cardsInHandsAlready.push(card.cardNumber);
                  return (
                    <PlayerHandCard
                      card={card}
                      isBanished
                      key={`banished-${card.cardNumber}-${cardCount}`}
                      addCardToPlayedCards={addCardToPlayedCards}
                      zIndex={
                        -(
                          ix +
                          (arsenalCards?.length ?? 0) +
                          (handCards?.length ?? 0)
                        )
                      }
                    />
                  );
                })}
              {playableTheirBanishedCards !== undefined &&
                playableTheirBanishedCards.map((card, ix) => {
                  const cardCount = cardsInHandsAlready.filter(
                    (value) => value === card.cardNumber
                  ).length;
                  cardsInHandsAlready.push(card.cardNumber);
                  return (
                    <PlayerHandCard
                      card={card}
                      isBanished
                      key={`banished-${card.cardNumber}-${cardCount}`}
                      addCardToPlayedCards={addCardToPlayedCards}
                      zIndex={
                        -(
                          ix +
                          (arsenalCards?.length ?? 0) +
                          (handCards?.length ?? 0) +
                          (playableBanishedCards?.length ?? 0)
                        )
                      }
                    />
                  );
                })}
              {playableGraveyardCards !== undefined &&
                playableGraveyardCards.map((card, ix) => {
                  const cardCount = cardsInHandsAlready.filter(
                    (value) => value === card.cardNumber
                  ).length;
                  cardsInHandsAlready.push(card.cardNumber);
                  return (
                    <PlayerHandCard
                      card={card}
                      isGraveyard
                      key={`graveyard-${card.cardNumber}-${cardCount}`}
                      addCardToPlayedCards={addCardToPlayedCards}
                      zIndex={
                        -(
                          ix +
                          (arsenalCards?.length ?? 0) +
                          (handCards?.length ?? 0) +
                          (playableBanishedCards?.length ?? 0) +
                          (playableTheirBanishedCards?.length ?? 0)
                        )
                      }
                    />
                  );
                })}
            </AnimatePresence>
          </div>
        </>,
        document.body
      )}
    </>
  );
}

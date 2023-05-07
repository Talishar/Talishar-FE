import React, { useEffect, useState } from 'react';
import { shallowEqual } from 'react-redux';
import { RootState } from 'app/Store';
import { Card } from 'features/Card';
import styles from './PlayerHand.module.css';
import PlayerHandCard from '../../elements/playerHandCard/PlayerHandCard';
import { useAppDispatch, useAppSelector } from 'app/Hooks';
import useWindowDimensions from 'hooks/useWindowDimensions';
import { AnimatePresence } from 'framer-motion';
import { MANUAL_MODE } from 'features/options/constants';
import useSetting from 'hooks/useSetting';
import { getGameInfo, submitButton } from 'features/game/GameSlice';
import { updateOptions } from 'features/options/optionsSlice';
import { useProcessInputAPIMutation } from 'features/api/apiSlice';
import { PROCESS_INPUT } from 'appConstants';

const MaxHandWidthPercentage = 50;

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
  const isManualMode = useSetting({ settingName: MANUAL_MODE })?.value === '1';

  const addCardToPlayedCards = (cardName: string) => {
    const newArray = playedCards;
    newArray.push(cardName);
    setPlayedCards(newArray);
  };

  useEffect(() => {
    if (
      (handCards?.length === 0 || handCards === undefined) &&
      (playableBanishedCards?.length === 0 ||
        playableBanishedCards === undefined)
    ) {
      setPlayedCards([]);
    }
  }, [handCards, playableBanishedCards]);

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

  const widthPercentage = Math.min(lengthOfCards * 5, MaxHandWidthPercentage);

  const widthfunction =
    width > height ? { width: `${widthPercentage}%` } : { width: `75%` };

  if (playerID === 3) {
    return <></>;
  }

  const cardsInHandsAlready = [...playedCards];

  return (
    <div className={styles.handRow} style={widthfunction}>
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
                  -(ix + (arsenalCards?.length ?? 0) + (handCards?.length ?? 0))
                }
              />
            );
          })}
        {isManualMode && <ManualMode />}
      </AnimatePresence>
    </div>
  );
}

const ManualMode = () => {
  const [card, setCard] = useState<string>('');
  const dispatch = useAppDispatch();
  const gameInfo = useAppSelector(getGameInfo, shallowEqual);

  const handleCloseManualMode = () => {
    dispatch(
      updateOptions({
        game: gameInfo,
        settings: [
          {
            name: MANUAL_MODE,
            value: '0'
          }
        ]
      })
    );
  };

  const handleSubmitButton = () => {
    if (card === '') {
      return;
    }
    dispatch(
      submitButton({
        button: { mode: PROCESS_INPUT.ADD_CARD_TO_HAND_SELF, cardID: card }
      })
    );
    setCard('');
  };

  return (
    <div className={styles.manualMode}>
      <input onChange={(e) => setCard(e.target.value)}></input>
      <button onClick={handleSubmitButton}>Add</button>
      <button onClick={handleCloseManualMode}>Close</button>
    </div>
  );
};

import React, { useMemo, useEffect } from 'react';
import styles from './ReorderOpt.module.css';
import CardDisplay from '../../../elements/cardDisplay/CardDisplay';
import { Card } from 'features/Card';
import { Reorder } from 'framer-motion';
import { useAppSelector } from 'app/Hooks';
import { useProcessInputAPIMutation } from 'features/api/apiSlice';
import { PROCESS_INPUT } from 'appConstants';
import { getGameInfo } from 'features/game/GameSlice';
import { shallowEqual } from 'react-redux';
import { Console } from 'console';
import Button from 'features/Button';
let change = false;
const ReorderLayers = ({
  topCards,
  bottomCards
}: {
  topCards: Card[];
  bottomCards: Card[];
}) => {
  const { gameID, playerID, authKey } = useAppSelector(
    getGameInfo,
    shallowEqual
  );

  const [cardListTop, setCardListTop] = React.useState<Card[]>([]);
  const [cardListBottom, setCardListBottom] = React.useState<Card[]>([]);
  useMemo(() => {
    setCardListTop(
      topCards.map((card) => {
        return { ...card, borderColor: '8' } as Card;
      }) ?? []
    );
    setCardListBottom(
      bottomCards.map((card) => {
        return { ...card, borderColor: '8' } as Card;
      }) ?? []
    );
  }, [topCards, bottomCards]);

  const [processInputAPI, useProcessInputAPIResponse] =
    useProcessInputAPIMutation();

  const changeTopCardOrder = (newOrder: Card[]) => {
    setCardListTop(newOrder);
    change = true;
  };

  const changeBottomCardOrder = (newOrder: Card[]) => {
    setCardListBottom(newOrder);
    change = true;
  };

  const moveCardToBottom = (card: Card, index: number) => {
    setCardListTop((prev) => prev.filter((_, i) => i !== index));
    setCardListBottom((prev) => [...prev, card]);
    change = true;
  };

  useEffect(() => {
    if (change) {
      const cardNamesTop = cardListTop.map((card) => card.cardNumber);
      const cardNamesBottom = cardListBottom.map((card) => card.cardNumber);
      const body = {
        gameName: gameID,
        playerID: playerID,
        authKey: authKey,
        mode: 106,
        submission: {
          cardListTop: cardNamesTop,
          cardListBottom: cardNamesBottom
        }
      };
      processInputAPI(body);
      change = false;
    }
  }, [cardListTop, cardListBottom]);

  const moveCardToTop = (card: Card, index: number) => {
    setCardListBottom((prev) => prev.filter((_, i) => i !== index));
    setCardListTop((prev) => [...prev, card]);
    change = true;
  };

  const handleDragEnd = () => {
    if (change) {
      const cardNamesTop = cardListTop.map((card) => card.cardNumber);
      const cardNamesBottom = cardListBottom.map((card) => card.cardNumber);
      const body = {
        gameName: gameID,
        playerID: playerID,
        authKey: authKey,
        mode: 106,
        submission: {
          cardListTop: cardNamesTop,
          cardListBottom: cardNamesBottom
        }
      };
      processInputAPI(body);
      change = false;
    }
  };

  const handleSubmit = () => {
    const cardNamesTop = cardListTop.map((card) => card.cardNumber);
    const cardNamesBottom = cardListBottom.map((card) => card.cardNumber);
    const body = {
      gameName: gameID,
      playerID: playerID,
      authKey: authKey,
      mode: 107,
      submission: { cardListTop: cardNamesTop, cardListBottom: cardNamesBottom }
    };
    processInputAPI(body);
  };

  const cardInLayer: string[] = [];
  return (
    <div className={styles.topAndBottomContainer}>
      <div
        className={styles.buttonDiv}
        onClick={(e) => {
          e.preventDefault();
          handleSubmit();
        }}
      >
        Submit Opt
      </div>
      <div className={styles.reorderCards}>
        <div className={styles.topAndBottomText}>Top</div>
        <Reorder.Group
          className={styles.reorderCards}
          values={cardListTop}
          onReorder={changeTopCardOrder}
          axis="x"
        >
          {cardListTop.map((card, ix) => {
            // avoid any jankiness if we have duplicate cards in the layer!
            const layerCount = cardInLayer.filter(
              (value) => value === card.cardNumber
            ).length;
            cardInLayer.push(card.cardNumber);
            return (
              <Reorder.Item
                key={`${card.cardNumber}${layerCount}`}
                value={card}
                className={styles.reorderItem}
                //onDragEnd={handleDragEnd}
              >
                <CardDisplay card={card} key={ix} />
                <div className={styles.buttonRow}>
                  <div
                    className={styles.buttonDiv}
                    onClick={(e) => {
                      e.preventDefault();
                      moveCardToBottom(card, ix);
                    }}
                  >
                    Bottom
                  </div>
                </div>
              </Reorder.Item>
            );
          })}
        </Reorder.Group>
      </div>
      <div className={styles.reorderCards}>
        <div className={styles.topAndBottomText}>Bottom</div>
        <Reorder.Group
          className={styles.reorderCards}
          values={cardListBottom}
          onReorder={changeBottomCardOrder}
          axis="x"
        >
          {cardListBottom.map((card, ix) => {
            // avoid any jankiness if we have duplicate cards in the layer!
            const layerCount = cardInLayer.filter(
              (value) => value === card.cardNumber
            ).length;
            cardInLayer.push(card.cardNumber);

            return (
              <Reorder.Item
                key={`${card.cardNumber}${layerCount}`}
                value={card}
                className={styles.reorderItem}
                //onDragEnd={handleDragEnd}
              >
                <CardDisplay card={card} key={ix} />
                <div className={styles.buttonRow}>
                  <div
                    className={styles.buttonDiv}
                    onClick={(e) => {
                      e.preventDefault();
                      moveCardToTop(card, ix);
                    }}
                  >
                    Top
                  </div>
                </div>
              </Reorder.Item>
            );
          })}
        </Reorder.Group>
      </div>
    </div>
  );
};

export default ReorderLayers;

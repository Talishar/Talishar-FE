import React, { useMemo } from 'react';
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
  };

  const changeBottomCardOrder = (newOrder: Card[]) => {
    setCardListBottom(newOrder);
  };

  const moveCardToBottom = (card: Card, index: number) => {
    setCardListTop((prev) => prev.filter((_, i) => i !== index));
    setCardListBottom((prev) => [...prev, card]);
  };

  const moveCardToTop = (card: Card, index: number) => {
    setCardListBottom((prev) => prev.filter((_, i) => i !== index));
    setCardListTop((prev) => [...prev, card]);
  };

  const handleDragEnd = () => {
    const body = {
      gameName: gameID,
      playerID: playerID,
      authKey: authKey,
      mode: 106,
      submission: { cardListTop: cardListTop, cardListBottom: cardListBottom }
    };
    processInputAPI(body);
  };

  const cardInLayer = [] as string[];

  return (
    <div className={styles.topAndBottomContainer}>
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
                onDragEnd={handleDragEnd}
              >
                <CardDisplay card={card} key={ix} />
                <div className={styles.buttonRow}>
                  <div
                    className={styles.buttonDiv}
                    onClick={(e) => {
                      e.preventDefault();
                      moveCardToBottom(card, ix);
                      handleDragEnd();
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
                onDragEnd={handleDragEnd}
              >
                <CardDisplay card={card} key={ix} />
                <div className={styles.buttonRow}>
                  <div
                    className={styles.buttonDiv}
                    onClick={(e) => {
                      e.preventDefault();
                      moveCardToTop(card, ix);
                      handleDragEnd();
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

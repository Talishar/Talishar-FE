import React, { useMemo } from 'react';
import styles from './ReorderLayers.module.css';
import CardDisplay from '../../../elements/cardDisplay/CardDisplay';
import { Card } from 'features/Card';
import { Reorder } from 'framer-motion';
import { useAppSelector } from 'app/Hooks';
import { useProcessInputAPIMutation } from 'features/api/apiSlice';
import { PROCESS_INPUT } from 'appConstants';
import { getGameInfo } from 'features/game/GameSlice';
import { shallowEqual } from 'react-redux';

const ReorderLayers = ({ cards }: { cards: Card[] }) => {
  const { gameID, playerID, authKey } = useAppSelector(
    getGameInfo,
    shallowEqual
  );
  const [cardList, setCardList] = React.useState<Card[]>([]);
  useMemo(() => {
    setCardList(
      cards.map((card) => {
        return { ...card, borderColor: '8' } as Card;
      }) ?? []
    );
  }, [cards]);
  const [processInputAPI, useProcessInputAPIResponse] =
    useProcessInputAPIMutation();

  const changeCardOrder = (newOrder: Card[]) => {
    setCardList(newOrder);
  };

  const handleDragEnd = () => {
    const layers = [];
    for (const card of cardList) {
      if (card.cardNumber === 'FINALIZECHAINLINK') continue;
      layers.unshift(card.layer);
    }
    const body = {
      gameName: gameID,
      playerID: playerID,
      authKey: authKey,
      mode: PROCESS_INPUT.REORDER_LAYERS,
      submission: { layers: layers }
    };
    processInputAPI(body);
  };

  const cardInLayer = [] as string[];

  return (
    <Reorder.Group
      className={styles.reorderCards}
      values={cardList}
      onReorder={changeCardOrder}
      axis="x"
    >
      {cardList.map((card, ix) => {
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
            <div className={styles.countersCover}><div className={styles.number}><div className={styles.text}>{1 + cardList.length - cardInLayer.length}</div></div></div>
          </Reorder.Item>
        );
      })}
    </Reorder.Group>
  );
};

export default ReorderLayers;

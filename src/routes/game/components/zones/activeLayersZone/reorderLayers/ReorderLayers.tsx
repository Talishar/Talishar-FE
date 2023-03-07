import React from 'react';
import styles from './ReorderLayers.module.css';
import CardDisplay from '../../../elements/cardDisplay/CardDisplay';
import { Card } from 'features/Card';
import { Reorder } from 'framer-motion';
import { useAppSelector } from 'app/Hooks';
import { useProcessInputAPIMutation } from 'features/api/apiSlice';
import { PROCESS_INPUT } from 'appConstants';

const ReorderLayers = ({ cards }: { cards: Card[] }) => {
  const gameInfo = useAppSelector((state) => state.game.gameInfo);
  const [cardList, setCardList] = React.useState(
    cards.map((card) => {
      return { ...card, borderColor: '8' } as Card;
    })
  );
  const [processInputAPI, useProcessInputAPIResponse] =
    useProcessInputAPIMutation();

  const changeCardOrder = (newOrder: Card[]) => {
    setCardList(newOrder);
  };

  const handleDragEnd = () => {
    const layers = [];
    for (const card of cardList) {
      if (card.cardNumber === 'FINALIZECHAINLINK') continue;
      layers.push(card.layer);
    }
    const body = {
      gameName: gameInfo.gameID,
      playerID: gameInfo.playerID,
      authKey: gameInfo.authKey,
      mode: PROCESS_INPUT.REORDER_LAYERS,
      submission: { layers: layers }
    };
    processInputAPI(body);
  };
  return (
    <Reorder.Group
      className={styles.reorderCards}
      values={cardList}
      onReorder={changeCardOrder}
      axis="x"
    >
      {cardList.map((card, ix) => {
        return (
          <Reorder.Item
            key={card.layer}
            value={card}
            className={styles.reorderItem}
            onDragEnd={handleDragEnd}
          >
            <CardDisplay card={card} key={ix} />
          </Reorder.Item>
        );
      })}
    </Reorder.Group>
  );
};

export default ReorderLayers;

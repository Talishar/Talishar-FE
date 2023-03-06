import React, { useMemo } from 'react';
import styles from './ReorderLayers.module.css';
import CardDisplay from '../../../elements/cardDisplay/CardDisplay';
import { Card } from 'features/Card';
import { Reorder } from 'framer-motion';
import { useAppDispatch, useAppSelector } from 'app/Hooks';
import { useProcessInputAPIMutation } from 'features/api/apiSlice';
import { PROCESS_INPUT } from 'appConstants';

const ReorderLayers = ({ cards }: { cards: Card[] }) => {
  const gameInfo = useAppSelector((state) => state.game.gameInfo);
  const [cardList, setCardList] = React.useState(cards);
  const [processInputAPI, useProcessInputAPIResponse] =
    useProcessInputAPIMutation();
  const dispatch = useAppDispatch();

  const changeCardOrder = (newOrder: Card[]) => {
    // force Resolution to always be first.
    const sorted = newOrder.sort((a, b) => {
      if (
        a.cardNumber === 'FINALIZECHAINLINK' &&
        b.cardNumber !== 'FINALIZECHAINLINK'
      )
        return -1;
      if (
        a.cardNumber !== 'FINALIZECHAINLINK' &&
        b.cardNumber === 'FINALIZECHAINLINK'
      )
        return 1;
      return 0;
    });
    setCardList(sorted);
  };

  const handleDragEnd = () => {
    console.log('submit order to BE', cardList);
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
    <div>
      <h3 className={styles.subtitle}>
        Drag to reorder (the cards will resolve from right to left)
      </h3>
      <p className={styles.orderingExplanation}>
        For more info about trigger ordering, see rule 1.10.2c of the
        comprehensive rulebook.
      </p>
      <Reorder.Group
        className={styles.activeLayersContents}
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
              <CardDisplay card={card} key={ix} makeMeBigger />
            </Reorder.Item>
          );
        })}
      </Reorder.Group>
    </div>
  );
};

export default ReorderLayers;

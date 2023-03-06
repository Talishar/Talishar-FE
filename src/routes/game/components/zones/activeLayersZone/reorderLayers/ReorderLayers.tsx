import React from 'react';
import styles from './ReorderLayers.module.css';
import CardDisplay from '../../../elements/cardDisplay/CardDisplay';
import { Card } from 'features/Card';
import { Reorder } from 'framer-motion';

const ReorderLayers = ({ cards }: { cards: Card[] }) => {
  const [cardList, setCardList] = React.useState(cards);

  const changeCardOrder = (newOrder: Card[]) => {
    // force Resolution to always be first.

    setCardList(newOrder);
  };
  return (
    <Reorder.Group
      className={styles.activeLayersContents}
      values={cardList}
      onReorder={setCardList}
      axis="x"
    >
      {cardList.map((card, ix) => {
        return (
          <Reorder.Item
            key={card.layer}
            value={card}
            className={styles.reorderItem}
          >
            <CardDisplay card={card} key={ix} makeMeBigger />
          </Reorder.Item>
        );
      })}
    </Reorder.Group>
  );
};

export default ReorderLayers;

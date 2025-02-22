import { Field, useFormikContext } from 'formik';
import React from 'react';
import CardImage from 'routes/game/components/elements/cardImage/CardImage';
import { DeckResponse } from 'interface/API/GetLobbyInfo.php';
import styles from './Deck.module.css';
import CardPopUp from 'routes/game/components/elements/cardPopUp/CardPopUp';
import { useLanguageSelector } from 'hooks/useLanguageSelector';
import { CARD_SQUARES_PATH, getCollectionCardImagePath } from 'utils';

type DeckProps = {
  deck: String[];
};

const Deck = ({ deck }: DeckProps) => {
  const { values } = useFormikContext<DeckResponse>();
  const { getLanguage } = useLanguageSelector();

  const getImageSrc = (currentCardNumber: string) =>
    getCollectionCardImagePath({
      path: CARD_SQUARES_PATH,
      locale: getLanguage(),
      cardNumber: currentCardNumber
    });

  return (
    <div className={styles.container}>
      {deck.map((card, ix) => {
        return (
          <div key={`deck${ix}`} className={styles.deckCardContainer}>
            <label>
              <Field type="checkbox" name="deck" value={`${card}`} />
              <CardPopUp cardNumber={card.split("-")[0]}>
                <CardImage
                  src={getImageSrc(card.split("-")[0])}
                  draggable={false}
                  className={styles.card}
                />
              </CardPopUp>
            </label>
          </div>
        );
      })}
    </div>
  );
};

export default Deck;

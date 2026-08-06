import { FormProps } from '../playerInputPopupTypes';
import React, { useMemo, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import styles from '../PlayerInputPopUp.module.css';
import CardDisplay from '../../cardDisplay/CardDisplay';
import { Card } from 'features/Card';
import { Reorder } from 'framer-motion';
import { useAppSelector } from 'app/Hooks';
import { useProcessInputAPIMutation } from 'features/api/apiSlice';
import { getGameInfo } from 'features/game/GameSlice';
import { shallowEqual } from 'react-redux';
import classNames from 'classnames';

let change = false;
let buttonClick = false;
const TriggerOrdering = ({ topCards }: { topCards: Card[] }) => {
  const { gameID, playerID, authKey } = useAppSelector(
    getGameInfo,
    shallowEqual
  );

  const { t } = useTranslation();
  const [cardListTop, setCardListTop] = React.useState<Card[]>([]);

  useMemo(() => {
    setCardListTop(
      topCards.map((card, index) => {
        return {
          ...card,
          borderColor: '8',
          uniqueId: `${card.cardNumber}-${index}`
        } as Card;
      }) ?? []
    );
  }, [topCards]);

  const [processInputAPI] = useProcessInputAPIMutation();

  const changeTopCardOrder = (newOrder: Card[]) => {
    setCardListTop(newOrder);
    change = true;
  };

  useEffect(() => {
    if (buttonClick) {
      const cardNamesTop = cardListTop.map((card) => card.cardNumber);
      const body = {
        gameName: gameID,
        playerID: playerID,
        authKey: authKey,
        mode: 108,
        submission: {
          cardListTop: cardNamesTop
        }
      };
      processInputAPI(body);
      change = false;
      buttonClick = false;
    }
  }, [cardListTop]);

  const handleDragEnd = () => {
    if (change) {
      const cardNamesTop = cardListTop.map((card) => card.cardNumber);
      const body = {
        gameName: gameID,
        playerID: playerID,
        authKey: authKey,
        mode: 108,
        submission: {
          cardListTop: cardNamesTop
        }
      };
      processInputAPI(body);
      change = false;
    }
  };

  const handleSubmit = () => {
    const cardNamesTop = cardListTop.map((card) => card.cardNumber);
    const body = {
      gameName: gameID,
      playerID: playerID,
      authKey: authKey,
      mode: 109,
      submission: { cardListTop: cardNamesTop }
    };
    processInputAPI(body);
  };

  return (
    <div className={classNames(styles.newOptForm, styles.optFormContainer)}>
      <div
        className={classNames(
          styles.newOptForm,
          styles.buttonDiv,
          styles.submitButtonDiv
        )}
        onClick={(e) => {
          e.preventDefault();
          handleSubmit();
        }}
      >
        {t('PLAYER_INPUT.SUBMIT')}
      </div>
      <div className={classNames(styles.newOptForm, styles.cardsContainer)}>
        <div className={classNames(styles.newOptForm, styles.reorderCards)}>
          <div
            className={classNames(styles.newOptForm, styles.topAndBottomText)}
          >
            {t('PLAYER_INPUT.TRIGGERS')}
          </div>
          <Reorder.Group
            className={classNames(styles.newOptForm, styles.reorderCards)}
            values={cardListTop}
            onReorder={changeTopCardOrder}
            axis="x"
          >
            {cardListTop.map((card, ix) => {
              return (
                <Reorder.Item
                  key={card.uniqueId}
                  value={card}
                  className={classNames(styles.newOptForm, styles.reorderItem)}
                  onDragEnd={handleDragEnd}
                >
                  <CardDisplay card={card} key={ix} />
                </Reorder.Item>
              );
            })}
          </Reorder.Group>
        </div>
      </div>
    </div>
  );
};

export const TriggerOrderInput = (props: FormProps) => {
  const { topCards } = props;

  return (
    <div className={classNames(styles.newOptForm, styles.optFormContainer)}>
      <TriggerOrdering topCards={topCards ?? []} />
    </div>
  );
};

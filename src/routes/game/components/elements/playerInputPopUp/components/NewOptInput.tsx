import { FormProps } from '../playerInputPopupTypes';
import React, { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import styles from '../PlayerInputPopUp.module.css';
import CardDisplay from '../../../elements/cardDisplay/CardDisplay';
import { Card } from 'features/Card';
import { Reorder } from 'framer-motion';
import { useAppSelector } from 'app/Hooks';
import { useProcessInputAPIMutation } from 'features/api/apiSlice';
import { getGameInfo } from 'features/game/GameSlice';
import { shallowEqual } from 'react-redux';
import classNames from 'classnames';

let change = false;
let buttonClick = false;
const prepareCards = (cards: Card[]): Card[] =>
  cards.map(
    (card, index) =>
      ({
        ...card,
        borderColor: '8',
        uniqueId: `${card.cardNumber}-${index}`
      } as Card)
  );

const ReorderOpt = ({
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

  const { t } = useTranslation();
  const [previousCards, setPreviousCards] = React.useState({
    top: topCards,
    bottom: bottomCards
  });
  const [cardListTop, setCardListTop] = React.useState<Card[]>(() =>
    prepareCards(topCards)
  );
  const [cardListBottom, setCardListBottom] = React.useState<Card[]>(() =>
    prepareCards(bottomCards)
  );
  if (topCards !== previousCards.top || bottomCards !== previousCards.bottom) {
    setPreviousCards({ top: topCards, bottom: bottomCards });
    setCardListTop(prepareCards(topCards));
    setCardListBottom(prepareCards(bottomCards));
  }

  const [processInputAPI] = useProcessInputAPIMutation();

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
    buttonClick = true;
  };

  const moveCardToTop = (card: Card, index: number) => {
    setCardListBottom((prev) => prev.filter((_, i) => i !== index));
    setCardListTop((prev) => [...prev, card]);
    buttonClick = true;
  };

  useEffect(() => {
    if (buttonClick) {
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
      buttonClick = false;
    }
  }, [cardListTop, cardListBottom]);

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

  const cardCounts = new Map<string, number>();
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
        {t('PLAYER_INPUT.NEW_OPT_SUBMIT')}
      </div>
      <div className={classNames(styles.newOptForm, styles.cardsContainer)}>
        <div className={classNames(styles.newOptForm, styles.reorderCards)}>
          <div
            className={classNames(styles.newOptForm, styles.topAndBottomText)}
          >
            {t('PLAYER_INPUT.NEW_OPT_TOP')}
          </div>
          <Reorder.Group
            className={classNames(styles.newOptForm, styles.reorderCards)}
            values={cardListTop}
            onReorder={changeTopCardOrder}
            axis="x"
          >
            {cardListTop.map((card, ix) => {
              // avoid any jankiness if we have duplicate cards in the layer!
              const layerCount = cardCounts.get(card.cardNumber) ?? 0;
              cardCounts.set(card.cardNumber, layerCount + 1);
              const isFirst = ix === 0;
              const isLast = ix === cardListTop.length - 1;
              const showLabels = cardListTop.length > 1;
              return (
                <Reorder.Item
                  key={card.uniqueId}
                  value={card}
                  className={classNames(styles.newOptForm, styles.reorderItem)}
                  onDragEnd={handleDragEnd}
                >
                  <div className={styles.cardWrapper}>
                    {showLabels && isFirst && (
                      <div
                        className={classNames(
                          styles.positionLabel,
                          styles.firstLabel
                        )}
                      >
                        {t('PLAYER_INPUT.NEW_OPT_FIRST')}
                      </div>
                    )}
                    {showLabels && isLast && (
                      <div
                        className={classNames(
                          styles.positionLabel,
                          styles.lastLabel
                        )}
                      >
                        {t('PLAYER_INPUT.NEW_OPT_LAST')}
                      </div>
                    )}
                    <CardDisplay card={card} key={ix} />
                  </div>
                  <div
                    className={classNames(styles.newOptForm, styles.buttonRow)}
                  >
                    <div
                      className={classNames(
                        styles.newOptForm,
                        styles.buttonDiv,
                        styles.topBottomButtonDiv
                      )}
                      onClick={(e) => {
                        e.preventDefault();
                        moveCardToBottom(card, ix);
                      }}
                    >
                      {t('PLAYER_INPUT.NEW_OPT_BOTTOM')}
                    </div>
                  </div>
                </Reorder.Item>
              );
            })}
          </Reorder.Group>
        </div>
        <div className={classNames(styles.newOptForm, styles.reorderCards)}>
          <div
            className={classNames(styles.newOptForm, styles.topAndBottomText)}
          >
            {t('PLAYER_INPUT.NEW_OPT_BOTTOM')}
          </div>
          <Reorder.Group
            className={classNames(styles.newOptForm, styles.reorderCards)}
            values={cardListBottom}
            onReorder={changeBottomCardOrder}
            axis="x"
          >
            {cardListBottom.map((card, ix) => {
              // avoid any jankiness if we have duplicate cards in the layer!
              const layerCount = cardCounts.get(card.cardNumber) ?? 0;
              cardCounts.set(card.cardNumber, layerCount + 1);
              const isFirst = ix === 0;
              const isLast = ix === cardListBottom.length - 1;
              const showLabels = cardListBottom.length > 1;

              return (
                <Reorder.Item
                  key={`${card.cardNumber}${layerCount}`}
                  value={card}
                  className={classNames(styles.newOptForm, styles.reorderItem)}
                  onDragEnd={handleDragEnd}
                >
                  <div className={styles.cardWrapper}>
                    {showLabels && isFirst && (
                      <div
                        className={classNames(
                          styles.positionLabel,
                          styles.firstLabel
                        )}
                      >
                        {t('PLAYER_INPUT.NEW_OPT_FIRST')}
                      </div>
                    )}
                    {showLabels && isLast && (
                      <div
                        className={classNames(
                          styles.positionLabel,
                          styles.lastLabel
                        )}
                      >
                        {t('PLAYER_INPUT.NEW_OPT_LAST')}
                      </div>
                    )}
                    <CardDisplay card={card} key={ix} />
                  </div>
                  <div
                    className={classNames(styles.newOptForm, styles.buttonRow)}
                  >
                    <div
                      className={classNames(
                        styles.newOptForm,
                        styles.buttonDiv,
                        styles.topBottomButtonDiv
                      )}
                      onClick={(e) => {
                        e.preventDefault();
                        moveCardToTop(card, ix);
                      }}
                    >
                      {t('PLAYER_INPUT.NEW_OPT_TOP')}
                    </div>
                  </div>
                </Reorder.Item>
              );
            })}
          </Reorder.Group>
        </div>
      </div>
    </div>
  );
};

export const NewOptInput = (props: FormProps) => {
  const { topCards, bottomCards } = props;

  return (
    <div className={classNames(styles.newOptForm, styles.optFormContainer)}>
      <ReorderOpt topCards={topCards ?? []} bottomCards={bottomCards ?? []} />
    </div>
  );
};

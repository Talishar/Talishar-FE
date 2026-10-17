import { FormProps } from '../playerInputPopupTypes';
import React from 'react';
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
import { prepareCards } from '../prepareCards';

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
  const submitPending = React.useRef(false);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  if (topCards !== previousCards.top || bottomCards !== previousCards.bottom) {
    setPreviousCards({ top: topCards, bottom: bottomCards });
    setCardListTop(prepareCards(topCards));
    setCardListBottom(prepareCards(bottomCards));
  }

  const [processInputAPI] = useProcessInputAPIMutation();

  // Keep the latest lists in a ref so drag-end handlers never sync a stale order
  const latestLists = React.useRef({
    top: cardListTop,
    bottom: cardListBottom
  });
  latestLists.current = { top: cardListTop, bottom: cardListBottom };
  const orderChanged = React.useRef(false);

  // The server resolves the opt from its own copy of the order when the player
  // passes instead of clicking submit, so every change has to be synced (mode 106)
  const syncOrder = (top: Card[], bottom: Card[]) => {
    orderChanged.current = false;
    processInputAPI({
      gameName: gameID,
      playerID: playerID,
      authKey: authKey,
      mode: 106,
      submission: {
        cardListTop: top.map((card) => card.cardNumber),
        cardListBottom: bottom.map((card) => card.cardNumber)
      }
    });
  };

  const handleDragEnd = () => {
    if (!orderChanged.current) return;
    syncOrder(latestLists.current.top, latestLists.current.bottom);
  };

  const changeTopCardOrder = (newOrder: Card[]) => {
    setCardListTop(newOrder);
    orderChanged.current = true;
  };

  const changeBottomCardOrder = (newOrder: Card[]) => {
    setCardListBottom(newOrder);
    orderChanged.current = true;
  };

  const moveCardToBottom = (card: Card, index: number) => {
    const newTop = cardListTop.filter((_, i) => i !== index);
    const newBottom = [...cardListBottom, card];
    setCardListTop(newTop);
    setCardListBottom(newBottom);
    syncOrder(newTop, newBottom);
  };

  const moveCardToTop = (card: Card, index: number) => {
    const newBottom = cardListBottom.filter((_, i) => i !== index);
    const newTop = [...cardListTop, card];
    setCardListBottom(newBottom);
    setCardListTop(newTop);
    syncOrder(newTop, newBottom);
  };

  const handleSubmit = () => {
    if (submitPending.current) return;
    submitPending.current = true;
    setIsSubmitting(true);
    processInputAPI({
      gameName: gameID,
      playerID: playerID,
      authKey: authKey,
      mode: 107,
      submission: {
        cardListTop: cardListTop.map((card) => card.cardNumber),
        cardListBottom: cardListBottom.map((card) => card.cardNumber)
      }
    })
      .unwrap()
      .catch(() => undefined)
      .finally(() => {
        submitPending.current = false;
        setIsSubmitting(false);
      });
  };

  const cardCounts = new Map<string, number>();
  return (
    <div
      className={classNames(
        styles.newOptForm,
        styles.optFormContainer,
        styles.cardOrderForm
      )}
    >
      <button
        type="button"
        disabled={isSubmitting}
        className={classNames(
          styles.newOptForm,
          styles.buttonDiv,
          styles.submitButtonDiv
        )}
        onClick={handleSubmit}
      >
        {t('PLAYER_INPUT.NEW_OPT_SUBMIT')}
      </button>
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

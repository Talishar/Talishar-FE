import { FormProps } from '../playerInputPopupTypes';
import React from 'react';
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
import { prepareCards } from '../prepareCards';

const CardOrdering = ({
  topCards,
  submitMode,
  labelKey
}: {
  topCards: Card[];
  submitMode: number;
  labelKey: string;
}) => {
  const { gameID, playerID, authKey } = useAppSelector(
    getGameInfo,
    shallowEqual
  );

  const { t } = useTranslation();
  const [previousTopCards, setPreviousTopCards] = React.useState(topCards);
  const [cardListTop, setCardListTop] = React.useState<Card[]>(() =>
    prepareCards(topCards)
  );
  const submitPending = React.useRef(false);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  if (topCards !== previousTopCards) {
    setPreviousTopCards(topCards);
    setCardListTop(prepareCards(topCards));
  }

  const [processInputAPI] = useProcessInputAPIMutation();

  // Keep the latest list in a ref so drag-end handlers never sync a stale order
  const latestList = React.useRef(cardListTop);
  latestList.current = cardListTop;
  const orderChanged = React.useRef(false);

  const changeTopCardOrder = (newOrder: Card[]) => {
    setCardListTop(newOrder);
    orderChanged.current = true;
  };

  const submitOrder = (mode: number) => {
    return processInputAPI({
      gameName: gameID,
      playerID: playerID,
      authKey: authKey,
      mode: mode,
      submission: {
        cardListTop: latestList.current.map((card) => card.cardNumber)
      }
    });
  };

  // Sync the order (mode 108) so passing instead of clicking submit accepts it
  const handleDragEnd = () => {
    if (!orderChanged.current) return;
    orderChanged.current = false;
    submitOrder(108);
  };

  const handleSubmit = () => {
    if (submitPending.current) return;
    submitPending.current = true;
    setIsSubmitting(true);
    submitOrder(submitMode)
      .unwrap()
      .catch(() => undefined)
      .finally(() => {
        submitPending.current = false;
        setIsSubmitting(false);
      });
  };

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
        {t('PLAYER_INPUT.SUBMIT')}
      </button>
      <div className={classNames(styles.newOptForm, styles.cardsContainer)}>
        <div className={classNames(styles.newOptForm, styles.reorderCards)}>
          <div
            className={classNames(styles.newOptForm, styles.topAndBottomText)}
          >
            {t(labelKey)}
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

const cardOrderInput = (submitMode: number, labelKey: string) =>
  function CardOrderInput(props: FormProps) {
    const { topCards } = props;

    return (
      <div className={classNames(styles.newOptForm, styles.optFormContainer)}>
        <CardOrdering
          topCards={topCards ?? []}
          submitMode={submitMode}
          labelKey={labelKey}
        />
      </div>
    );
  };

export const RearrangeTopInput = cardOrderInput(
  110,
  'PLAYER_INPUT.NEW_OPT_TOP'
);
export const TriggerOrderInput = cardOrderInput(109, 'PLAYER_INPUT.TRIGGERS');

import { useRef, useState } from 'react';
import {
  clearPopUp,
  playCard,
  removeCardFromHand
} from 'features/game/GameSlice';
import { GiTombstone, GiFluffySwirl, GiCannon } from 'react-icons/gi';
import { Card } from 'features/Card';
import styles from './PlayerHandCard.module.css';
import Draggable, { DraggableData, DraggableEvent } from 'react-draggable';
import { useAppDispatch } from 'app/Hooks';
import { LONG_PRESS_TIMER } from 'appConstants';
import classNames from 'classnames';
import CardImage from '../cardImage/CardImage';
import CardPopUp from '../cardPopUp/CardPopUp';
import useWindowDimensions from 'hooks/useWindowDimensions';

const ScreenPercentageForCardPlayed = 0.25;

export interface HandCard {
  isArsenal?: boolean;
  isGraveyard?: boolean;
  isBanished?: boolean;
  card?: Card;
  addCardToPlayedCards: (cardName: string) => void;
}

export const PlayerHandCard = ({
  card,
  isArsenal,
  isBanished,
  isGraveyard,
  addCardToPlayedCards
}: HandCard) => {
  const [controlledPosition, setControlledPosition] = useState({ x: 0, y: 0 });
  const [canPopUp, setCanPopup] = useState(true);
  const [, windowHeight] = useWindowDimensions();

  // ref to determine if we have a long press or a short tap.
  const timerRef = useRef<ReturnType<typeof setTimeout>>();
  const isLongPress = useRef<boolean>();

  if (card === undefined) {
    return <div className={styles.handCard}></div>;
  }
  const src = `/cardimages/${card.cardNumber}.webp`;
  const dispatch = useAppDispatch();

  const onDragStop = (_: DraggableEvent, data: DraggableData) => {
    if (data.lastY < -windowHeight * ScreenPercentageForCardPlayed) {
      playCardFunc();
      addCardToPlayedCards(card.cardNumber);
    }
    setControlledPosition({ x: 0, y: 0 });
    setCanPopup(true);
  };

  const playCardFunc = () => {
    dispatch(playCard({ cardParams: card }));
    dispatch(clearPopUp());
    if (!isBanished && !isGraveyard && !isArsenal) {
      dispatch(removeCardFromHand({ card }));
    }
  };

  const onDrag = () => {
    dispatch(clearPopUp());
    setCanPopup(false);
  };

  const onClick = () => {
    if (!isLongPress.current) {
      playCardFunc();
    }
  };

  const startPressTimer = () => {
    isLongPress.current = false;
    timerRef.current = setTimeout(() => {
      isLongPress.current = true;
    }, LONG_PRESS_TIMER);
  };

  const imgStyles = classNames(styles.img, {
    [styles.border1]: card.borderColor == '1',
    [styles.border2]: card.borderColor == '2',
    [styles.border3]: card.borderColor == '3',
    [styles.border4]: card.borderColor == '4',
    [styles.border5]: card.borderColor == '5',
    [styles.border6]: card.borderColor == '6',
    [styles.border7]: card.borderColor == '7'
  });

  return (
    <div
      className={styles.handCard}
      onClick={onClick}
      onMouseDown={startPressTimer}
      onMouseUp={() => clearTimeout(timerRef.current)}
      onTouchStart={startPressTimer}
      onTouchEnd={() => clearTimeout(timerRef.current)}
    >
      <CardPopUp
        containerClass={styles.imgContainer}
        cardNumber={card.cardNumber}
        isHidden={!canPopUp}
      >
        <Draggable
          onStop={onDragStop}
          onDrag={onDrag}
          position={controlledPosition}
        >
          <div>
            <CardImage src={src} className={imgStyles} draggable="false" />
            <div className={styles.iconCol}>
              {isArsenal === true && (
                <div className={styles.icon}>
                  <GiCannon title="Arsenal" />
                </div>
              )}
              {isBanished === true && (
                <div className={styles.icon}>
                  <GiFluffySwirl title="Banished Zone" />
                </div>
              )}
              {isGraveyard === true && (
                <div className={styles.icon}>
                  <GiTombstone title="Graveyard" />
                </div>
              )}
            </div>
          </div>
        </Draggable>
      </CardPopUp>
    </div>
  );
};

export default PlayerHandCard;

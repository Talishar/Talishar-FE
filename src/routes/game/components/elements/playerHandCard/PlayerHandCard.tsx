import { useRef, useState } from 'react';
import {
  clearPopUp,
  playCard,
  removeCardFromHand
} from 'features/game/GameSlice';
import { GiTombstone, GiFluffySwirl, GiCannon } from 'react-icons/gi';
import { Card } from 'features/Card';
import styles from './PlayerHandCard.module.css';
import { useAppDispatch } from 'app/Hooks';
import { LONG_PRESS_TIMER } from 'appConstants';
import classNames from 'classnames';
import CardImage from '../cardImage/CardImage';
import CardPopUp from '../cardPopUp/CardPopUp';
import useWindowDimensions from 'hooks/useWindowDimensions';
import { motion, PanInfo } from 'framer-motion';

const ScreenPercentageForCardPlayed = 0.25;

export interface HandCard {
  isArsenal?: boolean;
  isGraveyard?: boolean;
  isBanished?: boolean;
  card?: Card;
  zIndex?: number;
  addCardToPlayedCards: (cardName: string) => void;
}

export const PlayerHandCard = ({
  card,
  isArsenal,
  isBanished,
  isGraveyard,
  zIndex,
  addCardToPlayedCards
}: HandCard) => {
  const [canPopUp, setCanPopup] = useState(true);
  const [, windowHeight] = useWindowDimensions();
  const [snapback, setSnapback] = useState<boolean>(true);

  // ref to determine if we have a long press or a short tap.
  const timerRef = useRef<ReturnType<typeof setTimeout>>();
  const isLongPress = useRef<boolean>();

  if (card === undefined) {
    return <div className={styles.handCard}></div>;
  }
  const src = `/cardimages/${card.cardNumber}.webp`;
  const dispatch = useAppDispatch();

  const handleDragEnd = (
    event: MouseEvent | TouchEvent | PointerEvent,
    info: PanInfo
  ) => {
    if (
      Math.abs(info.offset.y) >
      windowHeight * ScreenPercentageForCardPlayed
    ) {
      setSnapback(false);
      playCardFunc();
      addCardToPlayedCards(card.cardNumber);
    }
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
    if (canPopUp) {
      setSnapback(true);
      dispatch(clearPopUp());
      setCanPopup(false);
    }
  };

  const handleOnClick = () => {
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

  const stopPressTimer = () => {
    clearTimeout(timerRef.current);
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
    <motion.div
      drag
      className={styles.handCard}
      style={{ touchAction: 'none', zIndex }}
      onClick={handleOnClick}
      onTapStart={startPressTimer}
      onTap={stopPressTimer}
      onDragEnd={handleDragEnd}
      onDrag={onDrag}
      dragSnapToOrigin={snapback}
      initial={{ opacity: 0, y: 100 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.1, y: -50 }}
    >
      <CardPopUp
        containerClass={styles.imgContainer}
        cardNumber={card.cardNumber}
        isHidden={!canPopUp}
      >
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
      </CardPopUp>
    </motion.div>
  );
};

export default PlayerHandCard;

import { useRef, useState, useEffect } from 'react';
import {
  clearPopUp,
  playCard,
  removeCardFromHand
} from 'features/game/GameSlice';
import {
  GiTombstone,
  GiFluffySwirl,
  GiCannon,
  GiDialPadlock
} from 'react-icons/gi';
import { Card } from 'features/Card';
import styles from './PlayerHandCard.module.css';
import { useAppDispatch } from 'app/Hooks';
import { LONG_PRESS_TIMER } from 'appConstants';
import classNames from 'classnames';
import CardImage from '../cardImage/CardImage';
import CardPopUp from '../cardPopUp/CardPopUp';
import useWindowDimensions from 'hooks/useWindowDimensions';
import { motion, PanInfo } from 'framer-motion';
import { CARD_SQUARES_PATH, getCollectionCardImagePath } from 'utils';
import { useLanguageSelector } from 'hooks/useLanguageSelector';

const ScreenPercentageForCardPlayed = 0.25;

export interface HandCard {
  isArsenal?: boolean;
  isGraveyard?: boolean;
  isBanished?: boolean;
  card?: Card;
  zIndex?: number;
  addCardToPlayedCards: (cardName: string) => void;
  isNewlyDrawn?: boolean;
  disableDrag?: boolean;
  onHandReorderDragStart?: () => void;
  onHandReorderDragMove?: (info: PanInfo) => void;
  onHandReorderDragEnd?: (info: PanInfo) => boolean;
  onHandReorderDragCancel?: () => void;
}

export const PlayerHandCard = ({
  card,
  isArsenal,
  isBanished,
  isGraveyard,
  zIndex,
  addCardToPlayedCards,
  isNewlyDrawn,
  disableDrag,
  onHandReorderDragStart,
  onHandReorderDragMove,
  onHandReorderDragEnd,
  onHandReorderDragCancel
}: HandCard) => {
  const [canPopUp, setCanPopup] = useState(true);
  const [isDragging, setIsDragging] = useState(false);
  const [, windowHeight] = useWindowDimensions();
  const [snapback, setSnapback] = useState<boolean>(true);
  const { getLanguage } = useLanguageSelector();

  // ref to determine if we have a long press or a short tap.
  const timerRef = useRef<ReturnType<typeof setTimeout>>();
  const isLongPress = useRef<boolean>();
  const hasDispatchedClearRef = useRef<boolean>(false);
  const draggedRef = useRef<boolean>(false);

  if (card === undefined) {
    return <div className={styles.handCard}></div>;
  }

  const src = getCollectionCardImagePath({
    path: CARD_SQUARES_PATH,
    locale: getLanguage(),
    cardNumber: card.cardNumber
  });
  const dispatch = useAppDispatch();

  const handleDragStart = () => {
    setIsDragging(true);
    onHandReorderDragStart?.();
  };

  const handleDragEnd = (
    event: MouseEvent | TouchEvent | PointerEvent,
    info: PanInfo
  ) => {
    const absY = Math.abs(info.offset.y);
    const absX = Math.abs(info.offset.x);

    // Only play card on drag if vertical movement is significant (prevent accidental plays on scroll)
    const isMobile = windowHeight > 800;
    const dragThreshold = isMobile
      ? windowHeight * ScreenPercentageForCardPlayed * 1.5 // Higher threshold on mobile
      : windowHeight * ScreenPercentageForCardPlayed;

    if (absY > dragThreshold) {
      if (card.action) {
        setSnapback(false);
        playCardFunc();
        addCardToPlayedCards(card.cardNumber);
      }
    } else if (onHandReorderDragEnd && absX > 8 && absX > absY) {
      onHandReorderDragEnd(info);
    }

    draggedRef.current = false;
    setIsDragging(false);
    setCanPopup(true);
    hasDispatchedClearRef.current = false;
    onHandReorderDragCancel?.();
  };

  const playCardFunc = () => {
    dispatch(playCard({ cardParams: card }));
    dispatch(clearPopUp());
    if (!isBanished && !isGraveyard && !isArsenal) {
      dispatch(removeCardFromHand({ card }));
    }
  };

  const onDrag = (
    event: MouseEvent | TouchEvent | PointerEvent,
    info: PanInfo
  ) => {
    onHandReorderDragMove?.(info);

    if (Math.abs(info.offset.x) > 8 || Math.abs(info.offset.y) > 8) {
      draggedRef.current = true;
    }

    if (canPopUp && !hasDispatchedClearRef.current) {
      setSnapback(true);
      if (!isLongPress.current) {
        dispatch(clearPopUp());
        hasDispatchedClearRef.current = true;
        setCanPopup(false);
      }
    }
  };

  const handleOnClick = () => {
    if (draggedRef.current) {
      draggedRef.current = false;
      return;
    }

    // Tap to play card (unless it was a long press which shows preview)
    if (!isLongPress.current) {
      if (!card.action) return;
      playCardFunc();
      addCardToPlayedCards(card.cardNumber);
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
    [styles.border7]: card.borderColor == '7',
    [styles.border8]: card.borderColor == '8',
    [styles.border9]: card.borderColor == '9'
  });

  // Calculate initial position for draw animation
  const getInitialPosition = () => {
    if (isNewlyDrawn) {
      return { opacity: 0, y: 100 };
    }
    return { opacity: 0, y: 100 };
  };

  return (
    <motion.div
      layout="position"
      drag={!disableDrag}
      className={classNames(styles.handCard, {
        [styles.newlyDrawn]: isNewlyDrawn
      })}
      style={{ touchAction: 'none', zIndex }}
      onClick={handleOnClick}
      onTapStart={startPressTimer}
      onTap={stopPressTimer}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onDrag={onDrag}
      dragSnapToOrigin={snapback}
      dragMomentum={false}
      initial={getInitialPosition()}
      animate={{ opacity: 1, y: 0 }}
      transition={
        isNewlyDrawn ? { duration: 0.2, ease: 'easeOut' } : { duration: 0.1 }
      }
      whileHover={isDragging ? undefined : { scale: 1.1, y: -50 }}
      whileDrag={{ scale: 1.05, zIndex: 1000 }}
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
          {!!card.restriction && (
            <div className={styles.icon}>
              <GiDialPadlock title="Cannot Play" />
            </div>
          )}
        </div>
      </CardPopUp>
      {card.label && card.label !== '' && (
        <div className={styles.label}>{card.label}</div>
      )}
    </motion.div>
  );
};

export default PlayerHandCard;

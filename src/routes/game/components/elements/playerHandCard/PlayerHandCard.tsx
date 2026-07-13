import React, { useRef, useState, useEffect, useMemo } from 'react';
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
import { motion, PanInfo, useMotionValue, animate as animateValue } from 'framer-motion';
import { createPortal } from 'react-dom';
import { CARD_SQUARES_PATH, getCollectionCardImagePath } from 'utils';
import { useLanguageSelector } from 'hooks/useLanguageSelector';
import { formatRestriction } from 'data/keywords';

const ScreenPercentageForCardPlayed = 0.25;

const supportsHover =
  typeof window !== 'undefined' && window.matchMedia('(hover: hover)').matches;

export interface HandCard {
  isArsenal?: boolean;
  isGraveyard?: boolean;
  isBanished?: boolean;
  card?: Card;
  cardId?: string;
  zIndex?: number;
  addCardToPlayedCards: (cardName: string) => void;
  isNewlyDrawn?: boolean;
  disableDrag?: boolean;
  enableLayoutAnimation?: boolean;
  scrollBlockedRef?: React.RefObject<boolean>;
  onHandReorderDragStart?: () => void;
  onHandReorderDragMove?: (cardId: string, info: PanInfo) => void;
  onHandReorderDragEnd?: (cardId: string, info: PanInfo) => boolean;
  onHandReorderDragCancel?: () => void;
}

export const PlayerHandCard = React.memo(({
  card,
  cardId,
  isArsenal,
  isBanished,
  isGraveyard,
  zIndex,
  addCardToPlayedCards,
  isNewlyDrawn,
  disableDrag,
  enableLayoutAnimation,
  scrollBlockedRef,
  onHandReorderDragStart,
  onHandReorderDragMove,
  onHandReorderDragEnd,
  onHandReorderDragCancel
}: HandCard) => {
  const [canPopUp, setCanPopup] = useState(true);
  const [isDragging, setIsDragging] = useState(false);
  const [snapback, setSnapback] = useState<boolean>(true);
  const { getLanguage } = useLanguageSelector();

  // ref to determine if we have a long press or a short tap.
  const timerRef = useRef<ReturnType<typeof setTimeout>>();
  const isLongPress = useRef<boolean>();
  const hasDispatchedClearRef = useRef<boolean>(false);
  const draggedRef = useRef<boolean>(false);
  const cardElRef = useRef<HTMLDivElement | null>(null);

  // Screen rect captured when dragging starts. While dragging, the card is pinned
  // to this rect via position:fixed so hand-reorder logic can freely shuffle the
  // underlying array (to shift other cards out of the way) without the dragged
  // card's own flex slot jumping and throwing off its position under the pointer.
  const [fixedRect, setFixedRect] = useState<{
    left: number;
    top: number;
    width: number;
    height: number;
  } | null>(null);

  const dragX = useMotionValue(0);
  const dragY = useMotionValue(0);
  const dispatch = useAppDispatch();

  if (card === undefined) {
    return <div className={styles.handCard}></div>;
  }

  const src = getCollectionCardImagePath({
    path: CARD_SQUARES_PATH,
    locale: getLanguage(),
    cardNumber: card.cardNumber
  });

  const handleDragStart = () => {
    const rect = cardElRef.current?.getBoundingClientRect();
    if (rect) {
      setFixedRect({
        left: rect.left,
        top: rect.top,
        width: rect.width,
        height: rect.height
      });
    }
    setIsDragging(true);
    onHandReorderDragStart?.();
  };

  const handleDragEnd = (
    event: MouseEvent | TouchEvent | PointerEvent,
    info: PanInfo
  ) => {
    const absY = Math.abs(info.offset.y);
    const absX = Math.abs(info.offset.x);

    const currentHeight = window.innerHeight;
    const isMobile = currentHeight > 800;
    const dragThreshold = isMobile
      ? currentHeight * ScreenPercentageForCardPlayed * 1.5
      : currentHeight * ScreenPercentageForCardPlayed;

    if (absY > dragThreshold) {
      if (card.action) {
        setSnapback(false);
        playCardFunc();
        addCardToPlayedCards(card.cardNumber);
      }
    } else if (onHandReorderDragEnd && absX > 8 && absX > absY) {
      onHandReorderDragEnd(cardId ?? '', info);
    }

    draggedRef.current = false;
    setIsDragging(false);
    setFixedRect(null);
    setCanPopup(true);
    hasDispatchedClearRef.current = false;
    onHandReorderDragCancel?.();
  };

  const handlePointerCancel = () => {
    animateValue(dragX, 0, { type: 'spring', bounce: 0.25, duration: 0.3 });
    animateValue(dragY, 0, { type: 'spring', bounce: 0.25, duration: 0.3 });
    draggedRef.current = false;
    setIsDragging(false);
    setFixedRect(null);
    setCanPopup(true);
    setSnapback(true);
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
    onHandReorderDragMove?.(cardId ?? '', info);

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

    if (scrollBlockedRef?.current) return;

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

  const imgStyles = useMemo(
    () =>
      classNames(styles.img, {
        [styles.border1]: card.borderColor == '1',
        [styles.border2]: card.borderColor == '2',
        [styles.border3]: card.borderColor == '3',
        [styles.border4]: card.borderColor == '4',
        [styles.border5]: card.borderColor == '5',
        [styles.border6]: card.borderColor == '6',
        [styles.border7]: card.borderColor == '7',
        [styles.border8]: card.borderColor == '8',
        [styles.border9]: card.borderColor == '9'
      }),
    [card.borderColor]
  );

  const iconColumn = (
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
          <GiDialPadlock title={`Cannot play: ${formatRestriction(card.restriction)}`} />
        </div>
      )}
    </div>
  );

  const cardLabel = card.label && card.label !== '' && (
    <div className={styles.label}>{card.label}</div>
  );

  return (
    <>
      <motion.div
        ref={cardElRef}
        data-is-dragging={isDragging}
        layout={enableLayoutAnimation && !isDragging ? 'position' : false}
        drag={!disableDrag}
        className={classNames(styles.handCard, {
          [styles.newlyDrawn]: isNewlyDrawn
        })}
        style={{
          x: dragX,
          y: dragY,
          touchAction: 'none',
          zIndex: isDragging ? 1000 : zIndex,
          // The real card is hidden (not opacity, which would fight the
          // initial/animate opacity transition) once a ghost clone takes over
          // the visuals in a portal outside the clipped hand container. This
          // element keeps tracking the pointer/gesture underneath so drag
          // handling never gets interrupted.
          visibility: isDragging ? 'hidden' : 'visible',
          ...(isDragging && fixedRect
            ? {
                position: 'fixed',
                left: fixedRect.left,
                top: fixedRect.top,
                width: fixedRect.width,
                height: fixedRect.height,
                margin: 0
              }
            : {})
        }}
        onClick={handleOnClick}
        onTapStart={startPressTimer}
        onTap={stopPressTimer}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        onDrag={onDrag}
        onPointerCancel={handlePointerCancel}
        dragSnapToOrigin={snapback}
        dragMomentum={false}
        initial={{ opacity: 0, y: 100 }}
        animate={{ opacity: 1, y: 0 }}
        transition={
          isNewlyDrawn ? { duration: 0.2, ease: 'easeOut' } : { duration: 0.1 }
        }
        whileHover={isDragging || !supportsHover ? undefined : { scale: 1.1, y: -50, zIndex: 1000 }}
        whileDrag={{ scale: 1.05 }}
      >
        <CardPopUp
          containerClass={styles.imgContainer}
          cardNumber={card.cardNumber}
          isHidden={!canPopUp}
          disableTilt={isDragging}
        >
          <CardImage src={src} className={imgStyles} draggable="false" />
          {iconColumn}
        </CardPopUp>
        {cardLabel}
      </motion.div>
      {isDragging &&
        fixedRect &&
        createPortal(
          <motion.div
            className={styles.handCard}
            style={{
              x: dragX,
              y: dragY,
              scale: 1.05,
              position: 'fixed',
              left: fixedRect.left,
              top: fixedRect.top,
              width: fixedRect.width,
              height: fixedRect.height,
              margin: 0,
              zIndex: 2000,
              pointerEvents: 'none'
            }}
          >
            <div className={styles.imgContainer}>
              <CardImage src={src} className={imgStyles} draggable="false" />
              {iconColumn}
            </div>
            {cardLabel}
          </motion.div>,
          document.body
        )}
    </>
  );
});
PlayerHandCard.displayName = 'PlayerHandCard';

export default PlayerHandCard;

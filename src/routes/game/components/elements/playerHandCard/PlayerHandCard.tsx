import React, { useRef, useState, useMemo } from 'react';
import { playCard, removeCardFromHand } from 'features/game/GameSlice';
import { clearCardPreview } from '../cardPortal/cardPreviewStore';
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
import {
  motion,
  PanInfo,
  useMotionValue,
  animate as animateValue
} from 'framer-motion';
import { createPortal } from 'react-dom';
import { CARD_SQUARES_PATH, getCollectionCardImagePath } from 'utils';
import { useLanguageSelector } from 'hooks/useLanguageSelector';
import { formatRestriction } from 'data/keywords';
import { useTranslation } from 'react-i18next';
import {
  buildHandCardSelectionKey,
  clearTapToPreviewSelection,
  getTapToPreviewSelectedCardKey
} from './tapToPreviewPlay';

const ScreenPercentageForCardPlayed = 0.25;

const supportsHover =
  typeof window !== 'undefined' && window.matchMedia('(hover: hover)').matches;

const CARD_INITIAL = { opacity: 0, y: 100 };
const CARD_ANIMATE = { opacity: 1, y: 0 };
const CARD_WHILE_DRAG = { scale: 1.05 };
const CARD_WHILE_HOVER = { scale: 1.1, y: -50, zIndex: 1000 };
const CARD_TRANSITION = {
  layout: { type: 'spring' as const, stiffness: 520, damping: 38, mass: 0.72 },
  opacity: { duration: 0.14, ease: 'easeOut' as const },
  y: { duration: 0.14, ease: 'easeOut' as const }
};

export interface HandCard {
  isArsenal?: boolean;
  isGraveyard?: boolean;
  isBanished?: boolean;
  card?: Card;
  cardId?: string;
  zIndex?: number;
  addCardToPlayedCards: (cardName: string) => void;
  disableDrag?: boolean;
  rotation?: number;
  enableLayoutAnimation?: boolean;
  shuffleRevision?: number;
  scrollBlockedRef?: React.RefObject<boolean>;
  onRotate?: (cardId: string, direction: 1 | -1) => void;
  onRotationHoldStart?: (cardId: string) => void;
  onRotationHoldEnd?: () => void;
  onHandReorderDragStart?: () => void;
  onHandReorderDragMove?: (cardId: string, info: PanInfo) => void;
  onHandReorderDragEnd?: (cardId: string, info: PanInfo) => boolean;
  onHandReorderDragCancel?: () => void;
}

export const PlayerHandCard = React.memo(
  ({
    card,
    cardId,
    isArsenal,
    isBanished,
    isGraveyard,
    zIndex,
    addCardToPlayedCards,
    disableDrag,
    rotation = 0,
    enableLayoutAnimation,
    shuffleRevision = 0,
    scrollBlockedRef,
    onRotate,
    onRotationHoldStart,
    onRotationHoldEnd,
    onHandReorderDragStart,
    onHandReorderDragMove,
    onHandReorderDragEnd,
    onHandReorderDragCancel
  }: HandCard) => {
    const [canPopUp, setCanPopup] = useState(true);
    const [isDragging, setIsDragging] = useState(false);
    const [snapback, setSnapback] = useState<boolean>(true);
    const { getLanguage } = useLanguageSelector();
    const { t } = useTranslation();

    // ref to determine if we have a long press or a short tap.
    const timerRef = useRef<ReturnType<typeof setTimeout>>();
    const isLongPress = useRef<boolean>();
    const hasDispatchedClearRef = useRef<boolean>(false);
    const draggedRef = useRef<boolean>(false);
    const cardElRef = useRef<HTMLDivElement | null>(null);
    const lastPointerTypeRef = useRef<string | null>(null);

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

    const imgStyles = useMemo(
      () =>
        classNames(styles.img, {
          [styles.border1]: card?.borderColor == '1',
          [styles.border2]: card?.borderColor == '2',
          [styles.border3]: card?.borderColor == '3',
          [styles.border4]: card?.borderColor == '4',
          [styles.border5]: card?.borderColor == '5',
          [styles.border6]: card?.borderColor == '6',
          [styles.border7]: card?.borderColor == '7',
          [styles.border8]: card?.borderColor == '8',
          [styles.border9]: card?.borderColor == '9'
        }),
      [card?.borderColor]
    );

    if (card === undefined) {
      return <div className={styles.handCard}></div>;
    }

    const selectionKey = buildHandCardSelectionKey({
      cardId,
      cardNumber: card.cardNumber,
      cardIndex: card.cardIndex,
      zone: isArsenal
        ? 'arsenal'
        : isBanished
        ? 'banished'
        : isGraveyard
        ? 'graveyard'
        : 'hand'
    });

    const src = getCollectionCardImagePath({
      path: CARD_SQUARES_PATH,
      locale: getLanguage(),
      cardNumber: card.cardNumber
    });

    const playCardFunc = () => {
      clearTapToPreviewSelection();
      dispatch(playCard({ cardParams: card }));
      clearCardPreview();
      if (!isBanished && !isGraveyard && !isArsenal) {
        dispatch(removeCardFromHand({ card }));
      }
    };

    const handlePlayFromTap = () => {
      if (draggedRef.current) {
        draggedRef.current = false;
        return;
      }
      if (scrollBlockedRef?.current) return;
      if (isLongPress.current) return;
      if (!card.action) return;
      playCardFunc();
      addCardToPlayedCards(card.cardNumber);
    };

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
      onRotationHoldEnd?.();
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
      onRotationHoldEnd?.();
      onHandReorderDragCancel?.();
    };

    const handlePointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
      lastPointerTypeRef.current = event.pointerType;
      if (event.pointerType === 'mouse' && event.button === 0) {
        onRotationHoldStart?.(cardId ?? '');
      }
    };

    const handlePointerUp = () => {
      onRotationHoldEnd?.();
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
          // Keep sticky preview while this hand card is selected.
          if (getTapToPreviewSelectedCardKey() !== selectionKey) {
            clearCardPreview();
          }
          hasDispatchedClearRef.current = true;
          setCanPopup(false);
        }
      }
    };

    const handleContextMenu = (event: React.MouseEvent<HTMLDivElement>) => {
      event.preventDefault();
      event.stopPropagation();

      const nativePointerType = (event.nativeEvent as PointerEvent).pointerType;
      const pointerType = nativePointerType || lastPointerTypeRef.current;
      if (pointerType !== 'mouse') return;

      onRotate?.(cardId ?? '', event.shiftKey ? -1 : 1);
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

    const iconColumn = (
      <div className={styles.iconCol}>
        {isArsenal === true && (
          <div className={styles.icon}>
            <GiCannon title={t('ZONES.ARSENAL')} />
          </div>
        )}
        {isBanished === true && (
          <div className={styles.icon}>
            <GiFluffySwirl title={t('ZONES.BANISH')} />
          </div>
        )}
        {isGraveyard === true && (
          <div className={styles.icon}>
            <GiTombstone title={t('ZONES.GRAVEYARD')} />
          </div>
        )}
        {!!card.restriction && (
          <div className={styles.icon}>
            <GiDialPadlock
              title={t('PLAYER_HAND_CARD.CANNOT_PLAY', {
                reason: formatRestriction(card.restriction)
              })}
            />
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
            [styles.shuffleAccentA]:
              shuffleRevision > 0 && shuffleRevision % 2 === 0,
            [styles.shuffleAccentB]: shuffleRevision % 2 === 1
          })}
          style={{
            x: dragX,
            y: dragY,
            rotate: rotation,
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
          onContextMenu={handleContextMenu}
          onTapStart={startPressTimer}
          onTap={stopPressTimer}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
          onDrag={onDrag}
          onPointerCancel={handlePointerCancel}
          onPointerDown={handlePointerDown}
          onPointerUp={handlePointerUp}
          dragSnapToOrigin={snapback}
          dragMomentum={false}
          initial={CARD_INITIAL}
          animate={CARD_ANIMATE}
          transition={CARD_TRANSITION}
          whileHover={
            isDragging || !supportsHover ? undefined : CARD_WHILE_HOVER
          }
          whileDrag={CARD_WHILE_DRAG}
        >
          <CardPopUp
            containerClass={styles.imgContainer}
            cardNumber={card.cardNumber}
            isHidden={!canPopUp}
            disableTilt={isDragging}
            tapPreviewKey={selectionKey}
            onClick={handlePlayFromTap}
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
                rotate: rotation,
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
  }
);
PlayerHandCard.displayName = 'PlayerHandCard';

export default PlayerHandCard;

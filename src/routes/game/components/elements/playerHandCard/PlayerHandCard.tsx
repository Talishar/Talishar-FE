import React, {
  useRef,
  useState,
  useMemo,
  useEffect,
  useCallback
} from 'react';
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
import { useAppDispatch, useAppSelector } from 'app/Hooks';
import { LONG_PRESS_TIMER } from 'appConstants';
import classNames from 'classnames';
import CardImage from '../cardImage/CardImage';
import CardPopUp from '../cardPopUp/CardPopUp';
import {
  motion,
  MotionConfig,
  PanInfo,
  useMotionValue,
  useReducedMotion,
  useSpring,
  animate as animateValue
} from 'framer-motion';
import { createPortal } from 'react-dom';
import {
  CARD_IMAGES_PATH,
  CARD_SQUARES_PATH,
  getCollectionCardImagePath
} from 'utils';
import CardKeywordStrip from '../cardPortal/CardKeywordStrip';
import { useLanguageSelector } from 'hooks/useLanguageSelector';
import { formatRestriction } from 'data/keywords';
import { useTranslation } from 'react-i18next';
import {
  buildHandCardSelectionKey,
  clearTapToPreviewSelection,
  getTapToPreviewSelectedCardKey
} from './tapToPreviewPlay';
import {
  FAN_DROP_DURATION_S,
  FAN_HOVER_HIT_RATIO,
  FAN_HOVER_SCALE,
  FanSlot,
  fanDropEase
} from '../../zones/playerHand/fanLayout';
import {
  classifyDragRelease,
  isAbovePlayLine
} from '../../zones/playerHand/playLine';

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
const FAN_SPRING = {
  type: 'spring' as const,
  stiffness: 260,
  damping: 34,
  mass: 1
};
const FAN_HOVER_SPRING = {
  type: 'spring' as const,
  stiffness: 1600,
  damping: 80,
  mass: 1
};
const FAN_DROP_TRANSITION = {
  type: 'tween' as const,
  duration: FAN_DROP_DURATION_S,
  ease: fanDropEase
};
const FAN_LIFTED_TRANSITION = FAN_HOVER_SPRING;
const GHOST_FOLLOW_SPRING = { stiffness: 700, damping: 45 };
const GHOST_GRAB_RATIO = 0.31;
const GHOST_ROTATE_SPRING = {
  type: 'spring' as const,
  stiffness: 400,
  damping: 40
};

export type DragPlayState = 'idle' | 'below' | 'above';

export interface HandCard {
  isArsenal?: boolean;
  isGraveyard?: boolean;
  isBanished?: boolean;
  card?: Card;
  cardId?: string;
  zIndex?: number;
  addCardToPlayedCards?: (cardName: string) => void;
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
  isFanned?: boolean;
  fanSlot?: FanSlot;
  isHovered?: boolean;
  fanHoverScale?: number;
  fanCardHeight?: number;
  isFanLifted?: boolean;
  onHoverChange?: (cardId: string, hovering: boolean) => void;
  dimWhenUnplayable?: boolean;
  onDragPlayStateChange?: (s: DragPlayState) => void;
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
    onHandReorderDragCancel,
    isFanned = false,
    fanSlot,
    isHovered = false,
    fanHoverScale = FAN_HOVER_SCALE,
    fanCardHeight,
    isFanLifted = false,
    onHoverChange,
    dimWhenUnplayable,
    onDragPlayStateChange
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
    const slotRef = useRef<HTMLDivElement | null>(null);
    const [isReturning, setIsReturning] = useState(false);
    const lastPointerTypeRef = useRef<string | null>(null);
    const cancelledRef = useRef(false);
    const dragPlayStateRef = useRef<DragPlayState>('idle');
    const [isAboveLine, setIsAboveLine] = useState(false);
    const prevActionRef = useRef(card?.action);
    const [playableFlash, setPlayableFlash] = useState(0);

    // Screen rect captured when dragging starts. While dragging, the card is pinned
    // to this rect via position:fixed so hand-reorder logic can freely shuffle the
    // underlying array (to shift other cards out of the way) without the dragged
    // card's own flex slot jumping and throwing off its position under the pointer.
    const [fixedRect, setFixedRect] = useState<{
      left: number;
      top: number;
      width: number;
      height: number;
      originX?: number;
      originY?: number;
    } | null>(null);

    const dragX = useMotionValue(0);
    const dragY = useMotionValue(0);
    const ghostRotate = useMotionValue(0);
    const returnX = useMotionValue(0);
    const returnY = useMotionValue(0);
    const returnScale = useMotionValue(1.05);
    const springX = useSpring(dragX, GHOST_FOLLOW_SPRING);
    const springY = useSpring(dragY, GHOST_FOLLOW_SPRING);
    const reduceMotion = useReducedMotion();
    const dispatch = useAppDispatch();
    const isPlayerInputInProgress = useAppSelector(
      (state) => state.game.isPlayerInputInProgress
    );

    useEffect(() => {
      const wasPlayable = !!prevActionRef.current;
      prevActionRef.current = card?.action;
      if (!wasPlayable && card?.action) {
        setPlayableFlash((count) => count + 1);
      }
    }, [card?.action]);

    useEffect(() => {
      if (!isDragging || !isFanned) return;
      const controls = animateValue(ghostRotate, rotation, GHOST_ROTATE_SPRING);
      return () => controls.stop();
    }, [isDragging, isFanned, rotation, ghostRotate]);

    useEffect(() => {
      if (!isFanned || !isHovered || isDragging) return;
      const unhover = () => onHoverChange?.(cardId ?? '', false);
      const unhoverIfOutside = (event: PointerEvent) => {
        if (event.pointerType === 'touch') return;
        const element = cardElRef.current;
        if (
          element &&
          event.target instanceof Node &&
          element.contains(event.target)
        ) {
          return;
        }
        unhover();
      };
      const root = document.documentElement;
      window.addEventListener('pointermove', unhoverIfOutside);
      root.addEventListener('pointerleave', unhover);
      return () => {
        window.removeEventListener('pointermove', unhoverIfOutside);
        root.removeEventListener('pointerleave', unhover);
      };
    }, [isFanned, isHovered, isDragging, cardId, onHoverChange]);

    const slotX = fanSlot?.x ?? 0;
    const slotY = fanSlot?.y ?? 0;
    const slotRotate = fanSlot?.rotate ?? 0;
    const slotScale = fanSlot?.scale ?? 1;

    useEffect(() => {
      if (!isReturning) return;
      const wrapper = slotRef.current;
      const stage = wrapper?.parentElement;
      if (!fixedRect || !wrapper || !stage) {
        setIsReturning(false);
        setFixedRect(null);
        return;
      }
      const stageRect = stage.getBoundingClientRect();
      const targetX = stageRect.left + stageRect.width / 2 + slotX;
      const targetY =
        stageRect.bottom - (fanCardHeight ?? wrapper.offsetHeight) / 2 + slotY;
      const ghostCenterX = fixedRect.left + fixedRect.width / 2;
      const ghostCenterY = fixedRect.top + fixedRect.height / 2;
      const transition = reduceMotion ? { duration: 0 } : FAN_SPRING;
      let cancelled = false;
      const controls = [
        animateValue(returnX, targetX - ghostCenterX, transition),
        animateValue(returnY, targetY - ghostCenterY, transition),
        animateValue(ghostRotate, slotRotate + rotation, transition),
        animateValue(returnScale, slotScale, transition)
      ];
      Promise.all(controls).then(() => {
        if (cancelled) return;
        setIsReturning(false);
        setFixedRect(null);
      });
      return () => {
        cancelled = true;
        controls.forEach((control) => control.stop());
      };
    }, [
      isReturning,
      fixedRect,
      slotX,
      slotY,
      slotRotate,
      slotScale,
      rotation,
      returnX,
      returnY,
      returnScale,
      ghostRotate,
      reduceMotion,
      fanCardHeight
    ]);

    const setDragPlayState = useCallback(
      (next: DragPlayState) => {
        if (dragPlayStateRef.current === next) return;
        dragPlayStateRef.current = next;
        setIsAboveLine(next === 'above');
        onDragPlayStateChange?.(next);
      },
      [onDragPlayStateChange]
    );

    const onDragPlayStateChangeRef = useRef(onDragPlayStateChange);
    onDragPlayStateChangeRef.current = onDragPlayStateChange;

    useEffect(
      () => () => {
        if (dragPlayStateRef.current !== 'idle') {
          onDragPlayStateChangeRef.current?.('idle');
        }
      },
      []
    );

    const cancelDrag = useCallback(() => {
      cancelledRef.current = true;
      const event =
        typeof PointerEvent === 'function'
          ? new PointerEvent('pointercancel', {
              pointerType: lastPointerTypeRef.current ?? 'mouse',
              isPrimary: true,
              button: 0
            })
          : new Event('pointercancel');
      window.dispatchEvent(event);
    }, []);

    useEffect(() => {
      if (!isDragging) return;
      const handleKeyDown = (event: KeyboardEvent) => {
        if (event.key !== 'Escape') return;
        event.preventDefault();
        cancelDrag();
      };
      const handleWindowContextMenu = (event: MouseEvent) => {
        event.preventDefault();
        event.stopPropagation();
        cancelDrag();
      };
      window.addEventListener('keydown', handleKeyDown);
      window.addEventListener('contextmenu', handleWindowContextMenu, true);
      return () => {
        window.removeEventListener('keydown', handleKeyDown);
        window.removeEventListener(
          'contextmenu',
          handleWindowContextMenu,
          true
        );
      };
    }, [isDragging, cancelDrag]);

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
          [styles.border9]: card?.borderColor == '9',
          [styles.border10]: card?.borderColor == '10',
          [styles.unplayable]: dimWhenUnplayable && !card?.action,
          [styles.playableFlashA]: playableFlash > 0 && playableFlash % 2 === 1,
          [styles.playableFlashB]: playableFlash > 0 && playableFlash % 2 === 0
        }),
      [card?.borderColor, card?.action, dimWhenUnplayable, playableFlash]
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
      path: isFanned ? CARD_IMAGES_PATH : CARD_SQUARES_PATH,
      locale: getLanguage(),
      cardNumber: card.cardNumber
    });

    const playCardFunc = () => {
      if (isPlayerInputInProgress) return;
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
      addCardToPlayedCards?.(card.cardNumber);
    };

    const handleDragStart = (
      event: MouseEvent | TouchEvent | PointerEvent,
      info: PanInfo
    ) => {
      const element = cardElRef.current;
      if (isFanned) {
        setIsReturning(false);
        springX.jump(dragX.get());
        springY.jump(dragY.get());
      }
      if (isFanned && element) {
        const img = element.querySelector('img');
        const rect = (img ?? element).getBoundingClientRect();
        const height = fanCardHeight ?? element.offsetHeight;
        const width = fanCardHeight
          ? (fanCardHeight * 2) / 3
          : element.offsetWidth;
        const grabOffset =
          GHOST_GRAB_RATIO *
          (fanCardHeight ?? img?.offsetHeight ?? element.offsetHeight);
        const left = rect.left + rect.width / 2 - width / 2;
        setFixedRect({
          left,
          top: info.point.y - grabOffset,
          width,
          height,
          originX: Math.min(1, Math.max(0, (info.point.x - left) / width)),
          originY: grabOffset / height
        });
        ghostRotate.jump((fanSlot?.rotate ?? 0) + rotation);
        returnScale.jump(fanSlot?.scale ?? 1);
        animateValue(returnScale, 1.05, FAN_SPRING);
      } else {
        const rect = element?.getBoundingClientRect();
        if (rect) {
          setFixedRect({
            left: rect.left,
            top: rect.top,
            width: rect.width,
            height: rect.height
          });
        }
      }
      cancelledRef.current = false;
      setIsDragging(true);
      setDragPlayState('below');
      onHandReorderDragStart?.();
    };

    const handleDragEnd = (
      event: MouseEvent | TouchEvent | PointerEvent,
      info: PanInfo
    ) => {
      const ghostFromX = (reduceMotion ? dragX : springX).get();
      const ghostFromY = (reduceMotion ? dragY : springY).get();
      let played = false;
      if (cancelledRef.current) {
        cancelledRef.current = false;
        resetDragOffset();
        setSnapback(true);
      } else {
        const release = classifyDragRelease({
          pointerY: info.point.y,
          offsetX: info.offset.x,
          offsetY: info.offset.y,
          viewportHeight: window.innerHeight
        });

        if (release === 'play' && card.action && !isPlayerInputInProgress) {
          setSnapback(false);
          playCardFunc();
          addCardToPlayedCards?.(card.cardNumber);
          played = true;
        } else if (release === 'reorder' && onHandReorderDragEnd) {
          onHandReorderDragEnd(cardId ?? '', info);
        }
      }
      const startsReturn = isFanned && !played && fixedRect !== null;
      if (isFanned && !played) {
        dragX.jump(0);
        dragY.jump(0);
      }
      if (startsReturn) {
        returnX.set(ghostFromX);
        returnY.set(ghostFromY);
        setIsReturning(true);
      }

      draggedRef.current = false;
      setIsDragging(false);
      if (!startsReturn) setFixedRect(null);
      setCanPopup(true);
      hasDispatchedClearRef.current = false;
      setDragPlayState('idle');
      onRotationHoldEnd?.();
      onHandReorderDragCancel?.();
    };

    const resetDragOffset = () => {
      if (isFanned) {
        dragX.jump(0);
        dragY.jump(0);
        return;
      }
      animateValue(dragX, 0, { type: 'spring', bounce: 0.25, duration: 0.3 });
      animateValue(dragY, 0, { type: 'spring', bounce: 0.25, duration: 0.3 });
    };

    const handlePointerCancel = () => {
      resetDragOffset();
      draggedRef.current = false;
      setIsDragging(false);
      setFixedRect(null);
      setCanPopup(true);
      setSnapback(true);
      hasDispatchedClearRef.current = false;
      setDragPlayState('idle');
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
      setDragPlayState(
        isAbovePlayLine(info.offset.y, window.innerHeight) ? 'above' : 'below'
      );

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

      if (isDragging) {
        cancelDrag();
        return;
      }

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

    const isAboveFanHoverLine = (clientY: number) => {
      const stage = slotRef.current?.parentElement;
      const element = cardElRef.current;
      if (!stage || !element) return false;
      const liftedHitHeight =
        (fanCardHeight ?? element.offsetHeight) *
        fanHoverScale *
        FAN_HOVER_HIT_RATIO;
      return clientY < stage.getBoundingClientRect().bottom - liftedHitHeight;
    };

    const updateFanHover = (event: React.PointerEvent<HTMLDivElement>) => {
      if (!isFanned || isDragging || event.pointerType === 'touch') return;
      const hovering = !isAboveFanHoverLine(event.clientY);
      if (hovering !== isHovered) onHoverChange?.(cardId ?? '', hovering);
    };

    const handleFanPointerOut = (event: React.PointerEvent<HTMLDivElement>) => {
      if (!isFanned || event.pointerType === 'touch') return;
      if (
        event.relatedTarget instanceof Node &&
        event.currentTarget.contains(event.relatedTarget)
      ) {
        return;
      }
      if (isHovered) onHoverChange?.(cardId ?? '', false);
    };

    const ghostX = reduceMotion ? dragX : springX;
    const ghostY = reduceMotion ? dragY : springY;

    const content = (
      <>
        <motion.div
          ref={cardElRef}
          data-is-dragging={isDragging}
          data-hand-uid={card.uniqueId !== '-' ? card.uniqueId : undefined}
          data-hand-card-number={card.cardNumber}
          layout={
            !isFanned && enableLayoutAnimation && !isDragging
              ? 'position'
              : false
          }
          drag={!disableDrag}
          className={classNames(
            isFanned ? styles.handCardFan : styles.handCard,
            {
              [styles.shuffleAccentA]:
                shuffleRevision > 0 && shuffleRevision % 2 === 0,
              [styles.shuffleAccentB]: shuffleRevision % 2 === 1,
              [styles.contentHidden]: isReturning && !isDragging
            }
          )}
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
            ...(isDragging && fixedRect && !isFanned
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
          onPointerOver={updateFanHover}
          onPointerMove={updateFanHover}
          onPointerOut={handleFanPointerOut}
          dragSnapToOrigin={snapback}
          dragMomentum={false}
          initial={CARD_INITIAL}
          animate={CARD_ANIMATE}
          transition={CARD_TRANSITION}
          whileHover={
            isFanned || isDragging || !supportsHover
              ? undefined
              : CARD_WHILE_HOVER
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
            hoverPreviewDelayMs={150}
            disableHoverPreview={isFanned}
          >
            <CardImage src={src} className={imgStyles} draggable="false" />
            {iconColumn}
          </CardPopUp>
          {cardLabel}
        </motion.div>
        {(isDragging || isReturning) &&
          fixedRect &&
          createPortal(
            <motion.div
              className={classNames(
                isFanned ? styles.handCardFan : styles.handCard,
                { [styles.ghostReady]: isAboveLine }
              )}
              style={{
                x: isReturning ? returnX : ghostX,
                y: isReturning ? returnY : ghostY,
                scale: isFanned ? returnScale : 1.05,
                rotate: isFanned ? ghostRotate : rotation,
                originX: isReturning ? 0.5 : fixedRect.originX ?? 0.5,
                originY: isReturning ? 0.5 : fixedRect.originY ?? 0.5,
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

    if (!isFanned) return content;

    const slotWidth = fanCardHeight ? ((fanCardHeight * 2) / 3) * slotScale : 0;
    const fanTarget = fanCardHeight
      ? {
          x: slotX,
          y: slotY + ((slotScale - 1) * fanCardHeight) / 2,
          rotate: slotRotate,
          width: slotWidth,
          height: fanCardHeight * slotScale,
          marginLeft: -slotWidth / 2
        }
      : { x: slotX, y: slotY, rotate: slotRotate, scale: slotScale };

    return (
      <MotionConfig reducedMotion="never">
        <motion.div
          ref={slotRef}
          className={styles.fanSlot}
          initial={false}
          animate={fanTarget}
          style={{ zIndex: fanSlot?.zIndex ?? zIndex }}
          transition={isFanLifted ? FAN_LIFTED_TRANSITION : FAN_DROP_TRANSITION}
        >
          <MotionConfig reducedMotion="user">{content}</MotionConfig>
          {isHovered && !isDragging && (
            <div
              className={classNames(styles.fanKeywords, {
                [styles.fanKeywordsLeft]: slotX > 0
              })}
              style={
                fanCardHeight
                  ? undefined
                  : { transform: `scale(${1 / fanHoverScale})` }
              }
            >
              <CardKeywordStrip cardNumber={card.cardNumber} />
            </div>
          )}
        </motion.div>
      </MotionConfig>
    );
  }
);
PlayerHandCard.displayName = 'PlayerHandCard';

export default PlayerHandCard;

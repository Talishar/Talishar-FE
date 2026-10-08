import React, {
  useRef,
  useState,
  useMemo,
  useEffect,
  useCallback
} from 'react';
import {
  canQueueHandPlay,
  isHandPlayBusy,
  playCard,
  queueHandPlay,
  removeHandCard
} from 'features/game/GameSlice';
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
  useTransform,
  useVelocity,
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
  FAN_HOVER_SCALE,
  FAN_LANDING_Z_INDEX,
  FanSlot,
  fanDropEase
} from '../../zones/playerHand/fanLayout';
import {
  classifyDragRelease,
  isAbovePlayLine,
  isClickMove
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
const FAN_HOVER_SPRING = {
  type: 'spring' as const,
  stiffness: 2500,
  damping: 100,
  mass: 1
};
const FAN_DROP_TRANSITION = {
  type: 'tween' as const,
  duration: FAN_DROP_DURATION_S,
  ease: fanDropEase
};
const FAN_RETURN_TRANSITION = {
  type: 'tween' as const,
  duration: 0.2,
  ease: 'easeOut' as const
};
const GHOST_FOLLOW_SPRING = { stiffness: 220, damping: 26 };
const GHOST_ROTATE_SPRING = {
  type: 'spring' as const,
  stiffness: 400,
  damping: 40
};
const GHOST_TILT_MAX_DEG = 4;
const GHOST_TILT_DEG_PER_PX_S = 0.004;
const GHOST_TILT_SPRING = { stiffness: 300, damping: 30 };
const GHOST_PERSPECTIVE_RATIO = 1;
const clampTilt = (deg: number) =>
  Math.max(-GHOST_TILT_MAX_DEG, Math.min(GHOST_TILT_MAX_DEG, deg));
const tiltFromVelocityX = (velocity: number) =>
  clampTilt(velocity * GHOST_TILT_DEG_PER_PX_S);
const tiltFromVelocityY = (velocity: number) =>
  clampTilt(-velocity * GHOST_TILT_DEG_PER_PX_S);

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
  isLanding?: boolean;
  showHoverKeywords?: boolean;
  fanHoverScale?: number;
  fanCardHeight?: number;
  isFanLifted?: boolean;
  onHoverChange?: (cardId: string, hovering: boolean) => void;
  onFanPointerEnter?: (clientX: number, clientY: number) => void;
  onClickPlay?: (cardId: string) => void;
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
    isLanding = false,
    showHoverKeywords = false,
    fanHoverScale = FAN_HOVER_SCALE,
    fanCardHeight,
    isFanLifted = false,
    onHoverChange,
    onFanPointerEnter,
    onClickPlay,
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
    const dragArmedRef = useRef(false);
    const cardElRef = useRef<HTMLDivElement | null>(null);
    const slotRef = useRef<HTMLDivElement | null>(null);
    const [isReturning, setIsReturning] = useState(false);
    const lastPointerTypeRef = useRef<string | null>(null);
    const cancelledRef = useRef(false);
    const dragPlayStateRef = useRef<DragPlayState>('idle');
    const [isAboveLine, setIsAboveLine] = useState(false);

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
    const ghostRotate = useMotionValue(0);
    const returnX = useMotionValue(0);
    const returnY = useMotionValue(0);
    const followX = useMotionValue(0);
    const followY = useMotionValue(0);
    const returnScale = useMotionValue(1.05);
    const springX = useSpring(dragX, GHOST_FOLLOW_SPRING);
    const springY = useSpring(dragY, GHOST_FOLLOW_SPRING);
    const ghostTiltY = useSpring(
      useTransform(useVelocity(followX), tiltFromVelocityX),
      GHOST_TILT_SPRING
    );
    const ghostTiltX = useSpring(
      useTransform(useVelocity(followY), tiltFromVelocityY),
      GHOST_TILT_SPRING
    );
    const reduceMotion = useReducedMotion();
    const reduceDragMotion = reduceMotion && !isFanned;
    const ghostX = isFanned ? followX : reduceDragMotion ? dragX : springX;
    const ghostY = isFanned ? followY : reduceDragMotion ? dragY : springY;
    const dispatch = useAppDispatch();
    const isPlayBusy = useAppSelector((state) => isHandPlayBusy(state.game));
    const canQueuePlay = useAppSelector(
      (state) => !!card && canQueueHandPlay(state.game, card)
    );

    useEffect(() => {
      if (!isDragging || !isFanned) return;
      const controls = animateValue(ghostRotate, rotation, GHOST_ROTATE_SPRING);
      return () => controls.stop();
    }, [isDragging, isFanned, rotation, ghostRotate]);

    useEffect(() => {
      if (!isFanned || !isHovered || isDragging) return;
      const unhoverOnOutsideTouch = (event: PointerEvent) => {
        if (event.pointerType !== 'touch') return;
        const element = cardElRef.current;
        if (
          element &&
          event.target instanceof Node &&
          element.contains(event.target)
        ) {
          return;
        }
        onHoverChange?.(cardId ?? '', false);
      };
      window.addEventListener('pointerdown', unhoverOnOutsideTouch, true);
      return () =>
        window.removeEventListener('pointerdown', unhoverOnOutsideTouch, true);
    }, [isFanned, isHovered, isDragging, cardId, onHoverChange]);

    const liftFromTouch = useCallback(() => {
      clearCardPreview();
      onHoverChange?.(cardId ?? '', true);
    }, [cardId, onHoverChange]);

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
      const transition = reduceDragMotion
        ? { duration: 0 }
        : FAN_RETURN_TRANSITION;
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
      reduceDragMotion,
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
          [styles.unplayable]: dimWhenUnplayable && !card?.action
        }),
      [card?.borderColor, card?.action, dimWhenUnplayable]
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

    const isHandZoneCard = !isBanished && !isGraveyard && !isArsenal;

    const playCardFunc = (): boolean => {
      if (!isPlayBusy) {
        clearTapToPreviewSelection();
        dispatch(playCard({ cardParams: card }));
        clearCardPreview();
        if (isHandZoneCard) {
          dispatch(removeHandCard({ card }));
        }
        return true;
      }
      if (isHandZoneCard && canQueuePlay) {
        clearTapToPreviewSelection();
        dispatch(queueHandPlay({ card }));
        clearCardPreview();
        return true;
      }
      return false;
    };

    const handlePlayFromTap = () => {
      if (draggedRef.current) {
        draggedRef.current = false;
        return;
      }
      if (
        isFanned &&
        isFanLifted &&
        !isHovered &&
        lastPointerTypeRef.current === 'mouse'
      ) {
        return;
      }
      if (scrollBlockedRef?.current) return;
      if (isLongPress.current) return;
      if (!card.action) return;
      if (!playCardFunc()) return;
      if (isFanned && isHovered && isHandZoneCard) {
        onClickPlay?.(cardId ?? '');
      }
      addCardToPlayedCards?.(card.cardNumber);
    };

    const beginDrag = (info: PanInfo, shift = { x: 0, y: 0 }) => {
      const element = cardElRef.current;
      if (isFanned) {
        setIsReturning(false);
        followX.jump(dragX.get());
        followY.jump(dragY.get());
      }
      if (isFanned && element) {
        const height = fanCardHeight ?? element.offsetHeight;
        const width = fanCardHeight
          ? (fanCardHeight * 2) / 3
          : element.offsetWidth;
        setFixedRect({
          left: info.point.x - shift.x - width / 2,
          top: info.point.y - shift.y - height / 2,
          width,
          height
        });
        ghostRotate.jump((fanSlot?.rotate ?? 0) + rotation);
        returnScale.jump(fanSlot?.scale ?? 1);
        if (reduceDragMotion) returnScale.jump(fanHoverScale);
        else animateValue(returnScale, fanHoverScale, FAN_HOVER_SPRING);
      } else {
        const rect = element?.getBoundingClientRect();
        if (rect) {
          setFixedRect({
            left: rect.left - shift.x,
            top: rect.top - shift.y,
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

    const handleDragStart = (
      event: MouseEvent | TouchEvent | PointerEvent,
      info: PanInfo
    ) => {
      if (lastPointerTypeRef.current === 'mouse' || dragArmedRef.current) {
        return;
      }
      dragArmedRef.current = true;
      beginDrag(info, { x: info.offset.x, y: info.offset.y });
    };

    const handleDragEnd = (
      event: MouseEvent | TouchEvent | PointerEvent,
      info: PanInfo
    ) => {
      if (!dragArmedRef.current) {
        dragX.jump(0);
        dragY.jump(0);
        return;
      }
      dragArmedRef.current = false;
      const ghostFromX = ghostX.get();
      const ghostFromY = ghostY.get();
      let played = false;
      if (cancelledRef.current) {
        cancelledRef.current = false;
        resetDragOffset();
        setSnapback(true);
      } else {
        const release = classifyDragRelease({
          offsetY: info.offset.y,
          viewportHeight: window.innerHeight
        });
        if (release === 'play' && card.action && playCardFunc()) {
          setSnapback(false);
          addCardToPlayedCards?.(card.cardNumber);
          played = true;
        } else {
          onHandReorderDragEnd?.(cardId ?? '', info);
        }
      }
      const startsReturn = isFanned && !played && fixedRect !== null;
      if (isFanned && !played) {
        dragX.jump(0);
        dragY.jump(0);
      }
      if (startsReturn) {
        returnX.jump(ghostFromX);
        returnY.jump(ghostFromY);
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
      dragArmedRef.current = false;
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
      dragArmedRef.current = false;
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
      if (!dragArmedRef.current && lastPointerTypeRef.current === 'mouse') {
        const cardHeight =
          fanCardHeight ?? cardElRef.current?.offsetHeight ?? 0;
        if (isClickMove(info.offset.x, info.offset.y, cardHeight)) {
          dragX.jump(0);
          dragY.jump(0);
          return;
        }
        dragArmedRef.current = true;
        beginDrag(info, { x: dragX.get(), y: dragY.get() });
      }
      if (isFanned) {
        followX.set(dragX.get());
        followY.set(dragY.get());
      }
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

    const handleFanPointerHover = (
      event: React.PointerEvent<HTMLDivElement>
    ) => {
      if (
        !isFanned ||
        isDragging ||
        isFanLifted ||
        event.pointerType === 'touch'
      ) {
        return;
      }
      onFanPointerEnter?.(event.clientX, event.clientY);
    };

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
            pointerEvents: isLanding && !isDragging ? 'none' : undefined,
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
          onPointerOver={handleFanPointerHover}
          onPointerMove={handleFanPointerHover}
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
          whileDrag={isDragging ? CARD_WHILE_DRAG : undefined}
        >
          <CardPopUp
            containerClass={styles.imgContainer}
            cardNumber={card.cardNumber}
            isHidden={!canPopUp}
            disableTilt={isDragging || isFanned}
            tapPreviewKey={selectionKey}
            onClick={handlePlayFromTap}
            hoverPreviewDelayMs={150}
            disableHoverPreview={isFanned}
            onTouchPreview={isFanned ? liftFromTouch : undefined}
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
              style={{
                x: isReturning ? returnX : ghostX,
                y: isReturning ? returnY : ghostY,
                scale: isFanned ? returnScale : 1.05,
                rotateX: isFanned && !reduceDragMotion ? ghostTiltX : 0,
                rotateY: isFanned && !reduceDragMotion ? ghostTiltY : 0,
                transformPerspective: isFanned
                  ? fixedRect.height * GHOST_PERSPECTIVE_RATIO
                  : undefined,
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
              <motion.div
                className={classNames(
                  isFanned ? styles.handCardFan : styles.handCard,
                  { [styles.ghostReady]: isAboveLine }
                )}
                style={{
                  rotate: isFanned ? ghostRotate : rotation,
                  width: '100%',
                  height: '100%',
                  pointerEvents: 'none'
                }}
              >
                <div className={styles.imgContainer}>
                  <CardImage
                    src={src}
                    className={imgStyles}
                    draggable="false"
                  />
                  {iconColumn}
                </div>
                {cardLabel}
              </motion.div>
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
          style={{
            zIndex: isLanding ? FAN_LANDING_Z_INDEX : fanSlot?.zIndex ?? zIndex
          }}
          transition={
            isHovered || (isLanding && isFanLifted)
              ? FAN_HOVER_SPRING
              : FAN_DROP_TRANSITION
          }
        >
          <MotionConfig reducedMotion="user">{content}</MotionConfig>
          {isHovered && showHoverKeywords && !isDragging && (
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

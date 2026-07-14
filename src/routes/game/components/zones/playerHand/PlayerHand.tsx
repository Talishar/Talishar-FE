import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState
} from 'react';
import classNames from 'classnames';
import { createSelector } from '@reduxjs/toolkit';
import { RootState } from 'app/Store';
import { Card } from 'features/Card';
import styles from './PlayerHand.module.css';
import PlayerHandCard from '../../elements/playerHandCard/PlayerHandCard';
import { useAppSelector } from 'app/Hooks';
import useWindowDimensions from 'hooks/useWindowDimensions';
import { AnimatePresence, PanInfo } from 'framer-motion';
import { createPortal } from 'react-dom';
import { useNewlyDrawnCards } from 'hooks/useNewlyDrawnCards';
import useSound from 'use-sound';
import drawingCardsSound from 'sounds/drawing_cards.wav';
import { setHandCardRotationHeld } from 'utils/handCardRotation';

const DEFAULT_HAND_REORDER_STEP_PX = 120;
const CARD_ROTATION_STEP_DEGREES = 90;
const CARD_ROTATION_KEY_STEP_DEGREES = 3;
const WHEEL_ROTATION_DEGREES_PER_PIXEL = 0.15;
const MAX_WHEEL_ROTATION_DEGREES = 15;
const NUMERIC_RE = /^\d+$/;

type CardWithStableId = {
  card: Card;
  id: string;
};

const selectPlayableBanishedCards = createSelector(
  [(state: RootState) => state.game.playerOne.Banish],
  (cards) =>
    cards?.filter((card: Card) => card.action != null && card.action != 0)
);

const selectPlayableTheirBanishedCards = createSelector(
  [(state: RootState) => state.game.playerTwo.Banish],
  (cards) =>
    cards?.filter((card: Card) => card.action != null && card.action != 0)
);

const selectPlayableGraveyardCards = createSelector(
  [(state: RootState) => state.game.playerOne.Graveyard],
  (cards) =>
    cards?.filter((card: Card) => card.action != null && card.action != 0)
);

export default function PlayerHand() {
  const [width, height] = useWindowDimensions();

  const playerID = useAppSelector(
    (state: RootState) => state.game.gameInfo.playerID
  );
  const isReplay = useAppSelector(
    (state: RootState) => state.game.gameInfo.isReplay
  );

  const [playedCards, setPlayedCards] = useState<string[]>([]);

  let hasArsenal = true;

  const showArsenal = false;

  const isMuted = useAppSelector(
    (state: RootState) => state.settings.entities['MuteSound']?.value === '1'
  );

  const [playDrawingCardsSound] = useSound(drawingCardsSound, { volume: 0.5 });

  const handCards = useAppSelector(
    (state: RootState) => state.game.playerOne.Hand
  );

  const cardStableListRef = useRef<
    Array<{ id: string; cardNumber: string; actionDataOverride: string }>
  >([]);
  const nextIdCounterRef = useRef<number>(0);

  const handCardsWithStableIds = useMemo<CardWithStableId[]>(() => {
    const cards = handCards ?? [];
    const prevList = cardStableListRef.current;

    const prevByAdoKey = new Map<string, string[]>();
    const prevByCardNumber = new Map<string, string[]>();
    for (const { id, cardNumber, actionDataOverride } of prevList) {
      const adoKey = `${cardNumber}::${actionDataOverride}`;
      const adoArr = prevByAdoKey.get(adoKey) ?? [];
      adoArr.push(id);
      prevByAdoKey.set(adoKey, adoArr);

      const cnArr = prevByCardNumber.get(cardNumber) ?? [];
      cnArr.push(id);
      prevByCardNumber.set(cardNumber, cnArr);
    }

    const usedIds = new Set<string>();
    const adoConsumed = new Map<string, number>();

    const result: CardWithStableId[] = cards.map((card: Card) => {
      const ado = card.actionDataOverride ?? '';
      const isNumericAdo = ado !== '' && NUMERIC_RE.test(ado);

      if (isNumericAdo) {
        const adoKey = `${card.cardNumber}::${ado}`;
        const ids = prevByAdoKey.get(adoKey);
        if (ids) {
          const consumed = adoConsumed.get(adoKey) ?? 0;
          if (consumed < ids.length) {
            const id = ids[consumed];
            if (!usedIds.has(id)) {
              usedIds.add(id);
              adoConsumed.set(adoKey, consumed + 1);
              return { card, id };
            }
          }
        }
      }

      const cnIds = prevByCardNumber.get(card.cardNumber);
      if (cnIds) {
        for (const id of cnIds) {
          if (!usedIds.has(id)) {
            usedIds.add(id);
            return { card, id };
          }
        }
      }

      const newId = `hand-card-${nextIdCounterRef.current++}`;
      usedIds.add(newId);
      return { card, id: newId };
    });

    cardStableListRef.current = result.map(({ card, id }) => ({
      id,
      cardNumber: card.cardNumber,
      actionDataOverride: card.actionDataOverride ?? ''
    }));

    return result;
  }, [handCards]);

  const [orderedHandIds, setOrderedHandIds] = useState<string[]>([]);
  const [handCardRotations, setHandCardRotations] = useState<
    Record<string, number>
  >({});
  const heldHandCardIdRef = useRef<string | null>(null);
  const adjustHandCardRotationRef = useRef<
    (cardId: string, rotationDelta: number) => void
  >(() => undefined);
  const pendingWheelRotationRef = useRef(0);
  const wheelRotationFrameRef = useRef<number | null>(null);
  const [previewHandIds, setPreviewHandIds] = useState<string[] | null>(null);
  const [dragStartOrderIds, setDragStartOrderIds] = useState<string[] | null>(
    null
  );
  const [handShuffleRevision, setHandShuffleRevision] = useState(0);
  const [handReorderStepPx, setHandReorderStepPx] = useState<number>(
    DEFAULT_HAND_REORDER_STEP_PX
  );
  const handRowRef = useRef<HTMLDivElement | null>(null);
  const scrollInnerRef = useRef<HTMLDivElement | null>(null);
  const soundPlayedForDragRef = useRef<boolean>(false);
  const [cardSpacingPx, setCardSpacingPx] = useState<number | null>(null);
  const [maxScrollOffset, setMaxScrollOffset] = useState(0);
  const scrollOffsetRef = useRef(0);
  const scrollAvailabilityRef = useRef({ left: false, right: false });
  const [scrollAvailability, setScrollAvailability] = useState(
    scrollAvailabilityRef.current
  );
  const pendingHandScrollDeltaRef = useRef(0);
  const handScrollFrameRef = useRef<number | null>(null);
  const scrollBlockTimerRef = useRef<number | null>(null);
  const scrollBlockedRef = useRef(false);
  const [gameZoneBounds, setGameZoneBounds] = useState<{
    left: number;
    right: number;
  } | null>(null);

  useEffect(() => {
    const gameZone = document.querySelector('.gameZone') as HTMLElement | null;
    if (!gameZone) return;

    const update = () => {
      const rect = gameZone.getBoundingClientRect();
      const left = rect.left;
      const right = window.innerWidth - rect.right;
      setGameZoneBounds((previousBounds) =>
        previousBounds?.left === left && previousBounds.right === right
          ? previousBounds
          : { left, right }
      );
    };

    update();
    const ro = new ResizeObserver(update);
    ro.observe(gameZone);
    return () => ro.disconnect();
  }, []);
  const arsenalCards = useAppSelector(
    (state: RootState) => state.game.playerOne.Arsenal
  );
  const playableBanishedCards = useAppSelector(selectPlayableBanishedCards);
  const playableTheirBanishedCards = useAppSelector(
    selectPlayableTheirBanishedCards
  );
  const playableGraveyardCards = useAppSelector(selectPlayableGraveyardCards);

  const applyScrollOffset = useCallback(
    (requestedOffset: number, limit = maxScrollOffset) => {
      const nextOffset = Math.max(0, Math.min(limit, requestedOffset));
      scrollOffsetRef.current = nextOffset;

      if (handRowRef.current) {
        handRowRef.current.style.transform =
          nextOffset > 0 ? `translate3d(-${nextOffset}px, 0, 0)` : '';
      }

      const nextAvailability = {
        left: nextOffset > 0,
        right: nextOffset < limit
      };
      const previousAvailability = scrollAvailabilityRef.current;
      if (
        previousAvailability.left !== nextAvailability.left ||
        previousAvailability.right !== nextAvailability.right
      ) {
        scrollAvailabilityRef.current = nextAvailability;
        setScrollAvailability(nextAvailability);
      }

      return nextOffset;
    },
    [maxScrollOffset]
  );

  // Detect newly drawn cards for the draw animation
  const newlyDrawnCardNumbers = useNewlyDrawnCards(handCards);

  useEffect(() => {
    setOrderedHandIds((previousOrder) => {
      const currentIds = handCardsWithStableIds.map((entry) => entry.id);
      const currentIdSet = new Set(currentIds);

      const preservedOrder = previousOrder.filter((id) => currentIdSet.has(id));
      const preservedIdSet = new Set(preservedOrder);
      const newIds = currentIds.filter((id) => !preservedIdSet.has(id));
      const nextOrder = [...preservedOrder, ...newIds];

      if (
        nextOrder.length === previousOrder.length &&
        nextOrder.every((id, index) => id === previousOrder[index])
      ) {
        return previousOrder;
      }

      return nextOrder;
    });
  }, [handCardsWithStableIds]);

  useEffect(() => {
    const validIds = new Set(handCardsWithStableIds.map((entry) => entry.id));
    setHandCardRotations((previousRotations) => {
      const nextRotations = Object.fromEntries(
        Object.entries(previousRotations).filter(([id]) => validIds.has(id))
      );

      return Object.keys(nextRotations).length ===
        Object.keys(previousRotations).length
        ? previousRotations
        : nextRotations;
    });
  }, [handCardsWithStableIds]);

  useEffect(() => {
    if (!dragStartOrderIds) {
      setPreviewHandIds(null);
      return;
    }

    const validIds = new Set(handCardsWithStableIds.map((entry) => entry.id));
    const hasInvalidDraggedId = dragStartOrderIds.some(
      (id) => !validIds.has(id)
    );
    if (hasInvalidDraggedId) {
      setDragStartOrderIds(null);
      setPreviewHandIds(null);
    }
  }, [dragStartOrderIds, handCardsWithStableIds]);

  const moveCardIdInOrder = (
    sourceOrder: string[],
    draggedCardId: string,
    toIndex: number
  ) => {
    const fromIndex = sourceOrder.indexOf(draggedCardId);
    if (fromIndex === -1 || fromIndex === toIndex) {
      return sourceOrder;
    }

    const nextOrder = [...sourceOrder];
    const [draggedId] = nextOrder.splice(fromIndex, 1);
    nextOrder.splice(toIndex, 0, draggedId);
    return nextOrder;
  };

  const orderedHandCards = useMemo<CardWithStableId[]>(() => {
    if (handCardsWithStableIds.length === 0) {
      return [];
    }

    const handCardById = new Map(
      handCardsWithStableIds.map((entry) => [entry.id, entry] as const)
    );
    const idsForRender = previewHandIds ?? orderedHandIds;
    const ordered = idsForRender
      .map((id) => handCardById.get(id))
      .filter((entry): entry is CardWithStableId => entry !== undefined);

    if (ordered.length === handCardsWithStableIds.length) {
      return ordered;
    }

    const orderedIdSet = new Set(ordered.map((e) => e.id));
    const newEntries = handCardsWithStableIds.filter(
      (entry) => !orderedIdSet.has(entry.id)
    );
    return [...ordered, ...newEntries];
  }, [handCardsWithStableIds, orderedHandIds, previewHandIds]);

  const handleHandCardDragStart = () => {
    setDragStartOrderIds(orderedHandIds);
    setPreviewHandIds(orderedHandIds);
    soundPlayedForDragRef.current = false;
  };

  const handleHandCardDragMove = (
    draggedCardId: string,
    offsetX: number,
    offsetY: number
  ) => {
    if (!dragStartOrderIds) {
      return;
    }

    if (Math.abs(offsetX) <= Math.abs(offsetY)) {
      return;
    }

    const fromIndex = dragStartOrderIds.indexOf(draggedCardId);
    if (fromIndex === -1) {
      return;
    }

    const cardSlotsMoved = Math.round(offsetX / handReorderStepPx);
    const toIndex = Math.min(
      dragStartOrderIds.length - 1,
      Math.max(0, fromIndex + cardSlotsMoved)
    );

    const nextPreviewOrder = moveCardIdInOrder(
      dragStartOrderIds,
      draggedCardId,
      toIndex
    );

    setPreviewHandIds((currentPreview) => {
      if (
        currentPreview &&
        currentPreview.length === nextPreviewOrder.length &&
        currentPreview.every((id, index) => id === nextPreviewOrder[index])
      ) {
        return currentPreview;
      }

      return nextPreviewOrder;
    });
  };

  const clearHandDragPreview = () => {
    setDragStartOrderIds(null);
    setPreviewHandIds(null);
    soundPlayedForDragRef.current = false;
  };

  // Play sound once when card is first moved during drag
  useEffect(() => {
    if (previewHandIds && dragStartOrderIds && !soundPlayedForDragRef.current) {
      const orderHasChanged =
        previewHandIds.length !== dragStartOrderIds.length ||
        !previewHandIds.every((id, idx) => id === dragStartOrderIds[idx]);

      if (orderHasChanged && !isMuted) {
        playDrawingCardsSound();
        soundPlayedForDragRef.current = true;
      }
    }
  }, [previewHandIds, dragStartOrderIds, isMuted, playDrawingCardsSound]);

  useEffect(() => {
    const handRow = handRowRef.current;
    if (!handRow) {
      return;
    }
    const cardElements = (Array.from(handRow.children) as HTMLElement[]).filter(
      (el) => !el.dataset.zoneSeparator
    );
    if (cardElements.length === 0) {
      return;
    }
    if (cardElements.length === 1) {
      const rect = cardElements[0].getBoundingClientRect();
      const singleCardStep = Math.max(72, Math.min(220, rect.width * 0.9));
      setHandReorderStepPx(singleCardStep);
      return;
    }
    const centers = cardElements.map((element) => {
      const rect = element.getBoundingClientRect();
      return rect.left + rect.width / 2;
    });
    let totalGap = 0;
    let gapCount = 0;
    for (let index = 1; index < centers.length; index++) {
      const gap = Math.abs(centers[index] - centers[index - 1]);
      if (gap > 1) {
        totalGap += gap;
        gapCount += 1;
      }
    }
    if (gapCount > 0) {
      const measuredStep = totalGap / gapCount;
      const clampedStep = Math.max(72, Math.min(220, measuredStep));
      setHandReorderStepPx(clampedStep);
    }
  }, [orderedHandCards.length, width, height]);

  useEffect(() => {
    const handRow = handRowRef.current;
    if (!handRow) return;

    const cardElements = (Array.from(handRow.children) as HTMLElement[]).filter(
      (el) => !el.dataset.zoneSeparator
    );
    const N = cardElements.length;
    if (N <= 1) {
      setCardSpacingPx(null);
      setMaxScrollOffset(0);
      applyScrollOffset(0, 0);
      return;
    }

    // Use the visible scroll-inner width so button widths are excluded
    const containerWidth =
      scrollInnerRef.current?.clientWidth ?? handRow.offsetWidth;
    // getBoundingClientRect().width is the intrinsic card width, unaffected by margin-right
    const cardWidth = cardElements[0].getBoundingClientRect().width;
    const isPortrait = window.innerHeight > window.innerWidth;
    const defaultSpacing = isPortrait
      ? window.innerHeight * 0.01
      : window.innerHeight * 0.02;
    const naturalWidth = N * cardWidth + (N - 1) * defaultSpacing;

    if (naturalWidth <= containerWidth) {
      if (isPortrait) {
        const availableForGaps = containerWidth - N * cardWidth;
        const spreadGap = availableForGaps / (N - 1);
        setCardSpacingPx(Math.min(40, Math.max(defaultSpacing, spreadGap)));
      } else {
        setCardSpacingPx(null);
      }
      setMaxScrollOffset(0);
      applyScrollOffset(0, 0);
      return;
    }

    // On desktop (landscape): compress cards using negative spacing (overlap) up to 30%
    // of card width before falling back to scrolling.
    if (!isPortrait) {
      const maxOverlapSpacing = -cardWidth * 0.3;
      const widthAtMaxOverlap = N * cardWidth + (N - 1) * maxOverlapSpacing;
      if (widthAtMaxOverlap <= containerWidth) {
        // Cards fit if we overlap — find exact spacing needed
        const fittingSpacing = (containerWidth - N * cardWidth) / (N - 1);
        setCardSpacingPx(Math.max(maxOverlapSpacing, fittingSpacing));
        setMaxScrollOffset(0);
        applyScrollOffset(0, 0);
        return;
      }
      // Even at max overlap they don't fit — use max overlap and scroll the rest
      setCardSpacingPx(maxOverlapSpacing);
      const overflowWidth = widthAtMaxOverlap;
      const newMax = Math.max(0, overflowWidth - containerWidth);
      setMaxScrollOffset(newMax);
      applyScrollOffset(scrollOffsetRef.current, newMax);
      return;
    }

    const maxOverlapSpacing = -cardWidth * 0.2;
    const widthAtMaxOverlap = N * cardWidth + (N - 1) * maxOverlapSpacing;
    if (widthAtMaxOverlap <= containerWidth) {
      const fittingSpacing = (containerWidth - N * cardWidth) / (N - 1);
      setCardSpacingPx(Math.max(maxOverlapSpacing, fittingSpacing));
      setMaxScrollOffset(0);
      applyScrollOffset(0, 0);
      return;
    }
    setCardSpacingPx(maxOverlapSpacing);
    const overflowWidth = widthAtMaxOverlap;
    const newMax = Math.max(0, overflowWidth - containerWidth);
    setMaxScrollOffset(newMax);
    applyScrollOffset(scrollOffsetRef.current, newMax);
  }, [
    orderedHandCards.length,
    arsenalCards?.length,
    playableBanishedCards?.length,
    playableTheirBanishedCards?.length,
    playableGraveyardCards?.length,
    width,
    height,
    applyScrollOffset
  ]);

  const scrollHand = useCallback(
    (direction: 'left' | 'right') => {
      const inner = scrollInnerRef.current;
      if (!inner) return;
      const amount = inner.clientWidth * 0.6;
      const requestedOffset =
        direction === 'right'
          ? scrollOffsetRef.current + amount
          : scrollOffsetRef.current - amount;
      applyScrollOffset(requestedOffset);
      scrollBlockedRef.current = true;
      if (scrollBlockTimerRef.current !== null) {
        window.clearTimeout(scrollBlockTimerRef.current);
      }
      scrollBlockTimerRef.current = window.setTimeout(() => {
        scrollBlockedRef.current = false;
        scrollBlockTimerRef.current = null;
      }, 400);
    },
    [applyScrollOffset]
  );

  useEffect(() => {
    return () => {
      if (scrollBlockTimerRef.current !== null) {
        window.clearTimeout(scrollBlockTimerRef.current);
      }
    };
  }, []);

  // A held card can be rotated with the wheel anywhere on the game board. When
  // no card is held, wheel scrolling remains limited to the hand itself.
  useEffect(() => {
    const handleWheel = (e: WheelEvent) => {
      const heldCardId = heldHandCardIdRef.current;
      if (heldCardId) {
        e.preventDefault();
        const wheelDelta = e.deltaY || e.deltaX;
        const rotationDelta = Math.max(
          -MAX_WHEEL_ROTATION_DEGREES,
          Math.min(
            MAX_WHEEL_ROTATION_DEGREES,
            wheelDelta * WHEEL_ROTATION_DEGREES_PER_PIXEL
          )
        );
        pendingWheelRotationRef.current = Math.max(
          -MAX_WHEEL_ROTATION_DEGREES,
          Math.min(
            MAX_WHEEL_ROTATION_DEGREES,
            pendingWheelRotationRef.current + rotationDelta
          )
        );

        if (wheelRotationFrameRef.current === null) {
          wheelRotationFrameRef.current = window.requestAnimationFrame(() => {
            const pendingRotation = pendingWheelRotationRef.current;
            pendingWheelRotationRef.current = 0;
            wheelRotationFrameRef.current = null;

            const activeCardId = heldHandCardIdRef.current;
            if (activeCardId && pendingRotation !== 0) {
              adjustHandCardRotationRef.current(activeCardId, pendingRotation);
            }
          });
        }
        return;
      }

      const handRow = handRowRef.current;
      if (!handRow || !handRow.contains(e.target as Node)) return;
      if (maxScrollOffset === 0) return;
      e.preventDefault();
      const delta =
        Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : e.deltaY;
      pendingHandScrollDeltaRef.current += delta;
      if (handScrollFrameRef.current === null) {
        handScrollFrameRef.current = window.requestAnimationFrame(() => {
          const pendingDelta = pendingHandScrollDeltaRef.current;
          pendingHandScrollDeltaRef.current = 0;
          handScrollFrameRef.current = null;

          applyScrollOffset(scrollOffsetRef.current + pendingDelta);
        });
      }
    };

    window.addEventListener('wheel', handleWheel, {
      capture: true,
      passive: false
    });
    return () => {
      window.removeEventListener('wheel', handleWheel, true);
      if (wheelRotationFrameRef.current !== null) {
        window.cancelAnimationFrame(wheelRotationFrameRef.current);
        wheelRotationFrameRef.current = null;
      }
      if (handScrollFrameRef.current !== null) {
        window.cancelAnimationFrame(handScrollFrameRef.current);
        handScrollFrameRef.current = null;
      }
      pendingWheelRotationRef.current = 0;
      pendingHandScrollDeltaRef.current = 0;
    };
  }, [maxScrollOffset, applyScrollOffset]);

  const handleHandCardReorder = (
    draggedCardId: string,
    offsetX: number,
    offsetY: number
  ) => {
    if (Math.abs(offsetX) <= Math.abs(offsetY)) {
      return false;
    }

    const cardSlotsMoved = Math.round(offsetX / handReorderStepPx);
    if (cardSlotsMoved === 0) {
      return false;
    }

    const baseOrder = dragStartOrderIds ?? orderedHandIds;

    setOrderedHandIds((currentOrder) => {
      const effectiveOrder =
        currentOrder.length === baseOrder.length ? currentOrder : baseOrder;
      const fromIndex = effectiveOrder.indexOf(draggedCardId);
      if (fromIndex === -1) {
        return effectiveOrder;
      }

      const toIndex = Math.min(
        effectiveOrder.length - 1,
        Math.max(0, fromIndex + cardSlotsMoved)
      );

      if (toIndex === fromIndex) {
        return effectiveOrder;
      }

      return moveCardIdInOrder(effectiveOrder, draggedCardId, toIndex);
    });

    clearHandDragPreview();

    return true;
  };

  const dragMoveImplRef = useRef(handleHandCardDragMove);
  const dragEndImplRef = useRef(handleHandCardReorder);
  const dragStartImplRef = useRef(handleHandCardDragStart);
  const dragCancelImplRef = useRef(clearHandDragPreview);
  dragMoveImplRef.current = handleHandCardDragMove;
  dragEndImplRef.current = handleHandCardReorder;
  dragStartImplRef.current = handleHandCardDragStart;
  dragCancelImplRef.current = clearHandDragPreview;

  const stableDragMove = useCallback((cardId: string, info: PanInfo) => {
    dragMoveImplRef.current(cardId, info.offset.x, info.offset.y);
  }, []);
  const stableDragEnd = useCallback(
    (cardId: string, info: PanInfo): boolean => {
      return (
        dragEndImplRef.current(cardId, info.offset.x, info.offset.y) ?? false
      );
    },
    []
  );
  const stableDragStart = useCallback(() => {
    dragStartImplRef.current();
  }, []);
  const stableDragCancel = useCallback(() => {
    dragCancelImplRef.current();
  }, []);

  const addCardToPlayedCards = useCallback((cardName: string) => {
    setPlayedCards((prev) => [...prev, cardName]);
  }, []);

  const adjustHandCardRotation = useCallback(
    (cardId: string, rotationDelta: number) => {
      if (!cardId) return;

      setHandCardRotations((previousRotations) => {
        const currentRotation = previousRotations[cardId] ?? 0;
        const nextRotation =
          (((currentRotation + rotationDelta) % 360) + 360) % 360;

        if (Math.abs(nextRotation) < 0.001) {
          const remainingRotations = { ...previousRotations };
          delete remainingRotations[cardId];
          return remainingRotations;
        }

        return { ...previousRotations, [cardId]: nextRotation };
      });
    },
    []
  );
  adjustHandCardRotationRef.current = adjustHandCardRotation;

  const rotateHandCard = useCallback(
    (cardId: string, direction: 1 | -1) => {
      adjustHandCardRotation(cardId, direction * CARD_ROTATION_STEP_DEGREES);
    },
    [adjustHandCardRotation]
  );

  const startHoldingHandCardForRotation = useCallback((cardId: string) => {
    heldHandCardIdRef.current = cardId || null;
    setHandCardRotationHeld(Boolean(cardId));
  }, []);

  const stopHoldingHandCardForRotation = useCallback(() => {
    heldHandCardIdRef.current = null;
    setHandCardRotationHeld(false);
  }, []);

  useEffect(
    () => stopHoldingHandCardForRotation,
    [stopHoldingHandCardForRotation]
  );

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const key = event.key.toLowerCase();
      if (key !== 'q' && key !== 'e') return;

      const target = event.target as HTMLElement;
      if (
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.isContentEditable
      )
        return;

      const heldCardId = heldHandCardIdRef.current;
      if (!heldCardId) return;

      event.preventDefault();
      adjustHandCardRotation(
        heldCardId,
        key === 'q'
          ? -CARD_ROTATION_KEY_STEP_DEGREES
          : CARD_ROTATION_KEY_STEP_DEGREES
      );
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [adjustHandCardRotation]);

  useEffect(() => {
    if (
      (handCards?.length === 0 || handCards === undefined) &&
      (playableBanishedCards?.length === 0 ||
        playableBanishedCards === undefined) &&
      (playableTheirBanishedCards?.length === 0 ||
        playableTheirBanishedCards === undefined) &&
      (playableGraveyardCards?.length === 0 ||
        playableGraveyardCards === undefined)
    ) {
      setPlayedCards([]);
    }
  }, [
    handCards,
    playableBanishedCards,
    playableTheirBanishedCards,
    playableGraveyardCards
  ]);

  // Shuffle hand randomly with S key; guarantees at least 1 card changes position
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key !== 's' && e.key !== 'S') return;
      const target = e.target as HTMLElement;
      if (
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.isContentEditable
      )
        return;

      if (orderedHandIds.length <= 1) return;

      setOrderedHandIds((currentOrder) => {
        let shuffled: string[];
        let hasChanged = false;

        // Keep shuffling until order changes (guarantees at least 1 card moves)
        do {
          shuffled = [...currentOrder];
          for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
          }
          hasChanged = shuffled.some((card, idx) => card !== currentOrder[idx]);
        } while (!hasChanged);

        return shuffled;
      });

      setHandShuffleRevision((revision) => revision + 1);
      if (!isMuted) {
        playDrawingCardsSound();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [orderedHandIds.length, isMuted, playDrawingCardsSound]);

  if (
    arsenalCards === undefined ||
    arsenalCards.length === 0 ||
    arsenalCards[0].cardNumber === ''
  ) {
    hasArsenal = false;
  }

  if (playerID === 3 || isReplay) {
    return <></>;
  }

  const zoneSeparatorMarginLeft =
    cardSpacingPx !== null && cardSpacingPx < 0
      ? Math.max(0, 4 - cardSpacingPx)
      : 0;
  const zoneSeparatorStyle =
    zoneSeparatorMarginLeft > 0
      ? { marginLeft: zoneSeparatorMarginLeft }
      : undefined;

  const hasHandCards = orderedHandCards.length > 0;
  const hasBanishedCards = (playableBanishedCards?.length ?? 0) > 0;
  const hasTheirBanishedCards = (playableTheirBanishedCards?.length ?? 0) > 0;
  const hasGraveyardCards = (playableGraveyardCards?.length ?? 0) > 0;

  const cardOccurrenceMap = new Map<string, number>();
  for (const c of playedCards) {
    cardOccurrenceMap.set(c, (cardOccurrenceMap.get(c) ?? 0) + 1);
  }
  const nextCardOccurrence = (cardNumber: string): number => {
    const count = cardOccurrenceMap.get(cardNumber) ?? 0;
    cardOccurrenceMap.set(cardNumber, count + 1);
    return count;
  };

  const canScrollLeft = scrollAvailability.left;
  const canScrollRight = scrollAvailability.right;

  return (
    <>
      {createPortal(
        <>
          <div
            className={styles.handScrollContainer}
            style={
              gameZoneBounds
                ? { left: gameZoneBounds.left, right: gameZoneBounds.right }
                : undefined
            }
          >
            <button
              className={classNames(styles.scrollButton, {
                [styles.scrollButtonHidden]: !canScrollLeft
              })}
              onPointerDown={() => scrollHand('left')}
              aria-label="Scroll hand left"
            >
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <polyline points="15 18 9 12 15 6" />
              </svg>
            </button>
            <div
              ref={scrollInnerRef}
              className={classNames(styles.handScrollInner, {
                [styles.handScrollInnerScrollable]: maxScrollOffset > 0
              })}
            >
              <div
                ref={handRowRef}
                className={styles.handRow}
                style={
                  {
                    ...(cardSpacingPx !== null
                      ? { '--card-spacing': `${cardSpacingPx}px` }
                      : {}),
                    transform:
                      scrollOffsetRef.current > 0
                        ? `translate3d(-${scrollOffsetRef.current}px, 0, 0)`
                        : undefined
                  } as React.CSSProperties
                }
                onContextMenu={(e) => e.preventDefault()}
              >
                <AnimatePresence>
                  {orderedHandCards.length > 0 &&
                    orderedHandCards.map(({ card, id }, ix) => {
                      nextCardOccurrence(card.cardNumber);
                      const isNewlyDrawn = newlyDrawnCardNumbers.has(
                        card.cardNumber
                      );
                      return (
                        <PlayerHandCard
                          card={card}
                          cardId={id}
                          key={`hand-${id}`}
                          rotation={handCardRotations[id]}
                          addCardToPlayedCards={addCardToPlayedCards}
                          zIndex={ix + 200}
                          isNewlyDrawn={isNewlyDrawn}
                          enableLayoutAnimation
                          shuffleRevision={handShuffleRevision}
                          scrollBlockedRef={scrollBlockedRef}
                          onHandReorderDragStart={stableDragStart}
                          onHandReorderDragMove={stableDragMove}
                          onHandReorderDragEnd={stableDragEnd}
                          onHandReorderDragCancel={stableDragCancel}
                          onRotate={rotateHandCard}
                          onRotationHoldStart={startHoldingHandCardForRotation}
                          onRotationHoldEnd={stopHoldingHandCardForRotation}
                        />
                      );
                    })}
                  {hasArsenal &&
                    showArsenal &&
                    arsenalCards !== undefined &&
                    arsenalCards.map((card: Card, ix: number) => {
                      const cardCount = nextCardOccurrence(card.cardNumber);
                      return (
                        <PlayerHandCard
                          card={card}
                          isArsenal
                          key={`arsenal-${card.cardNumber}-${cardCount}`}
                          addCardToPlayedCards={addCardToPlayedCards}
                          zIndex={ix}
                        />
                      );
                    })}
                  {hasHandCards && hasBanishedCards && (
                    <div
                      className={styles.zoneSeparator}
                      data-zone-separator="true"
                      style={zoneSeparatorStyle}
                    />
                  )}
                  {playableBanishedCards !== undefined &&
                    playableBanishedCards.map((card: Card, ix: number) => {
                      const cardCount = nextCardOccurrence(card.cardNumber);
                      return (
                        <PlayerHandCard
                          card={card}
                          isBanished
                          key={`banished-${card.cardNumber}-${cardCount}`}
                          addCardToPlayedCards={addCardToPlayedCards}
                          zIndex={orderedHandCards.length + ix + 200}
                          scrollBlockedRef={scrollBlockedRef}
                        />
                      );
                    })}
                  {(hasHandCards || hasBanishedCards) &&
                    hasTheirBanishedCards && (
                      <div
                        className={styles.zoneSeparator}
                        data-zone-separator="true"
                        style={zoneSeparatorStyle}
                      />
                    )}
                  {playableTheirBanishedCards !== undefined &&
                    playableTheirBanishedCards.map((card: Card, ix: number) => {
                      const cardCount = nextCardOccurrence(card.cardNumber);
                      return (
                        <PlayerHandCard
                          card={card}
                          isBanished
                          key={`banished-${card.cardNumber}-${cardCount}`}
                          addCardToPlayedCards={addCardToPlayedCards}
                          zIndex={
                            orderedHandCards.length +
                            (playableBanishedCards?.length ?? 0) +
                            ix +
                            200
                          }
                          scrollBlockedRef={scrollBlockedRef}
                        />
                      );
                    })}
                  {(hasHandCards ||
                    hasBanishedCards ||
                    hasTheirBanishedCards) &&
                    hasGraveyardCards && (
                      <div
                        className={styles.zoneSeparator}
                        data-zone-separator="true"
                        style={zoneSeparatorStyle}
                      />
                    )}
                  {playableGraveyardCards !== undefined &&
                    playableGraveyardCards.map((card: Card, ix: number) => {
                      const cardCount = nextCardOccurrence(card.cardNumber);
                      return (
                        <PlayerHandCard
                          card={card}
                          isGraveyard
                          key={`graveyard-${card.cardNumber}-${cardCount}`}
                          addCardToPlayedCards={addCardToPlayedCards}
                          zIndex={
                            orderedHandCards.length +
                            (playableBanishedCards?.length ?? 0) +
                            (playableTheirBanishedCards?.length ?? 0) +
                            ix +
                            200
                          }
                          scrollBlockedRef={scrollBlockedRef}
                        />
                      );
                    })}
                </AnimatePresence>
              </div>
            </div>
            <button
              className={classNames(styles.scrollButton, {
                [styles.scrollButtonHidden]: !canScrollRight
              })}
              onPointerDown={() => scrollHand('right')}
              aria-label="Scroll hand right"
            >
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <polyline points="9 18 15 12 9 6" />
              </svg>
            </button>
          </div>
        </>,
        document.body
      )}
    </>
  );
}

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
import PlayerHandCard, {
  DragPlayState
} from '../../elements/playerHandCard/PlayerHandCard';
import { useAppDispatch, useAppSelector } from 'app/Hooks';
import { flushHandPlayQueue } from 'features/game/GameSlice';
import useWindowDimensions from 'hooks/useWindowDimensions';
import { useMediaQuery } from 'hooks/useMediaQuery';
import { AnimatePresence, MotionConfig, PanInfo } from 'framer-motion';
import { createPortal } from 'react-dom';
import useSound from 'use-sound';
import drawingCardsSound from 'sounds/drawing_cards.wav';
import { setHandCardRotationHeld } from 'utils/handCardRotation';
import { useTranslation } from 'react-i18next';
import { useCookieString } from 'utils/cookieStore';
import {
  ENABLE_FANNED_HAND_COOKIE,
  FAN_EXPAND_DELAY_MS,
  FAN_KEYWORD_DELAY_MS,
  FAN_REST_HIDDEN_RATIO,
  FAN_UNHOVER_ANCHOR_ATTR,
  FanGeometry,
  FanSlot,
  applyFanHover,
  computeFanSlots,
  fanHoverIndexAt,
  fanHoverLineY,
  fanHoverScaleFor,
  fanSlotIndexAt
} from './fanLayout';
import { useFanHover } from './useFanHover';
import ClassicPlayerHand from './ClassicPlayerHand';

const CARD_ROTATION_STEP_DEGREES = 90;
const CARD_ROTATION_KEY_STEP_DEGREES = 3;
const WHEEL_ROTATION_DEGREES_PER_PIXEL = 0.15;
const MAX_WHEEL_ROTATION_DEGREES = 15;
const NUMERIC_RE = /^\d+$/;
const PITCH_PHASES = new Set(['P', 'CHOOSEHANDCANCEL', 'PAYGOLDORPITCH']);

const preventContextMenu = (event: React.MouseEvent) => event.preventDefault();

type CardWithStableId = {
  card: Card;
  id: string;
};

type FanItem = {
  id: string;
  card: Card;
  zone: 'hand' | 'banishedMine' | 'banishedTheirs' | 'graveyard';
};

const mergeHandOrder = (
  previousOrder: string[],
  currentIds: string[]
): string[] => {
  const currentIdSet = new Set(currentIds);
  const nextOrder = previousOrder.filter((id) => currentIdSet.has(id));
  const preservedIdSet = new Set(nextOrder);
  let lastPreservedIndex = -1;
  currentIds.forEach((id, index) => {
    if (preservedIdSet.has(id)) lastPreservedIndex = index;
  });
  for (let index = 0; index < currentIds.length; index++) {
    const id = currentIds[index];
    if (preservedIdSet.has(id)) continue;
    if (index > lastPreservedIndex) {
      nextOrder.push(id);
      continue;
    }
    let insertAt = 0;
    for (let previous = index - 1; previous >= 0; previous--) {
      const at = nextOrder.indexOf(currentIds[previous]);
      if (at !== -1) {
        insertAt = at + 1;
        break;
      }
    }
    nextOrder.splice(insertAt, 0, id);
  }
  return nextOrder;
};

const zoneCardKeys = (prefix: string, cards: Card[] | undefined): string[] => {
  const seen = new Map<string, number>();
  return (cards ?? []).map((card) => {
    if (card.uniqueId && card.uniqueId !== '-') {
      return `${prefix}-${card.uniqueId}`;
    }
    const occurrence = seen.get(card.cardNumber) ?? 0;
    seen.set(card.cardNumber, occurrence + 1);
    return `${prefix}-${card.cardNumber}-${occurrence}`;
  });
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

function PlayerHand() {
  const { t } = useTranslation();
  const [width, height] = useWindowDimensions();
  const isMobile = useMediaQuery('(max-width: 1199px)');
  const isPortrait = useMediaQuery('(orientation: portrait)');
  const canCollapseHand = isMobile || isPortrait;
  const [isHandCollapsed, setIsHandCollapsed] = useState(false);
  const hoverImageSize = useCookieString('hoverImageSize');
  const hasPriority = useAppSelector(
    (state: RootState) => state.game.hasPriority
  );
  const turnPhase = useAppSelector(
    (state: RootState) => state.game.turnPhase?.turnPhase
  );
  const isPitching = !!turnPhase && PITCH_PHASES.has(turnPhase);
  const dispatch = useAppDispatch();
  const queuedHandPlayCount = useAppSelector(
    (state: RootState) => state.game.queuedHandPlays?.length ?? 0
  );
  const isPlayInFlight = useAppSelector(
    (state: RootState) => state.game.inFlightPlay !== undefined
  );
  const isAwaitingPlayState = useAppSelector(
    (state: RootState) => !!state.game.isAwaitingPlayState
  );
  const isButtonInputPending = useAppSelector(
    (state: RootState) => !!state.game.buttonInput
  );

  useEffect(() => {
    if (
      queuedHandPlayCount === 0 ||
      isPlayInFlight ||
      isAwaitingPlayState ||
      isButtonInputPending
    ) {
      return;
    }
    dispatch(flushHandPlayQueue());
  }, [
    queuedHandPlayCount,
    isPlayInFlight,
    isAwaitingPlayState,
    isButtonInputPending,
    dispatch
  ]);
  const [dragPlayState, setDragPlayState] = useState<DragPlayState>('idle');
  const { hoveredCardId, landingCardIds, handleHoverChange, clearHover } =
    useFanHover();
  const lastFanSlotsRef = useRef(new Map<string, FanSlot>());
  const fanStageRef = useRef<HTMLDivElement>(null);
  const lastPointerRef = useRef<{ x: number; y: number; type: string } | null>(
    null
  );

  const playerID = useAppSelector(
    (state: RootState) => state.game.gameInfo.playerID
  );
  const isReplay = useAppSelector(
    (state: RootState) => state.game.gameInfo.isReplay
  );

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
      const adoArr = prevByAdoKey.get(adoKey);
      if (adoArr) adoArr.push(id);
      else prevByAdoKey.set(adoKey, [id]);

      const cnArr = prevByCardNumber.get(cardNumber);
      if (cnArr) cnArr.push(id);
      else prevByCardNumber.set(cardNumber, [id]);
    }

    const usedIds = new Set<string>();
    const adoConsumed = new Map<string, number>();
    for (const card of cards) {
      if (card.uniqueId && card.uniqueId !== '-') {
        usedIds.add(`uid-${card.uniqueId}`);
      }
    }

    const result: CardWithStableId[] = cards.map((card: Card) => {
      if (card.uniqueId && card.uniqueId !== '-') {
        return { card, id: `uid-${card.uniqueId}` };
      }

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
  const soundPlayedForDragRef = useRef<boolean>(false);
  const [gameZoneBounds, setGameZoneBounds] = useState<{
    left: number;
    right: number;
  } | null>(null);

  useEffect(() => {
    if (isMobile) {
      setGameZoneBounds(null);
      return;
    }

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
  }, [isMobile]);

  const [unhoverAnchorY, setUnhoverAnchorY] = useState<number | null>(null);

  useEffect(() => {
    const anchors = Array.from(
      document.querySelectorAll<HTMLElement>(`[${FAN_UNHOVER_ANCHOR_ATTR}]`)
    );
    if (anchors.length === 0) {
      setUnhoverAnchorY(null);
      return;
    }

    const update = () => {
      const bottom = Math.max(
        ...anchors.map((anchor) => anchor.getBoundingClientRect().bottom)
      );
      setUnhoverAnchorY((previousBottom) =>
        previousBottom === bottom ? previousBottom : bottom
      );
    };

    update();
    const ro = new ResizeObserver(update);
    anchors.forEach((anchor) => ro.observe(anchor));
    return () => ro.disconnect();
  }, [width, height]);
  const playableBanishedCards = useAppSelector(selectPlayableBanishedCards);
  const playableTheirBanishedCards = useAppSelector(
    selectPlayableTheirBanishedCards
  );
  const playableGraveyardCards = useAppSelector(selectPlayableGraveyardCards);

  useEffect(() => {
    setOrderedHandIds((previousOrder) => {
      const currentIds = handCardsWithStableIds.map((entry) => entry.id);

      const nextOrder = mergeHandOrder(previousOrder, currentIds);

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
      const rotationIds = Object.keys(previousRotations);
      let allValid = true;
      for (const id of rotationIds) {
        if (!validIds.has(id)) {
          allValid = false;
          break;
        }
      }
      if (allValid) {
        return previousRotations;
      }
      const nextRotations: Record<string, number> = {};
      for (const id of rotationIds) {
        if (validIds.has(id)) nextRotations[id] = previousRotations[id];
      }
      return nextRotations;
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

    const handCardById = new Map<string, CardWithStableId>();
    for (const entry of handCardsWithStableIds) {
      handCardById.set(entry.id, entry);
    }
    const idsForRender = mergeHandOrder(
      previewHandIds ?? orderedHandIds,
      handCardsWithStableIds.map((entry) => entry.id)
    );
    const ordered: CardWithStableId[] = [];
    for (const id of idsForRender) {
      const entry = handCardById.get(id);
      if (entry !== undefined) ordered.push(entry);
    }
    return ordered;
  }, [handCardsWithStableIds, orderedHandIds, previewHandIds]);

  const fanItems = useMemo<FanItem[]>(() => {
    const items: FanItem[] = orderedHandCards.map(({ card, id }) => ({
      id,
      card,
      zone: 'hand'
    }));
    const addZone = (
      cards: Card[] | undefined,
      prefix: string,
      zone: FanItem['zone']
    ) => {
      const keys = zoneCardKeys(prefix, cards);
      (cards ?? []).forEach((card, index) =>
        items.push({ id: keys[index], card, zone })
      );
    };
    addZone(playableBanishedCards, 'banished-mine', 'banishedMine');
    addZone(playableTheirBanishedCards, 'banished-theirs', 'banishedTheirs');
    addZone(playableGraveyardCards, 'graveyard', 'graveyard');
    return items;
  }, [
    orderedHandCards,
    playableBanishedCards,
    playableTheirBanishedCards,
    playableGraveyardCards
  ]);

  const fanGeometry = useMemo<FanGeometry>(() => {
    const cardHeight = height * 0.25;
    return {
      stageWidth: Math.max(
        0,
        width - (gameZoneBounds?.left ?? 0) - (gameZoneBounds?.right ?? 0)
      ),
      cardHeight,
      cardWidth: (cardHeight * 2) / 3
    };
  }, [width, height, gameZoneBounds]);
  const fanHoverScale = fanHoverScaleFor(
    hoverImageSize,
    fanGeometry.cardHeight,
    height
  );

  const isDragActive = dragPlayState !== 'idle' || dragStartOrderIds !== null;
  const activeHoveredCardId = isDragActive ? null : hoveredCardId;
  const isFanLifted = activeHoveredCardId !== null;

  useEffect(() => {
    if (isDragActive) clearHover();
  }, [isDragActive, clearHover]);

  const [expandedCardId, setExpandedCardId] = useState<string | null>(null);
  const isHoverExpanded =
    activeHoveredCardId !== null &&
    (!isPitching || expandedCardId === activeHoveredCardId);

  useEffect(() => {
    setExpandedCardId(null);
    if (activeHoveredCardId === null || !isPitching) return;
    const expand = () => setExpandedCardId(activeHoveredCardId);
    if (lastPointerRef.current?.type === 'touch') {
      expand();
      return;
    }
    let timer = setTimeout(expand, FAN_EXPAND_DELAY_MS);
    const restartOnMove = (event: PointerEvent) => {
      if (event.pointerType === 'touch') return;
      clearTimeout(timer);
      timer = setTimeout(expand, FAN_EXPAND_DELAY_MS);
    };
    window.addEventListener('pointermove', restartOnMove, { passive: true });
    return () => {
      clearTimeout(timer);
      window.removeEventListener('pointermove', restartOnMove);
    };
  }, [activeHoveredCardId, isPitching]);

  const [keywordCardId, setKeywordCardId] = useState<string | null>(null);
  useEffect(() => {
    setKeywordCardId(null);
    if (activeHoveredCardId === null) return;
    if (lastPointerRef.current?.type === 'touch') {
      setKeywordCardId(activeHoveredCardId);
      return;
    }
    const timer = setTimeout(
      () => setKeywordCardId(activeHoveredCardId),
      FAN_KEYWORD_DELAY_MS
    );
    return () => clearTimeout(timer);
  }, [activeHoveredCardId]);
  const showHoverKeywords =
    isHoverExpanded && keywordCardId === activeHoveredCardId;

  const fanSlotById = useMemo(() => {
    const slots = new Map<string, FanSlot>();
    const hoveredIndex =
      activeHoveredCardId === null
        ? -1
        : fanItems.findIndex((item) => item.id === activeHoveredCardId);
    const computed = applyFanHover(
      computeFanSlots(fanItems.length, fanGeometry),
      hoveredIndex === -1 ? null : hoveredIndex,
      fanGeometry,
      fanHoverScale,
      isHoverExpanded
    );
    fanItems.forEach((item, index) => slots.set(item.id, computed[index]));
    return slots;
  }, [
    fanItems,
    activeHoveredCardId,
    isHoverExpanded,
    fanGeometry,
    fanHoverScale
  ]);

  const hoverTargetAt = useCallback(
    (x: number, y: number, items: FanItem[], hoveredId: string | null) => {
      const stage = fanStageRef.current;
      if (!stage || items.length === 0) return null;
      const rect = stage.getBoundingClientRect();
      if (
        y <
        fanHoverLineY(
          rect.bottom,
          fanGeometry.cardHeight,
          fanHoverScale,
          unhoverAnchorY
        )
      ) {
        return null;
      }
      const hoveredIndex =
        hoveredId === null
          ? -1
          : items.findIndex((item) => item.id === hoveredId);
      const index = fanHoverIndexAt(
        items.length,
        x - (rect.left + rect.width / 2),
        fanGeometry,
        hoveredIndex === -1 ? null : hoveredIndex,
        fanHoverScale,
        isHoverExpanded
      );
      return index === null ? null : items[index].id;
    },
    [fanGeometry, fanHoverScale, unhoverAnchorY, isHoverExpanded]
  );

  useEffect(() => {
    if (activeHoveredCardId === null) return;
    const track = (event: PointerEvent) => {
      if (event.pointerType === 'touch') return;
      const target = hoverTargetAt(
        event.clientX,
        event.clientY,
        fanItems,
        activeHoveredCardId
      );
      if (target === null) clearHover();
      else if (target !== activeHoveredCardId) handleHoverChange(target, true);
    };
    const leave = (event: PointerEvent) => {
      if (event.pointerType !== 'touch') clearHover();
    };
    const root = document.documentElement;
    window.addEventListener('pointermove', track, { passive: true });
    root.addEventListener('pointerleave', leave);
    return () => {
      window.removeEventListener('pointermove', track);
      root.removeEventListener('pointerleave', leave);
    };
  }, [
    activeHoveredCardId,
    fanItems,
    hoverTargetAt,
    clearHover,
    handleHoverChange
  ]);

  const handleFanPointerEnter = useCallback(
    (x: number, y: number) => {
      if (isDragActive) return;
      const target = hoverTargetAt(x, y, fanItems, null);
      if (target !== null) handleHoverChange(target, true);
    },
    [isDragActive, hoverTargetAt, fanItems, handleHoverChange]
  );

  useEffect(() => {
    const previous = lastFanSlotsRef.current;
    const next = new Map<string, FanSlot>();
    for (const item of fanItems) {
      const slot = fanSlotById.get(item.id) ?? previous.get(item.id);
      if (slot) next.set(item.id, slot);
    }
    lastFanSlotsRef.current = next;
  }, [fanItems, fanSlotById]);

  useEffect(() => {
    const handlePointer = (e: PointerEvent) => {
      lastPointerRef.current = {
        x: e.clientX,
        y: e.clientY,
        type: e.pointerType
      };
    };
    window.addEventListener('pointermove', handlePointer, { passive: true });
    window.addEventListener('pointerdown', handlePointer, {
      capture: true,
      passive: true
    });
    return () => {
      window.removeEventListener('pointermove', handlePointer);
      window.removeEventListener('pointerdown', handlePointer, true);
    };
  }, []);

  const handleClickPlay = useCallback(
    (cardId: string) => {
      const pointer = lastPointerRef.current;
      if (!pointer) return;
      const next = fanItems.filter((item) => item.id !== cardId);
      const target = hoverTargetAt(pointer.x, pointer.y, next, null);
      if (target !== null) handleHoverChange(target, true);
    },
    [fanItems, hoverTargetAt, handleHoverChange]
  );

  const handZoneIndexAt = (x: number, y: number): number | null => {
    const stage = fanStageRef.current;
    if (!stage) return null;
    const rect = stage.getBoundingClientRect();
    if (x < rect.left || x > rect.right) return null;
    if (
      y <
      fanHoverLineY(
        rect.bottom,
        fanGeometry.cardHeight,
        fanHoverScale,
        unhoverAnchorY
      )
    ) {
      return null;
    }
    return fanSlotIndexAt(
      fanItems.length,
      x - (rect.left + rect.width / 2),
      fanGeometry
    );
  };

  const handleHandCardDragStart = () => {
    setDragStartOrderIds(orderedHandIds);
    setPreviewHandIds(orderedHandIds);
    soundPlayedForDragRef.current = false;
  };

  const handleHandCardDragMove = (
    draggedCardId: string,
    pointX: number,
    pointY: number
  ) => {
    if (!dragStartOrderIds) {
      return;
    }

    const index = handZoneIndexAt(pointX, pointY);
    const nextPreviewOrder =
      index === null
        ? dragStartOrderIds
        : moveCardIdInOrder(
            dragStartOrderIds,
            draggedCardId,
            Math.min(index, dragStartOrderIds.length - 1)
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

  // The hand's card art overflows far above its own box, so on narrow/portrait
  // layouts it covers the player's own board row and swallows taps meant for
  // the zones underneath it (the arsenal in particular).
  const toggleHandCollapsed = useCallback(() => {
    setIsHandCollapsed((collapsed) => !collapsed);
  }, []);

  useEffect(() => {
    if (!canCollapseHand) setIsHandCollapsed(false);
  }, [canCollapseHand]);

  useEffect(() => {
    const handleWheel = (e: WheelEvent) => {
      const heldCardId = heldHandCardIdRef.current;
      if (!heldCardId) return;
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
      pendingWheelRotationRef.current = 0;
    };
  }, []);

  const handleHandCardReorder = (
    draggedCardId: string,
    pointX: number,
    pointY: number
  ) => {
    const index = handZoneIndexAt(pointX, pointY);
    if (index === null) {
      clearHandDragPreview();
      return false;
    }

    const baseOrder = dragStartOrderIds ?? orderedHandIds;
    const toIndex = Math.min(index, baseOrder.length - 1);

    setOrderedHandIds((currentOrder) => {
      const effectiveOrder =
        currentOrder.length === baseOrder.length ? currentOrder : baseOrder;
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
    dragMoveImplRef.current(cardId, info.point.x, info.point.y);
  }, []);
  const stableDragEnd = useCallback(
    (cardId: string, info: PanInfo): boolean => {
      return (
        dragEndImplRef.current(cardId, info.point.x, info.point.y) ?? false
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

  if (playerID === 3 || isReplay) {
    return <></>;
  }

  const hasHandCards = orderedHandCards.length > 0;
  const hasBanishedCards = (playableBanishedCards?.length ?? 0) > 0;
  const hasTheirBanishedCards = (playableTheirBanishedCards?.length ?? 0) > 0;
  const hasGraveyardCards = (playableGraveyardCards?.length ?? 0) > 0;

  const hasRowCards =
    hasHandCards ||
    hasBanishedCards ||
    hasTheirBanishedCards ||
    hasGraveyardCards;

  const isHandIdle = hasPriority === false;
  const dimWhenUnplayable = hasPriority === true;
  const stageBoundsStyle = gameZoneBounds
    ? { left: gameZoneBounds.left, right: gameZoneBounds.right }
    : undefined;

  const restingFanSlot: FanSlot = {
    x: 0,
    y: fanGeometry.cardHeight * FAN_REST_HIDDEN_RATIO,
    rotate: 0,
    scale: 1,
    zIndex: 200
  };
  const fanSlotFor = (id: string): FanSlot =>
    fanSlotById.get(id) ?? lastFanSlotsRef.current.get(id) ?? restingFanSlot;

  const collapseButton = canCollapseHand && hasRowCards && (
    <button
      className={classNames(styles.handCollapseButton, {
        [styles.handCollapseButtonCollapsed]: isHandCollapsed
      })}
      onPointerDown={toggleHandCollapsed}
      aria-expanded={!isHandCollapsed}
      aria-label={isHandCollapsed ? t('HAND.SHOW_HAND') : t('HAND.HIDE_HAND')}
      title={isHandCollapsed ? t('HAND.SHOW_HAND') : t('HAND.HIDE_HAND')}
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
        <polyline
          points={isHandCollapsed ? '6 15 12 9 18 15' : '6 9 12 15 18 9'}
        />
      </svg>
      {isHandCollapsed && (
        <span className={styles.handCollapseCount}>
          {orderedHandCards.length}
        </span>
      )}
    </button>
  );

  const fanHand = (
    <>
      <div
        ref={fanStageRef}
        className={classNames(styles.fanStage, {
          [styles.fanStageCollapsed]: isHandCollapsed,
          [styles.handIdle]: isHandIdle
        })}
        style={stageBoundsStyle}
        aria-hidden={isHandCollapsed}
        onContextMenu={preventContextMenu}
      >
        <AnimatePresence>
          {fanItems.map(({ id, card, zone }) =>
            zone === 'hand' ? (
              <PlayerHandCard
                card={card}
                cardId={id}
                key={`hand-${id}`}
                rotation={handCardRotations[id]}
                shuffleRevision={handShuffleRevision}
                onHandReorderDragStart={stableDragStart}
                onHandReorderDragMove={stableDragMove}
                onHandReorderDragEnd={stableDragEnd}
                onHandReorderDragCancel={stableDragCancel}
                onRotate={rotateHandCard}
                onRotationHoldStart={startHoldingHandCardForRotation}
                onRotationHoldEnd={stopHoldingHandCardForRotation}
                isFanned
                fanSlot={fanSlotFor(id)}
                isHovered={activeHoveredCardId === id}
                isLanding={
                  landingCardIds.includes(id) && activeHoveredCardId !== id
                }
                showHoverKeywords={showHoverKeywords}
                fanHoverScale={fanHoverScale}
                fanCardHeight={fanGeometry.cardHeight}
                isFanLifted={isFanLifted}
                onHoverChange={handleHoverChange}
                onFanPointerEnter={handleFanPointerEnter}
                onClickPlay={handleClickPlay}
                dimWhenUnplayable={dimWhenUnplayable}
                onDragPlayStateChange={setDragPlayState}
              />
            ) : (
              <PlayerHandCard
                card={card}
                cardId={id}
                key={id}
                isBanished={zone !== 'graveyard'}
                isGraveyard={zone === 'graveyard'}
                isFanned
                fanSlot={fanSlotFor(id)}
                isHovered={activeHoveredCardId === id}
                isLanding={
                  landingCardIds.includes(id) && activeHoveredCardId !== id
                }
                showHoverKeywords={showHoverKeywords}
                fanHoverScale={fanHoverScale}
                fanCardHeight={fanGeometry.cardHeight}
                isFanLifted={isFanLifted}
                onHoverChange={handleHoverChange}
                onFanPointerEnter={handleFanPointerEnter}
                dimWhenUnplayable={dimWhenUnplayable}
                onDragPlayStateChange={setDragPlayState}
              />
            )
          )}
        </AnimatePresence>
      </div>
      {collapseButton && (
        <div className={styles.fanCollapseDock} style={stageBoundsStyle}>
          {collapseButton}
        </div>
      )}
    </>
  );

  return (
    <>
      {createPortal(
        <MotionConfig reducedMotion="user">{fanHand}</MotionConfig>,
        document.body
      )}
    </>
  );
}

const FannedPlayerHand = React.memo(PlayerHand);

function PlayerHandForSetting() {
  return useCookieString(ENABLE_FANNED_HAND_COOKIE) === 'true' ? (
    <FannedPlayerHand />
  ) : (
    <ClassicPlayerHand />
  );
}

export default PlayerHandForSetting;

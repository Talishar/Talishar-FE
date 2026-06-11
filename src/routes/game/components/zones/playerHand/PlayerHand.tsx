import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import classNames from 'classnames';
import { shallowEqual } from 'react-redux';
import { RootState } from 'app/Store';
import { Card } from 'features/Card';
import styles from './PlayerHand.module.css';
import PlayerHandCard from '../../elements/playerHandCard/PlayerHandCard';
import { useAppDispatch, useAppSelector } from 'app/Hooks';
import useWindowDimensions from 'hooks/useWindowDimensions';
import { AnimatePresence } from 'framer-motion';
import { createPortal } from 'react-dom';
import { useNewlyDrawnCards } from 'hooks/useNewlyDrawnCards';
import useSound from 'use-sound';
import drawingCardsSound from 'sounds/drawing_cards.wav';
import { getSettingsEntity } from 'features/options/optionsSlice';

const DEFAULT_HAND_REORDER_STEP_PX = 120;

type CardWithStableId = {
  card: Card;
  id: string;
};

export default function PlayerHand() {
  const isPlayable = (card: Card) => {
    false;
  };
  const [width, height] = useWindowDimensions();

  const playerID = useAppSelector(
    (state: RootState) => state.game.gameInfo.playerID
  );
  const isReplay = useAppSelector(
    (state: RootState) => state.game.gameInfo.isReplay
  );

  const [playedCards, setPlayedCards] = useState<String[]>([]);

  let hasArsenal = true;

  const showArsenal = false;

  const settingsData = useAppSelector(getSettingsEntity);
  const isMuted = settingsData['MuteSound']?.value === '1';

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

    const result: CardWithStableId[] = cards.map((card) => {
      const ado = card.actionDataOverride ?? '';
      const isNumericAdo = ado !== '' && /^\d+$/.test(ado);

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
  const [previewHandIds, setPreviewHandIds] = useState<string[] | null>(null);
  const [dragStartOrderIds, setDragStartOrderIds] = useState<string[] | null>(
    null
  );
  const [isReorderingHand, setIsReorderingHand] = useState(false);
  const [handReorderStepPx, setHandReorderStepPx] = useState<number>(
    DEFAULT_HAND_REORDER_STEP_PX
  );
  const handRowRef = useRef<HTMLDivElement | null>(null);
  const scrollInnerRef = useRef<HTMLDivElement | null>(null);
  const soundPlayedForDragRef = useRef<boolean>(false);
  const [cardSpacingPx, setCardSpacingPx] = useState<number | null>(null);
  const [scrollOffset, setScrollOffset] = useState(0);
  const [maxScrollOffset, setMaxScrollOffset] = useState(0);
  const [gameZoneBounds, setGameZoneBounds] = useState<{ left: number; right: number } | null>(null);

  useEffect(() => {
    const gameZone = document.querySelector('.gameZone') as HTMLElement | null;
    if (!gameZone) return;

    const update = () => {
      const rect = gameZone.getBoundingClientRect();
      setGameZoneBounds({ left: rect.left, right: window.innerWidth - rect.right });
    };

    update();
    const ro = new ResizeObserver(update);
    ro.observe(gameZone);
    ro.observe(document.body);
    return () => ro.disconnect();
  }, []);
  const arsenalCards = useAppSelector(
    (state: RootState) => state.game.playerOne.Arsenal
  );
  const playableBanishedCards = useAppSelector((state: RootState) => {
    return state.game.playerOne.Banish?.filter(
      (card) => card.action != null && card.action != 0
    );
  }, shallowEqual);

  const playableTheirBanishedCards = useAppSelector((state: RootState) => {
    return state.game.playerTwo.Banish?.filter(
      (card) => card.action != null && card.action != 0
    );
  }, shallowEqual);

  const playableGraveyardCards = useAppSelector((state: RootState) => {
    return state.game.playerOne.Graveyard?.filter(
      (card) => card.action != null && card.action != 0
    );
  }, shallowEqual);

  // Detect newly drawn cards for the draw animation
  const newlyDrawnCardNumbers = useNewlyDrawnCards(handCards);

  useEffect(() => {
    setOrderedHandIds((previousOrder) => {
      const currentIds = handCardsWithStableIds.map((entry) => entry.id);
      const currentIdSet = new Set(currentIds);

      const preservedOrder = previousOrder.filter((id) => currentIdSet.has(id));
      const newIds = currentIds.filter((id) => !preservedOrder.includes(id));
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
    setIsReorderingHand(true);
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
    setIsReorderingHand(false);
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
    const cardElements = Array.from(handRow.children) as HTMLElement[];
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

    const cardElements = Array.from(handRow.children) as HTMLElement[];
    const N = cardElements.length;
    if (N <= 1) {
      setCardSpacingPx(null);
      setMaxScrollOffset(0);
      setScrollOffset(0);
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
      setScrollOffset(0);
      return;
    }

    // On desktop (landscape): compress cards using negative spacing (overlap) up to 30%
    // of card width before falling back to scrolling.
    if (!isPortrait) {
      const maxOverlapSpacing = -cardWidth * 0.30;
      const widthAtMaxOverlap = N * cardWidth + (N - 1) * maxOverlapSpacing;
      if (widthAtMaxOverlap <= containerWidth) {
        // Cards fit if we overlap — find exact spacing needed
        const fittingSpacing = (containerWidth - N * cardWidth) / (N - 1);
        setCardSpacingPx(Math.max(maxOverlapSpacing, fittingSpacing));
        setMaxScrollOffset(0);
        setScrollOffset(0);
        return;
      }
      // Even at max overlap they don't fit — use max overlap and scroll the rest
      setCardSpacingPx(maxOverlapSpacing);
      const overflowWidth = widthAtMaxOverlap;
      const newMax = Math.max(0, overflowWidth - containerWidth);
      setMaxScrollOffset(newMax);
      setScrollOffset((prev) => Math.min(prev, newMax));
      return;
    }

    // Portrait/mobile: keep a visible gap and scroll
    const minSpacing = 10;
    setCardSpacingPx(minSpacing);
    const overflowWidth = N * cardWidth + (N - 1) * minSpacing;
    const newMax = Math.max(0, overflowWidth - containerWidth);
    setMaxScrollOffset(newMax);
    setScrollOffset((prev) => Math.min(prev, newMax));
  }, [
    orderedHandCards.length,
    arsenalCards?.length,
    playableBanishedCards?.length,
    playableTheirBanishedCards?.length,
    playableGraveyardCards?.length,
    width,
    height
  ]);

  const scrollHand = useCallback(
    (direction: 'left' | 'right') => {
      const inner = scrollInnerRef.current;
      if (!inner) return;
      const amount = inner.clientWidth * 0.6;
      setScrollOffset((prev) => {
        const next =
          direction === 'right'
            ? Math.min(maxScrollOffset, prev + amount)
            : Math.max(0, prev - amount);
        return next;
      });
    },
    [maxScrollOffset]
  );

  // Mouse-wheel scrolls the hand horizontally (desktop); non-passive so we can preventDefault
  useEffect(() => {
    const el = handRowRef.current;
    if (!el || maxScrollOffset === 0) return;

    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      const delta = Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : e.deltaY;
      setScrollOffset((prev) =>
        Math.max(0, Math.min(maxScrollOffset, prev + delta))
      );
    };

    el.addEventListener('wheel', handleWheel, { passive: false });
    return () => el.removeEventListener('wheel', handleWheel);
  }, [maxScrollOffset]);

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

  const addCardToPlayedCards = (cardName: string) => {
    const newArray = playedCards;
    newArray.push(cardName);
    setPlayedCards(newArray);
  };

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
      ) return;

      let didShuffle = false;
      setOrderedHandIds((currentOrder) => {
        if (currentOrder.length <= 1) return currentOrder;
        
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
        
        didShuffle = true;
        return shuffled;
      });

      if (didShuffle && !isMuted) {
        playDrawingCardsSound();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isMuted, playDrawingCardsSound]);

  if (
    arsenalCards === undefined ||
    arsenalCards.length === 0 ||
    arsenalCards[0].cardNumber === ''
  ) {
    hasArsenal = false;
  }

  let lengthOfCards = 0;
  lengthOfCards += handCards?.length ?? 0;
  lengthOfCards += arsenalCards?.length ?? 0;
  lengthOfCards += playableBanishedCards?.length ?? 0;
  lengthOfCards += playableGraveyardCards?.length ?? 0;
  lengthOfCards += playableTheirBanishedCards?.length ?? 0;

  if (playerID === 3 || isReplay) {
    return <></>;
  }

  const cardsInHandsAlready = [...playedCards];

  const canScrollLeft = scrollOffset > 0;
  const canScrollRight = scrollOffset < maxScrollOffset;

  return (
    <>
      {createPortal(
        <>
          <div
            className={styles.handScrollContainer}
            style={gameZoneBounds ? { left: gameZoneBounds.left, right: gameZoneBounds.right } : undefined}
          >
            <button
              className={classNames(styles.scrollButton, {
                [styles.scrollButtonHidden]: !canScrollLeft
              })}
              onPointerDown={() => scrollHand('left')}
              aria-label="Scroll hand left"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
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
                transform: scrollOffset > 0 ? `translateX(-${scrollOffset}px)` : undefined
              } as React.CSSProperties
            }
            onContextMenu={(e) => e.preventDefault()}
          >
            <AnimatePresence>
              {orderedHandCards.length > 0 &&
                orderedHandCards.map(({ card, id }, ix) => {
                  const cardCount = cardsInHandsAlready.filter(
                    (value) => value === card.cardNumber
                  ).length;
                  cardsInHandsAlready.push(card.cardNumber);
                  const isNewlyDrawn = newlyDrawnCardNumbers.has(
                    card.cardNumber
                  );
                  return (
                    <PlayerHandCard
                      card={card}
                      key={`hand-${id}`}
                      addCardToPlayedCards={addCardToPlayedCards}
                      zIndex={ix + 200}
                      isNewlyDrawn={isNewlyDrawn}
                      enableLayoutAnimation={isReorderingHand}
                      onHandReorderDragStart={handleHandCardDragStart}
                      onHandReorderDragMove={(info) =>
                        handleHandCardDragMove(id, info.offset.x, info.offset.y)
                      }
                      onHandReorderDragEnd={(info) =>
                        handleHandCardReorder(id, info.offset.x, info.offset.y)
                      }
                      onHandReorderDragCancel={clearHandDragPreview}
                    />
                  );
                })}
              {hasArsenal &&
                showArsenal &&
                arsenalCards !== undefined &&
                arsenalCards.map((card, ix) => {
                  const cardCount = cardsInHandsAlready.filter(
                    (value) => value === card.cardNumber
                  ).length;
                  cardsInHandsAlready.push(card.cardNumber);
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
              {playableBanishedCards !== undefined &&
                playableBanishedCards.map((card, ix) => {
                  const cardCount = cardsInHandsAlready.filter(
                    (value) => value === card.cardNumber
                  ).length;
                  cardsInHandsAlready.push(card.cardNumber);
                  return (
                    <PlayerHandCard
                      card={card}
                      isBanished
                      key={`banished-${card.cardNumber}-${cardCount}`}
                      addCardToPlayedCards={addCardToPlayedCards}
                      zIndex={ix}
                    />
                  );
                })}
              {playableTheirBanishedCards !== undefined &&
                playableTheirBanishedCards.map((card, ix) => {
                  const cardCount = cardsInHandsAlready.filter(
                    (value) => value === card.cardNumber
                  ).length;
                  cardsInHandsAlready.push(card.cardNumber);
                  return (
                    <PlayerHandCard
                      card={card}
                      isBanished
                      key={`banished-${card.cardNumber}-${cardCount}`}
                      addCardToPlayedCards={addCardToPlayedCards}
                      zIndex={ix}
                    />
                  );
                })}
              {playableGraveyardCards !== undefined &&
                playableGraveyardCards.map((card, ix) => {
                  const cardCount = cardsInHandsAlready.filter(
                    (value) => value === card.cardNumber
                  ).length;
                  cardsInHandsAlready.push(card.cardNumber);
                  return (
                    <PlayerHandCard
                      card={card}
                      isGraveyard
                      key={`graveyard-${card.cardNumber}-${cardCount}`}
                      addCardToPlayedCards={addCardToPlayedCards}
                      zIndex={ix}
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
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
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

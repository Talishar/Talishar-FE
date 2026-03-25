import React, { useEffect, useMemo, useRef, useState } from 'react';
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

  const [playedCards, setPlayedCards] = useState<String[]>([]);

  let hasArsenal = true;

  const showArsenal = false;

  const settingsData = useAppSelector(getSettingsEntity);
  const isMuted = settingsData['MuteSound']?.value === '1';

  const [playDrawingCardsSound] = useSound(drawingCardsSound, { volume: 0.5 });

  const handCards = useAppSelector(
    (state: RootState) => state.game.playerOne.Hand
  );

  // Use a ref to maintain stable IDs across renders
  // Maps actionDataOverride → { id, cardNumber } for cross-render matching
  const cardIdMapRef = useRef<
    Map<string, { id: string; cardNumber: string }>
  >(new Map());
  const nextIdCounterRef = useRef<number>(0);

  const handCardsWithStableIds = useMemo<CardWithStableId[]>(() => {
    const cards = handCards ?? [];
    const prevMap = cardIdMapRef.current;

    const usedIds = new Set<string>();
    const result: CardWithStableId[] = new Array(cards.length);
    const unmatchedIndices: number[] = [];

    for (let i = 0; i < cards.length; i++) {
      const card = cards[i];
      const key = card.actionDataOverride;
      const existing =
        key != null && key !== '' ? prevMap.get(key) : undefined;

      if (
        existing &&
        !usedIds.has(existing.id) &&
        existing.cardNumber === card.cardNumber
      ) {
        result[i] = { card, id: existing.id };
        usedIds.add(existing.id);
      } else {
        unmatchedIndices.push(i);
      }
    }

    if (unmatchedIndices.length > 0) {
      const unusedOldByCardNumber = new Map<string, string[]>();
      for (const entry of prevMap.values()) {
        if (!usedIds.has(entry.id)) {
          const arr = unusedOldByCardNumber.get(entry.cardNumber) ?? [];
          arr.push(entry.id);
          unusedOldByCardNumber.set(entry.cardNumber, arr);
        }
      }

      for (const idx of unmatchedIndices) {
        const card = cards[idx];
        const available = unusedOldByCardNumber.get(card.cardNumber);
        if (available && available.length > 0) {
          const oldId = available.shift()!;
          result[idx] = { card, id: oldId };
          usedIds.add(oldId);
        } else {
          const newId = `hand-card-${nextIdCounterRef.current++}`;
          result[idx] = { card, id: newId };
          usedIds.add(newId);
        }
      }
    }

    // Rebuild map for next render
    const newMap = new Map<string, { id: string; cardNumber: string }>();
    for (const { card, id } of result) {
      const key = card.actionDataOverride;
      if (key != null && key !== '') {
        newMap.set(key, { id, cardNumber: card.cardNumber });
      }
    }
    cardIdMapRef.current = newMap;

    return result;
  }, [handCards]);

  const [orderedHandIds, setOrderedHandIds] = useState<string[]>([]);
  const [previewHandIds, setPreviewHandIds] = useState<string[] | null>(null);
  const [dragStartOrderIds, setDragStartOrderIds] = useState<string[] | null>(
    null
  );
  const [handReorderStepPx, setHandReorderStepPx] = useState<number>(
    DEFAULT_HAND_REORDER_STEP_PX
  );
  const handRowRef = useRef<HTMLDivElement | null>(null);
  const soundPlayedForDragRef = useRef<boolean>(false);
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

    return handCardsWithStableIds;
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

  if (playerID === 3) {
    return <></>;
  }

  const cardsInHandsAlready = [...playedCards];

  return (
    <>
      {createPortal(
        <>
          <div
            ref={handRowRef}
            className={styles.handRow}
            style={
              lengthOfCards > 5
                ? ({ '--card-count': lengthOfCards } as React.CSSProperties)
                : undefined
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
                      zIndex={-ix}
                      isNewlyDrawn={isNewlyDrawn}
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
                      zIndex={-(ix + (handCards?.length ?? 0))}
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
                      zIndex={
                        -(
                          ix +
                          (arsenalCards?.length ?? 0) +
                          (handCards?.length ?? 0)
                        )
                      }
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
                      zIndex={
                        -(
                          ix +
                          (arsenalCards?.length ?? 0) +
                          (handCards?.length ?? 0) +
                          (playableBanishedCards?.length ?? 0)
                        )
                      }
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
                      zIndex={
                        -(
                          ix +
                          (arsenalCards?.length ?? 0) +
                          (handCards?.length ?? 0) +
                          (playableBanishedCards?.length ?? 0) +
                          (playableTheirBanishedCards?.length ?? 0)
                        )
                      }
                    />
                  );
                })}
            </AnimatePresence>
          </div>
        </>,
        document.body
      )}
    </>
  );
}

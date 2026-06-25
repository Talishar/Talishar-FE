import React, { useEffect, useRef, useState } from 'react';
import { useAppDispatch, useAppSelector } from 'app/Hooks';
import { RootState } from 'app/Store';
import CardDisplay from '../../elements/cardDisplay/CardDisplay';
import styles from './ActiveLayersZone.module.css';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import ReorderLayers from './ReorderLayers';
import useShowModal from 'hooks/useShowModals';
import { submitButton } from 'features/game/GameSlice';
import { PROCESS_INPUT } from 'appConstants';
import {
  parseHtmlToReactElements,
  parseTextToElements
} from 'utils/ParseEscapedString';
import { BiTargetLock } from 'react-icons/bi';
import { MdDragHandle } from 'react-icons/md';
import Button from '../../../../../features/Button';
import { Card } from 'features/Card';

const GROUPING_THRESHOLD = 1;
const STORAGE_KEY = 'activeLayersPosition';
const MAX_Y_OFFSET = 35;
const MIN_Y_OFFSET = -25;

interface CardGroup {
  cards: Card[];
  isPlayer: boolean;
}

// Group cards that share the same cardNumber if there are more than GROUPING_THRESHOLD of them in a row
function groupConsecutiveCards(cards: Card[], playerID: number): CardGroup[] {
  const groups: CardGroup[] = [];
  for (const card of cards) {
    const isPlayer = playerID === card.controller;
    const last = groups[groups.length - 1];
    if (last && last.cards[0].cardNumber === card.cardNumber) {
      last.cards.push(card);
    } else {
      groups.push({ cards: [card], isPlayer });
    }
  }
  return groups;
}

export default function ActiveLayersZone() {
  const showModal = useShowModal();
  const prefersReducedMotion = useReducedMotion();
  const activeLayer = useAppSelector(
    (state: RootState) => state.game.activeLayers
  );
  const canPassPhase = useAppSelector(
    (state: RootState) => state.game.canPassPhase
  );
  const playerPrompt = useAppSelector(
    (state: RootState) => state.game.playerPrompt
  );

  const dispatch = useAppDispatch();
  const staticCards = activeLayer?.cardList?.filter(
    (card) => card.reorderable === false
  );
  const reorderableCards = activeLayer?.cardList?.filter(
    (card) => card.reorderable
  );

  const playerID = useAppSelector(
    (state: RootState) => state.game.gameInfo.playerID
  );

  const [yOffset, setYOffset] = useState(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? parseFloat(stored) : 0;
  });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStartY, setDragStartY] = useState(0);
  const [dragStartOffset, setDragStartOffset] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    setIsDragging(true);
    setDragStartY(e.clientY);
    setDragStartOffset(yOffset);
  };

  const handleTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
    setIsDragging(true);
    setDragStartY(e.touches[0].clientY);
    setDragStartOffset(yOffset);
  };

  useEffect(() => {
    if (!isDragging) return;

    const handleMouseMove = (e: MouseEvent) => {
      const delta = e.clientY - dragStartY;
      const deltaDvh = (delta / window.innerHeight) * 100;
      let newOffset = dragStartOffset + deltaDvh;
      newOffset = Math.max(MIN_Y_OFFSET, Math.min(MAX_Y_OFFSET, newOffset));
      setYOffset(newOffset);
    };

    const handleTouchMove = (e: TouchEvent) => {
      const delta = e.touches[0].clientY - dragStartY;
      const deltaDvh = (delta / window.innerHeight) * 100;
      let newOffset = dragStartOffset + deltaDvh;
      newOffset = Math.max(MIN_Y_OFFSET, Math.min(MAX_Y_OFFSET, newOffset));
      setYOffset(newOffset);
    };

    const handleMouseUp = () => {
      setIsDragging(false);
      localStorage.setItem(STORAGE_KEY, yOffset.toString());
    };

    const handleTouchEnd = () => {
      setIsDragging(false);
      localStorage.setItem(STORAGE_KEY, yOffset.toString());
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('touchmove', handleTouchMove, { passive: true });
    document.addEventListener('mouseup', handleMouseUp);
    document.addEventListener('touchend', handleTouchEnd);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('touchmove', handleTouchMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.removeEventListener('touchend', handleTouchEnd);
    };
  }, [isDragging, dragStartY, dragStartOffset, yOffset]);

  const handlePassTurn = () => {
    dispatch(submitButton({ button: { mode: PROCESS_INPUT.PASS } }));
  };

  const clickPromptButton = (button: Button) => {
    dispatch(submitButton({ button: button }));
  };

  const buttons = playerPrompt?.buttons?.map((button, ix) => {
    return (
      <button
        className={styles.buttonDiv}
        onClick={(e) => {
          e.preventDefault();
          clickPromptButton(button);
        }}
        key={ix.toString()}
      >
        {button.caption}
      </button>
    );
  });

  return (
    <AnimatePresence>
      {activeLayer?.active && showModal && (
        <motion.div
          ref={containerRef}
          className={styles.activeLayersBox}
          initial={
            prefersReducedMotion
              ? { opacity: 1, y: `${yOffset}dvh` }
              : { opacity: 0, y: `${yOffset}dvh` }
          }
          animate={{ opacity: 1, y: `${yOffset}dvh` }}
          exit={
            prefersReducedMotion
              ? { opacity: 0, y: `${yOffset}dvh` }
              : { opacity: 0, y: `${yOffset}dvh` }
          }
          transition={
            isDragging
              ? { type: 'tween', duration: 0 }
              : prefersReducedMotion
                ? { duration: 0.01 }
                : { type: 'tween', duration: 0.18, ease: 'easeOut' }
          }
          key="activeLayersBox"
        >
          <div className={styles.activeLayersInner}>
            <div className={styles.activeLayersTitle}>
              <div className={styles.titlesColumn}>
                <h3 className={styles.title}>
                  Active Layers
                  {activeLayer.isReorderable
                    ? ' (Drag highlighted to reorder)'
                    : null}
                </h3>
                <Target target={activeLayer.target} />
              </div>
              {canPassPhase && (
                <div className={styles.passTurnBox}>
                  <button className={styles.passTurn} onClick={handlePassTurn}>
                    Pass
                  </button>
                </div>
              )}
            </div>
            <div className={styles.activeLayersContents}>
              {staticCards &&
                groupConsecutiveCards(staticCards, playerID).map((group, groupIx) => {
                  if (group.cards.length > GROUPING_THRESHOLD) {
                    return (
                      <div key={groupIx} className={styles.groupedCardWrapper}>
                        <CardDisplay
                          card={group.cards[0]}
                          isPlayer={group.isPlayer}
                        >
                          <div className={styles.groupedCardCount}>
                            <span className={styles.groupedCardCountBadge}>
                              ×{group.cards.length}
                            </span>
                          </div>
                        </CardDisplay>
                      </div>
                    );
                  }
                  return group.cards.map((card, cardIx) => (
                    <CardDisplay
                      card={card}
                      key={`${groupIx}-${cardIx}`}
                      isPlayer={group.isPlayer}
                    />
                  ));
                })}
              <ReorderLayers cards={reorderableCards ?? []} />
            </div>
            <div className={styles.activeLayersCallToAction}>
              <div>{parseHtmlToReactElements(playerPrompt?.helpText ?? '')}</div>
              {buttons}
            </div>
          </div>
          <div
            className={`${styles.grabbyHandle} ${isDragging ? styles.grabbyHandleDragging : ''}`}
            onMouseDown={handleMouseDown}
            onTouchStart={handleTouchStart}
          >
            <MdDragHandle
              size={32}
              className={styles.gripIcon}
              aria-label="Drag to move active layers panel"
            />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

const Target = ({ target }: { target: string | undefined }) => {
  return target ? (
    <div className={styles.targetContainer}>
      <BiTargetLock />{' '}
      <span className={styles.target}>
        {parseTextToElements(target?.replace(/\|/g, ', '))}
      </span>
    </div>
  ) : null;
};

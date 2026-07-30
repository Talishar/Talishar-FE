import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useAppDispatch, useAppSelector } from 'app/Hooks';
import { RootState } from 'app/Store';
import CardDisplay from '../../elements/cardDisplay/CardDisplay';
import styles from './ActiveLayersZone.module.css';
import { motion, AnimatePresence, useReducedMotion, useMotionValue, useTransform } from 'framer-motion';
import ReorderLayers from './ReorderLayers';
import useShowModal from 'hooks/useShowModals';
import useOpponentPresencePrompt from 'hooks/useOpponentPresencePrompt';
import { submitButton } from 'features/game/GameSlice';
import { PROCESS_INPUT } from 'appConstants';
import {
  parseHtmlToReactElements,
  parseTextToElements
} from 'utils/ParseEscapedString';
import { wrapKeywordsInNodes } from '../../elements/keywordPopover';
import { BiTargetLock } from 'react-icons/bi';
import { MdDragHandle, MdOpenWith, MdHeight } from 'react-icons/md';
import Button from '../../../../../features/Button';
import { Card } from 'features/Card';

const GROUPING_THRESHOLD = 1;
const STORAGE_KEY_Y = 'activeLayersPositionY';
const STORAGE_KEY_X = 'activeLayersPositionX';
const STORAGE_KEY_X_ENABLED = 'activeLayersXDragEnabled';
const MAX_Y_OFFSET = 52;
const MIN_Y_OFFSET = -25;
const MAX_X_OFFSET = 40;
const MIN_X_OFFSET = -20;
// Matches the @media (max-width: 768px) breakpoint in ActiveLayersZone.module.css
const MOBILE_BREAKPOINT = 768;

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
  const helpText = useOpponentPresencePrompt(playerPrompt?.helpText);

  const dispatch = useAppDispatch();

  const playerID = useAppSelector(
    (state: RootState) => state.game.gameInfo.playerID
  );

  const staticCards = useMemo(
    () => activeLayer?.cardList?.filter((card: Card) => card.reorderable === false),
    [activeLayer?.cardList]
  );
  const reorderableCards = useMemo(
    () => activeLayer?.cardList?.filter((card: Card) => card.reorderable),
    [activeLayer?.cardList]
  );
  const cardGroups = useMemo(
    () => (staticCards ? groupConsecutiveCards(staticCards, playerID) : []),
    [staticCards, playerID]
  );

  const yOffsetMV = useMotionValue(
    parseFloat(localStorage.getItem(STORAGE_KEY_Y) ?? '') || 0
  );
  const yOffsetDvh = useTransform(yOffsetMV, (v) => `${v}dvh`);
  const dragStartYRef = useRef(0);
  const dragStartOffsetRef = useRef(yOffsetMV.get());

  const xOffsetMV = useMotionValue(
    parseFloat(localStorage.getItem(STORAGE_KEY_X) ?? '') || 0
  );
  const xOffsetDvw = useTransform(xOffsetMV, (v) => `${v}dvw`);
  const dragStartXRef = useRef(0);
  const dragStartOffsetXRef = useRef(xOffsetMV.get());

  const containerRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [xDragEnabled, setXDragEnabled] = useState(
    localStorage.getItem(STORAGE_KEY_X_ENABLED) !== 'false'
  );

  const toggleXDrag = () => {
    const next = !xDragEnabled;
    setXDragEnabled(next);
    localStorage.setItem(STORAGE_KEY_X_ENABLED, next.toString());
    if (!next) {
      xOffsetMV.set(0);
      localStorage.setItem(STORAGE_KEY_X, '0');
    }
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    dragStartYRef.current = e.clientY;
    dragStartOffsetRef.current = yOffsetMV.get();
    dragStartXRef.current = e.clientX;
    dragStartOffsetXRef.current = xOffsetMV.get();
    setIsDragging(true);
  };

  const handleTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
    dragStartYRef.current = e.touches[0].clientY;
    dragStartOffsetRef.current = yOffsetMV.get();
    dragStartXRef.current = e.touches[0].clientX;
    dragStartOffsetXRef.current = xOffsetMV.get();
    setIsDragging(true);
  };

  useEffect(() => {
    if (!isDragging) return;

    const handleMouseMove = (e: MouseEvent) => {
      const deltaY = e.clientY - dragStartYRef.current;
      const deltaDvh = (deltaY / window.innerHeight) * 100;
      const newOffsetY = Math.max(MIN_Y_OFFSET, Math.min(MAX_Y_OFFSET, dragStartOffsetRef.current + deltaDvh));
      yOffsetMV.set(newOffsetY); // direct DOM update - no React re-render

      if (xDragEnabled && window.innerWidth > MOBILE_BREAKPOINT) {
        const deltaX = e.clientX - dragStartXRef.current;
        const deltaDvw = (deltaX / window.innerWidth) * 100;
        const newOffsetX = Math.max(MIN_X_OFFSET, Math.min(MAX_X_OFFSET, dragStartOffsetXRef.current + deltaDvw));
        xOffsetMV.set(newOffsetX); // direct DOM update - no React re-render
      }
    };

    const handleTouchMove = (e: TouchEvent) => {
      const deltaY = e.touches[0].clientY - dragStartYRef.current;
      const deltaDvh = (deltaY / window.innerHeight) * 100;
      const newOffsetY = Math.max(MIN_Y_OFFSET, Math.min(MAX_Y_OFFSET, dragStartOffsetRef.current + deltaDvh));
      yOffsetMV.set(newOffsetY); // direct DOM update - no React re-render

      if (xDragEnabled && window.innerWidth > MOBILE_BREAKPOINT) {
        const deltaX = e.touches[0].clientX - dragStartXRef.current;
        const deltaDvw = (deltaX / window.innerWidth) * 100;
        const newOffsetX = Math.max(MIN_X_OFFSET, Math.min(MAX_X_OFFSET, dragStartOffsetXRef.current + deltaDvw));
        xOffsetMV.set(newOffsetX); // direct DOM update - no React re-render
      }
    };

    const handleMouseUp = () => {
      setIsDragging(false);
      localStorage.setItem(STORAGE_KEY_Y, yOffsetMV.get().toString());
      localStorage.setItem(STORAGE_KEY_X, xOffsetMV.get().toString());
    };

    const handleTouchEnd = () => {
      setIsDragging(false);
      localStorage.setItem(STORAGE_KEY_Y, yOffsetMV.get().toString());
      localStorage.setItem(STORAGE_KEY_X, xOffsetMV.get().toString());
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
  // dragStart*Ref and dragStartOffset*Ref are refs - excluded from deps intentionally
  }, [isDragging, yOffsetMV, xOffsetMV, xDragEnabled]);

  const handlePassTurn = () => {
    dispatch(submitButton({ button: { mode: PROCESS_INPUT.PASS } }));
  };

  const clickPromptButton = (button: Button) => {
    dispatch(submitButton({ button: button }));
  };

  const buttons = playerPrompt?.buttons?.map((button: Button, ix: number) => {
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
          style={{ y: yOffsetDvh, x: xOffsetDvw }}
          initial={prefersReducedMotion ? { opacity: 1 } : { opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={
            prefersReducedMotion
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
              {cardGroups.map((group, groupIx) => {
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
              <div>{wrapKeywordsInNodes(parseHtmlToReactElements(helpText))}</div>
              {buttons}
            </div>
          </div>
          <div
            className={`${styles.grabbyHandle} ${isDragging ? styles.grabbyHandleDragging : ''}`}
            onMouseDown={handleMouseDown}
            onTouchStart={handleTouchStart}
          >
            <button
              type="button"
              className={styles.dragModeToggle}
              onClick={toggleXDrag}
              onMouseDown={(e) => e.stopPropagation()}
              onTouchStart={(e) => e.stopPropagation()}
              title={
                xDragEnabled
                  ? 'Lock to vertical movement'
                  : 'Unlock horizontal movement'
              }
            >
              {xDragEnabled ? (
                <MdOpenWith className={styles.dragModeIcon} />
              ) : (
                <MdHeight className={styles.dragModeIcon} />
              )}
            </button>
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

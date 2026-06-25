import React, { useCallback, useRef } from 'react';
import { useAppSelector } from 'app/Hooks';
import { RootState } from 'app/Store';
import Displayrow from 'interface/Displayrow';
import CardDisplay from '../../elements/cardDisplay/CardDisplay';
import styles from './PermanentsZone.module.css';
import { Card } from 'features/Card';
import classNames from 'classnames';
import { motion, AnimatePresence } from 'framer-motion';
import { selectPermanentsAsStack } from '../../../../../features/game/GameSlice';

const PERMANENT_INITIAL = { opacity: 0, x: -100 };
const PERMANENT_ANIMATE = { opacity: 1, x: 0 };
const PERMANENT_EXIT = { opacity: 0, transition: { duration: 0.3, ease: 'easeOut' as const } };

export interface CardStack {
  card: Card;
  count: number;
  id: string;
}

export default function PermanentsZone(prop: Displayrow) {
  const { isPlayer } = prop;
  const scrollRef = useRef<HTMLDivElement>(null);
  const isDragging = useRef(false);
  const dragStartX = useRef(0);
  const dragScrollLeft = useRef(0);

  const permanents = useAppSelector((state: RootState) =>
    selectPermanentsAsStack(state, isPlayer)
  );

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    isDragging.current = true;
    dragStartX.current = e.pageX - (scrollRef.current?.offsetLeft ?? 0);
    dragScrollLeft.current = scrollRef.current?.scrollLeft ?? 0;
    if (scrollRef.current) scrollRef.current.style.cursor = 'grabbing';
  }, []);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!isDragging.current || !scrollRef.current) return;
    e.preventDefault();
    const x = e.pageX - scrollRef.current.offsetLeft;
    const walk = x - dragStartX.current;
    scrollRef.current.scrollLeft = dragScrollLeft.current - walk;
  }, []);

  const handleMouseUp = useCallback(() => {
    isDragging.current = false;
    if (scrollRef.current) scrollRef.current.style.cursor = '';
  }, []);

  if (!permanents.length) {
    return (
      <div className={styles.permanentsWrapper}>
        <div className={styles.permanentsText}>
          <div></div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.permanentsWrapper}>
      <div
        ref={scrollRef}
        className={styles.permanentsInner}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        <motion.div className={styles.permanentsZone} layout>
          <AnimatePresence>
            {permanents.map((cardStack) => {
              const cardContainerStyles = classNames(
                {
                  [styles.stacked]: cardStack.count > 1
                },
                styles.cardContainer
              );
              return (
                <motion.div
                  key={cardStack.id}
                  className={cardContainerStyles}
                  initial={PERMANENT_INITIAL}
                  animate={PERMANENT_ANIMATE}
                  exit={PERMANENT_EXIT}
                  layout
                >
                  <CardDisplay card={cardStack.card} isPlayer={isPlayer} />
                  {cardStack.count > 1 && (
                    <div
                      title={`Stack of ${cardStack.count}`}
                      className={
                        isPlayer ? styles.counter : styles.counterOpponent
                      }
                    >
                      x {cardStack.count}
                    </div>
                  )}
                </motion.div>
              );
            })}
          </AnimatePresence>
        </motion.div>
      </div>
    </div>
  );
}
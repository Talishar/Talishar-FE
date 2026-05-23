import React, { useRef } from 'react';
import { useAppSelector } from 'app/Hooks';
import { RootState } from 'app/Store';
import Displayrow from 'interface/Displayrow';
import CardDisplay from '../../elements/cardDisplay/CardDisplay';
import styles from './PermanentsZone.module.css';
import { Card } from 'features/Card';
import isEqual from 'react-fast-compare';
import classNames from 'classnames';
import { shallowEqual } from 'react-redux';
import { HiRewind, HiFastForward } from 'react-icons/hi';
import { motion, AnimatePresence } from 'framer-motion';
import { selectPermanentsAsStack } from '../../../../../features/game/GameSlice';

export interface CardStack {
  card: Card;
  count: number;
  id: string;
}

export default function PermanentsZone(prop: Displayrow) {
  const { isPlayer } = prop;
  const [scrollCount, setScrollCount] = React.useState(0);

  const permanents = useAppSelector((state: RootState) =>
    selectPermanentsAsStack(state, isPlayer)
  );

  const handleMouseDown = (e: React.MouseEvent) => {
    isDragging.current = true;
    dragStartX.current = e.pageX - (scrollRef.current?.offsetLeft ?? 0);
    dragScrollLeft.current = scrollRef.current?.scrollLeft ?? 0;
    if (scrollRef.current) scrollRef.current.style.cursor = 'grabbing';
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging.current || !scrollRef.current) return;
    e.preventDefault();
    const x = e.pageX - scrollRef.current.offsetLeft;
    const walk = x - dragStartX.current;
    scrollRef.current.scrollLeft = dragScrollLeft.current - walk;
  };

  const handleMouseUp = () => {
    isDragging.current = false;
    if (scrollRef.current) scrollRef.current.style.cursor = 'grab';
  };

  if (!permanents.length) {
    return (
      <div className={styles.permanentsWrapper}>
        <div className={styles.permanentsText}>
          <div></div>
        </div>
      </div>
    );
  }

  const cardStackArray = permanents.slice(scrollCount);

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
        <HiRewind />
      </div>
      <div className={styles.permanentsInner}>
        <motion.div className={styles.permanentsZone} layout>
          <AnimatePresence>
            {cardStackArray.map((cardStack, ix) => {
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
                  initial={{ opacity: 0, left: -100 }}
                  animate={{ opacity: 1, left: 0 }}
                  exit={{
                    opacity: 0,
                    transition: { duration: 0.3, ease: 'easeOut' }
                  }}
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
      <div
        className={classNames(styles.scrollForward, styles.scrollWidget)}
        onClick={() => {
          if (scrollCount >= permanents.length - 1) return;
          setScrollCount(scrollCount + 1);
        }}
        onTouchStart={() => {
          if (scrollCount >= permanents.length - 1) return;
          setScrollCount(scrollCount + 1);
        }}
      >
        <HiFastForward />
      </div>
    </div>
  );
}

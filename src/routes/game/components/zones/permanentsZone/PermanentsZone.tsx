import React, {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState
} from 'react';
import { flushSync } from 'react-dom';
import { useAppSelector } from 'app/Hooks';
import { RootState } from 'app/Store';
import Displayrow from 'interface/Displayrow';
import CardDisplay from '../../elements/cardDisplay/CardDisplay';
import StackCount from '../../elements/stackCount/StackCount';
import styles from './PermanentsZone.module.css';
import { Card } from 'features/Card';
import classNames from 'classnames';
import { motion, AnimatePresence } from 'framer-motion';
import { selectPermanentsAsStack } from '../../../../../features/game/GameSlice';
import { HiChevronLeft, HiChevronRight } from 'react-icons/hi';
import { useTranslation } from 'react-i18next';

const PERMANENT_INITIAL = { opacity: 0, x: -100 };
const PERMANENT_ANIMATE = { opacity: 1, x: 0 };
const PERMANENT_EXIT = {
  opacity: 0,
  transition: { duration: 0.3, ease: 'easeOut' as const }
};
const MAX_STACK_LAYERS = 3;
const FIT_TOLERANCE_PX = 0.5;

export interface CardStack {
  card: Card;
  count: number;
  id: string;
  gemStackIDs?: string[];
}

interface PermanentsZoneProps extends Displayrow {
  start?: number;
  end?: number;
  hideArrows?: boolean;
}

function PermanentsZone(prop: PermanentsZoneProps) {
  const { isPlayer, start, end, hideArrows } = prop;
  const { t } = useTranslation();
  const scrollRef = useRef<HTMLDivElement>(null);
  const isDragging = useRef(false);
  const dragStartX = useRef(0);
  const dragScrollLeft = useRef(0);
  const dragOffsetLeft = useRef(0);
  const moveListener = useRef<((e: MouseEvent) => void) | null>(null);
  const [isOverflowing, setIsOverflowing] = useState(false);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const allPermanents = useAppSelector((state: RootState) =>
    selectPermanentsAsStack(state, isPlayer)
  );
  const permanents = useMemo(
    () => allPermanents.slice(start, end),
    [allPermanents, start, end]
  );
  const isSplit = start !== undefined || end !== undefined;
  let maxSubcardCount = 1;
  for (const permanent of permanents) {
    const subcards = permanent.card.subcards;
    if (!subcards) continue;
    let subcardCount = 0;
    for (const subcard of subcards) {
      if (subcard) subcardCount++;
    }
    if (subcardCount > maxSubcardCount) maxSubcardCount = subcardCount;
  }
  const subcardOverflowStyle = {
    '--subcard-overflow': `calc(${maxSubcardCount * 0.18} * var(--card-size))`
  } as React.CSSProperties;

  const updateScrollButtons = useCallback(() => {
    const element = scrollRef.current;
    if (!element) return;

    const overflowing = element.scrollWidth > element.clientWidth + 1;
    setIsOverflowing(overflowing);
    setCanScrollLeft(overflowing && element.scrollLeft > 1);
    setCanScrollRight(
      overflowing &&
        element.scrollLeft < element.scrollWidth - element.clientWidth - 1
    );
  }, []);

  useEffect(() => {
    const element = scrollRef.current;
    if (!element) return;

    updateScrollButtons();
    const resizeObserver = new ResizeObserver(updateScrollButtons);
    resizeObserver.observe(element);
    const mutationObserver = new MutationObserver(updateScrollButtons);
    const zone = element.firstElementChild;
    if (zone) {
      resizeObserver.observe(zone);
      mutationObserver.observe(zone, { childList: true });
    }

    return () => {
      resizeObserver.disconnect();
      mutationObserver.disconnect();
    };
  }, [permanents.length, updateScrollButtons]);

  const scrollByCard = useCallback((direction: -1 | 1) => {
    const element = scrollRef.current;
    if (!element) return;

    const card = element.querySelector<HTMLElement>('[data-permanent-card]');
    const distance = card ? card.offsetWidth + 4 : element.clientWidth * 0.75;
    element.scrollBy({ left: direction * distance, behavior: 'smooth' });
  }, []);

  const detachMoveListener = useCallback(() => {
    if (moveListener.current && scrollRef.current) {
      scrollRef.current.removeEventListener('mousemove', moveListener.current);
    }
    moveListener.current = null;
  }, []);

  const handleMouseUp = useCallback(() => {
    isDragging.current = false;
    detachMoveListener();
    if (scrollRef.current) scrollRef.current.style.cursor = '';
  }, [detachMoveListener]);

  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      const element = scrollRef.current;
      if (!element) return;

      dragOffsetLeft.current = element.offsetLeft;
      dragStartX.current = e.pageX - dragOffsetLeft.current;
      dragScrollLeft.current = element.scrollLeft;
      isDragging.current = true;
      element.style.cursor = 'grabbing';

      detachMoveListener();
      const onMove = (event: MouseEvent) => {
        if (!isDragging.current) return;
        event.preventDefault();
        const walk = event.pageX - dragOffsetLeft.current - dragStartX.current;
        element.scrollLeft = dragScrollLeft.current - walk;
      };
      moveListener.current = onMove;
      element.addEventListener('mousemove', onMove);
    },
    [detachMoveListener]
  );

  useEffect(() => detachMoveListener, [detachMoveListener]);

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
      {isOverflowing && !hideArrows && (
        <button
          type="button"
          className={classNames(styles.scrollButton, styles.scrollBack)}
          aria-label={t('PERMANENTS_ZONE.SCROLL_LEFT')}
          disabled={!canScrollLeft}
          onClick={() => scrollByCard(-1)}
        >
          <HiChevronLeft aria-hidden="true" />
        </button>
      )}
      <div
        ref={scrollRef}
        className={styles.permanentsInner}
        style={subcardOverflowStyle}
        onMouseDown={handleMouseDown}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onScroll={updateScrollButtons}
      >
        <motion.div
          className={styles.permanentsZone}
          layout
          onLayoutAnimationComplete={updateScrollButtons}
        >
          <AnimatePresence mode={isSplit ? 'popLayout' : undefined}>
            {permanents.map((cardStack) => {
              const stackLayers = Math.min(
                cardStack.count - 1,
                MAX_STACK_LAYERS
              );
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
                  data-permanent-card
                  initial={PERMANENT_INITIAL}
                  animate={PERMANENT_ANIMATE}
                  exit={PERMANENT_EXIT}
                  layout
                  onAnimationComplete={updateScrollButtons}
                  onLayoutAnimationComplete={updateScrollButtons}
                  style={
                    stackLayers > 0
                      ? ({
                          '--stack-layers': stackLayers
                        } as React.CSSProperties)
                      : undefined
                  }
                >
                  {Array.from({ length: stackLayers }, (_, ix) => (
                    <div
                      key={ix}
                      aria-hidden="true"
                      className={styles.stackLayer}
                      style={
                        {
                          '--stack-depth': stackLayers - ix
                        } as React.CSSProperties
                      }
                    />
                  ))}
                  <CardDisplay
                    card={cardStack.card}
                    isPlayer={isPlayer}
                    gemStackIDs={cardStack.gemStackIDs}
                  />
                  {cardStack.count > 1 && (
                    <StackCount
                      count={cardStack.count}
                      title={`Stack of ${cardStack.count}`}
                      className={
                        isPlayer ? styles.counter : styles.counterOpponent
                      }
                    />
                  )}
                </motion.div>
              );
            })}
          </AnimatePresence>
        </motion.div>
      </div>
      {isOverflowing && !hideArrows && (
        <button
          type="button"
          className={classNames(styles.scrollButton, styles.scrollForward)}
          aria-label={t('PERMANENTS_ZONE.SCROLL_RIGHT')}
          disabled={!canScrollRight}
          onClick={() => scrollByCard(1)}
        >
          <HiChevronRight aria-hidden="true" />
        </button>
      )}
    </div>
  );
}

const MemoPermanentsZone = React.memo(PermanentsZone);

interface PermanentsRowProps extends Displayrow {
  className: string;
  restClassName?: string;
}

export function PermanentsRow(prop: PermanentsRowProps) {
  const { isPlayer, className, restClassName } = prop;
  const leftRef = useRef<HTMLDivElement>(null);
  const restRef = useRef<HTMLDivElement>(null);
  const probeRef = useRef<HTMLDivElement>(null);
  const count = useAppSelector(
    (state: RootState) => selectPermanentsAsStack(state, isPlayer).length
  );
  const [capacity, setCapacity] = useState<{
    fits: number;
    restFits: boolean;
  }>();

  useLayoutEffect(() => {
    const left = leftRef.current;
    const rest = restRef.current;
    const probe = probeRef.current;
    if (!restClassName || !left || !rest || !probe) {
      setCapacity(undefined);
      return;
    }
    const fit = () => {
      const probeStyle = getComputedStyle(probe);
      const cardWidth = parseFloat(probeStyle.width);
      const gap = parseFloat(probeStyle.columnGap) || 0;
      if (!cardWidth) {
        setCapacity(undefined);
        return;
      }
      const leftWidth = left.getBoundingClientRect().width;
      const restWidth = rest.getBoundingClientRect().width;
      const fits = Math.max(
        0,
        Math.floor((leftWidth + gap + FIT_TOLERANCE_PX) / (cardWidth + gap))
      );
      const restFits = restWidth + FIT_TOLERANCE_PX >= cardWidth;
      setCapacity((previous) =>
        previous && previous.fits === fits && previous.restFits === restFits
          ? previous
          : { fits, restFits }
      );
    };
    fit();
    const observer = new ResizeObserver(() => flushSync(fit));
    observer.observe(left);
    observer.observe(rest);
    return () => observer.disconnect();
  }, [restClassName]);

  const splitAt =
    capacity && capacity.restFits && count > capacity.fits
      ? capacity.fits
      : undefined;

  return (
    <>
      <div className={className} ref={leftRef}>
        {restClassName ? (
          <>
            <div
              ref={probeRef}
              className={styles.capacityProbe}
              aria-hidden="true"
            />
            <MemoPermanentsZone
              isPlayer={isPlayer}
              end={splitAt ?? count}
              hideArrows={splitAt !== undefined}
            />
          </>
        ) : (
          <MemoPermanentsZone isPlayer={isPlayer} />
        )}
      </div>
      {restClassName && (
        <div className={restClassName} ref={restRef}>
          <MemoPermanentsZone isPlayer={isPlayer} start={splitAt ?? count} />
        </div>
      )}
    </>
  );
}

export default MemoPermanentsZone;

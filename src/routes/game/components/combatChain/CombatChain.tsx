import React from 'react';
import { useTranslation } from 'react-i18next';
import styles from './CombatChain.module.css';
import ChainLinks from '../elements/chainLinks/ChainLinks';
import CurrentAttack from '../elements/currentAttack/CurrentAttack';
import Reactions from '../elements/reactions/Reactions';
import { useAppDispatch, useAppSelector } from '../../../../app/Hooks';
import { RootState } from 'app/Store';
import {
  motion,
  AnimatePresence,
  useMotionValue,
  useTransform
} from 'framer-motion';
import Button from '../../../../features/Button';
import { submitButton } from '../../../../features/game/GameSlice';
import { parseHtmlToReactElements } from 'utils/ParseEscapedString';
import { wrapKeywordsInNodes } from '../elements/keywordPopover';
import { MdDragHandle } from 'react-icons/md';
import useShowModal from '../../../../hooks/useShowModals';
import useOpponentPresencePrompt from '../../../../hooks/useOpponentPresencePrompt';
import { useMediaQuery } from '../../../../hooks/useMediaQuery';
import usePlayerPromptOwner from '../elements/playerPrompt/usePlayerPromptOwner';

const STORAGE_KEY = 'combatChainPosition';
const PORTRAIT_STORAGE_KEY = 'combatChainPositionPortrait';
const MAX_Y_OFFSET = 30;
const MIN_Y_OFFSET = -35;
const KEYBOARD_Y_STEP = 2;
const EDGE_MARGIN_PX = 4;

const readStoredOffset = (key: string) =>
  parseFloat(localStorage.getItem(key) ?? '') || 0;

export default function CombatChain() {
  const { t } = useTranslation();
  const oldCombatChain =
    useAppSelector((state: RootState) => state.game.oldCombatChain) ?? [];
  const activeCombatChain = useAppSelector(
    (state: RootState) => state.game.activeChainLink
  );
  const attackSubcards = useAppSelector(
    (state: RootState) => state.game.activeChainLink?.attackingCard?.subcards
  );
  const showModals = useShowModal();
  const isPortrait = useMediaQuery('(orientation: portrait)');
  const storageKey = isPortrait ? PORTRAIT_STORAGE_KEY : STORAGE_KEY;
  const storageKeyRef = React.useRef(storageKey);
  storageKeyRef.current = storageKey;
  const storedOffsetRef = React.useRef<number | null>(null);
  if (storedOffsetRef.current === null) {
    storedOffsetRef.current = readStoredOffset(storageKey);
  }
  const storedOffset = storedOffsetRef.current;
  const yOffsetMV = useMotionValue(storedOffset);
  const yOffsetDvh = useTransform(yOffsetMV, (value) => `${value}dvh`);
  const dragStartYRef = React.useRef(0);
  const dragStartOffsetRef = React.useRef(storedOffset);
  const currentDragOffsetRef = React.useRef(storedOffset);
  const pendingPointerYRef = React.useRef(0);
  const rafRef = React.useRef(0);
  const reclampRafRef = React.useRef(0);
  const dragBoundsRef = React.useRef({ min: MIN_Y_OFFSET, max: MAX_Y_OFFSET });
  const [isDragging, setIsDragging] = React.useState(false);
  const containerRef = React.useRef<HTMLDivElement>(null);
  const promptOwner = usePlayerPromptOwner();
  const visibleSubCards = attackSubcards?.some(Boolean) ? 1 : 0;

  const persistOffset = (offset: number) => {
    localStorage.setItem(storageKeyRef.current, offset.toString());
  };

  const getOffsetBounds = () => {
    const fallback = { min: MIN_Y_OFFSET, max: MAX_Y_OFFSET };
    const element = containerRef.current;
    const viewportHeight = window.innerHeight;
    if (element === null || viewportHeight === 0) return fallback;
    const rect = element.getBoundingClientRect();
    const appliedPx = (currentDragOffsetRef.current / 100) * viewportHeight;
    const minPx = EDGE_MARGIN_PX - (rect.top - appliedPx);
    const maxPx = viewportHeight - EDGE_MARGIN_PX - (rect.bottom - appliedPx);
    if (minPx > maxPx) return fallback;
    return {
      min: Math.max(MIN_Y_OFFSET, (minPx / viewportHeight) * 100),
      max: Math.min(MAX_Y_OFFSET, (maxPx / viewportHeight) * 100)
    };
  };

  const clampOffset = (offset: number, bounds: { min: number; max: number }) =>
    Math.max(bounds.min, Math.min(bounds.max, offset));

  const reclampOffset = () => {
    const clamped = clampOffset(
      currentDragOffsetRef.current,
      getOffsetBounds()
    );
    if (clamped === currentDragOffsetRef.current) return;
    currentDragOffsetRef.current = clamped;
    yOffsetMV.set(clamped);
    persistOffset(clamped);
  };

  const scheduleReclamp = () => {
    cancelAnimationFrame(reclampRafRef.current);
    reclampRafRef.current = requestAnimationFrame(reclampOffset);
  };

  const setOffsetFromClientY = (clientY: number) => {
    const delta = clientY - dragStartYRef.current;
    const deltaDvh = (delta / window.innerHeight) * 100;
    const newOffset = clampOffset(
      dragStartOffsetRef.current + deltaDvh,
      dragBoundsRef.current
    );
    currentDragOffsetRef.current = newOffset;
    yOffsetMV.set(newOffset);
  };

  const handlePointerDown = (event: React.PointerEvent<HTMLButtonElement>) => {
    event.currentTarget.setPointerCapture(event.pointerId);
    dragStartYRef.current = event.clientY;
    dragStartOffsetRef.current = currentDragOffsetRef.current;
    dragBoundsRef.current = getOffsetBounds();
    setIsDragging(true);
  };

  const handlePointerMove = (event: React.PointerEvent<HTMLButtonElement>) => {
    if (!event.currentTarget.hasPointerCapture(event.pointerId)) return;
    pendingPointerYRef.current = event.clientY;
    cancelAnimationFrame(rafRef.current);
    rafRef.current = requestAnimationFrame(() => {
      setOffsetFromClientY(pendingPointerYRef.current);
    });
  };

  const finishPointerDrag = (event: React.PointerEvent<HTMLButtonElement>) => {
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
    cancelAnimationFrame(rafRef.current);
    setOffsetFromClientY(event.clientY);
    setIsDragging(false);
    persistOffset(currentDragOffsetRef.current);
  };

  const cancelPointerDrag = (event: React.PointerEvent<HTMLButtonElement>) => {
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
    cancelAnimationFrame(rafRef.current);
    setIsDragging(false);
    persistOffset(currentDragOffsetRef.current);
  };

  const handleHandleKeyDown = (
    event: React.KeyboardEvent<HTMLButtonElement>
  ) => {
    if (event.key !== 'ArrowUp' && event.key !== 'ArrowDown') return;
    event.preventDefault();
    const direction = event.key === 'ArrowUp' ? -1 : 1;
    const nextOffset = clampOffset(
      currentDragOffsetRef.current + direction * KEYBOARD_Y_STEP,
      getOffsetBounds()
    );
    currentDragOffsetRef.current = nextOffset;
    yOffsetMV.set(nextOffset);
    persistOffset(nextOffset);
  };

  React.useEffect(
    () => () => {
      cancelAnimationFrame(rafRef.current);
      cancelAnimationFrame(reclampRafRef.current);
    },
    []
  );

  React.useEffect(() => {
    const stored = readStoredOffset(storageKey);
    currentDragOffsetRef.current = stored;
    yOffsetMV.set(stored);
    scheduleReclamp();
  }, [storageKey, yOffsetMV]);

  React.useEffect(() => {
    const handleViewportChange = () => scheduleReclamp();
    window.addEventListener('resize', handleViewportChange);
    window.addEventListener('orientationchange', handleViewportChange);
    return () => {
      window.removeEventListener('resize', handleViewportChange);
      window.removeEventListener('orientationchange', handleViewportChange);
    };
  }, []);

  const showCombatChain =
    showModals &&
    (oldCombatChain.length > 0 ||
      (activeCombatChain?.attackingCard &&
        activeCombatChain.attackingCard.cardNumber !== 'blank'));

  return (
    <AnimatePresence>
      {showCombatChain && (
        <motion.div
          ref={containerRef}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          style={{
            y: yOffsetDvh,
            ...({
              '--chain-subcard-count': visibleSubCards
            } as React.CSSProperties)
          }}
          className={`${styles.combatChain} ${''}`}
        >
          <CurrentAttack />
          <div className={styles.chainCentre}>
            <ChainLinks />
            <Reactions />
          </div>
          <button
            type="button"
            className={`${styles.grabbyHandle} ${
              isDragging ? styles.grabbyHandleDragging : ''
            }`}
            aria-label={t('COMBAT_CHAIN.DRAG_TOOLTIP')}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={finishPointerDrag}
            onPointerCancel={cancelPointerDrag}
            onKeyDown={handleHandleKeyDown}
          >
            <MdDragHandle
              size={32}
              className={styles.gripIcon}
              aria-hidden="true"
            />
          </button>
          {promptOwner === 'combatChain' && <CombatChainPlayerPrompt />}
          <div />
          <div />
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export const CombatChainPlayerPrompt = ({
  standalone = false
}: {
  standalone?: boolean;
}) => {
  const playerPrompt = useAppSelector(
    (state: RootState) => state.game.playerPrompt
  );
  const helpText = useOpponentPresencePrompt(playerPrompt?.helpText);
  const dispatch = useAppDispatch();
  const promptContent = React.useMemo(
    () => wrapKeywordsInNodes(parseHtmlToReactElements(helpText)),
    [helpText]
  );

  const buttons = playerPrompt?.buttons?.map(
    (button: Button, index: number) => (
      <button
        type="button"
        className={styles.buttonDiv}
        onClick={() => dispatch(submitButton({ button }))}
        key={`${button.mode ?? ''}-${button.buttonInput ?? ''}-${
          button.caption ?? ''
        }-${index}`}
      >
        {button.caption}
      </button>
    )
  );

  return (
    <AnimatePresence>
      <motion.div
        className={`${styles.playerPrompt} ${
          standalone ? styles.standalonePlayerPrompt : ''
        }`}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        key={`${helpText.substring(0, 10)}`}
      >
        <div className={styles.content}>
          <div>{promptContent}</div>
        </div>
        {buttons}
      </motion.div>
    </AnimatePresence>
  );
};

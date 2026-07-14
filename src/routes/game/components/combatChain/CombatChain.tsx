import React from 'react';
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
import { useMediaQuery } from '../../../../hooks/useMediaQuery';
import { parseHtmlToReactElements } from 'utils/ParseEscapedString';
import { wrapKeywordsInNodes } from '../elements/keywordPopover';
import { MdDragHandle } from 'react-icons/md';
import useShowModal from '../../../../hooks/useShowModals';

const STORAGE_KEY = 'combatChainPosition';
const MAX_Y_OFFSET = 30;
const MIN_Y_OFFSET = -35;
const KEYBOARD_Y_STEP = 2;

export default function CombatChain() {
  const oldCombatChain =
    useAppSelector((state: RootState) => state.game.oldCombatChain) ?? [];
  const activeCombatChain = useAppSelector(
    (state: RootState) => state.game.activeChainLink
  );
  const showModals = useShowModal();
  const storedOffsetRef = React.useRef<number | null>(null);
  if (storedOffsetRef.current === null) {
    storedOffsetRef.current =
      parseFloat(localStorage.getItem(STORAGE_KEY) ?? '') || 0;
  }
  const storedOffset = storedOffsetRef.current;
  const yOffsetMV = useMotionValue(storedOffset);
  const yOffsetDvh = useTransform(yOffsetMV, (value) => `${value}dvh`);
  const dragStartYRef = React.useRef(0);
  const dragStartOffsetRef = React.useRef(storedOffset);
  const currentDragOffsetRef = React.useRef(storedOffset);
  const pendingPointerYRef = React.useRef(0);
  const rafRef = React.useRef(0);
  const [isDragging, setIsDragging] = React.useState(false);
  const containerRef = React.useRef<HTMLDivElement>(null);
  const isPortrait = useMediaQuery('(orientation: portrait)');

  const setOffsetFromClientY = (clientY: number) => {
    const delta = clientY - dragStartYRef.current;
    const deltaDvh = (delta / window.innerHeight) * 100;
    const newOffset = Math.max(
      MIN_Y_OFFSET,
      Math.min(MAX_Y_OFFSET, dragStartOffsetRef.current + deltaDvh)
    );
    currentDragOffsetRef.current = newOffset;
    yOffsetMV.set(newOffset);
  };

  const handlePointerDown = (event: React.PointerEvent<HTMLButtonElement>) => {
    event.currentTarget.setPointerCapture(event.pointerId);
    dragStartYRef.current = event.clientY;
    dragStartOffsetRef.current = currentDragOffsetRef.current;
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
    localStorage.setItem(STORAGE_KEY, currentDragOffsetRef.current.toString());
  };

  const cancelPointerDrag = (event: React.PointerEvent<HTMLButtonElement>) => {
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
    cancelAnimationFrame(rafRef.current);
    setIsDragging(false);
    localStorage.setItem(STORAGE_KEY, currentDragOffsetRef.current.toString());
  };

  const handleHandleKeyDown = (
    event: React.KeyboardEvent<HTMLButtonElement>
  ) => {
    if (event.key !== 'ArrowUp' && event.key !== 'ArrowDown') return;
    event.preventDefault();
    const direction = event.key === 'ArrowUp' ? -1 : 1;
    const nextOffset = Math.max(
      MIN_Y_OFFSET,
      Math.min(
        MAX_Y_OFFSET,
        currentDragOffsetRef.current + direction * KEYBOARD_Y_STEP
      )
    );
    currentDragOffsetRef.current = nextOffset;
    yOffsetMV.set(nextOffset);
    localStorage.setItem(STORAGE_KEY, nextOffset.toString());
  };

  React.useEffect(() => () => cancelAnimationFrame(rafRef.current), []);

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
          style={{ y: yOffsetDvh }}
          className={`${styles.combatChain} ${
            ''
          }`}
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
            aria-label="Drag to move combat chain"
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
          {!isPortrait && <PlayerPrompt />}
          <div />
          <div />
        </motion.div>
      )}
    </AnimatePresence>
  );
}

const PlayerPrompt = () => {
  const playerPrompt = useAppSelector(
    (state: RootState) => state.game.playerPrompt
  );
  const dispatch = useAppDispatch();
  const promptContent = React.useMemo(
    () =>
      wrapKeywordsInNodes(
        parseHtmlToReactElements(playerPrompt?.helpText ?? '')
      ),
    [playerPrompt?.helpText]
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
        className={styles.playerPrompt}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        key={`${playerPrompt?.helpText?.substring(0, 10)}`}
      >
        <div className={styles.content}>
          <div>{promptContent}</div>
        </div>
        {buttons}
      </motion.div>
    </AnimatePresence>
  );
};

import React from 'react';
import styles from './CombatChain.module.css';
import ChainLinks from '../elements/chainLinks/ChainLinks';
import CurrentAttack from '../elements/currentAttack/CurrentAttack';
import Reactions from '../elements/reactions/Reactions';
import { useAppDispatch, useAppSelector } from '../../../../app/Hooks';
import { RootState } from 'app/Store';
import { motion, AnimatePresence, useMotionValue } from 'framer-motion';
import Button from '../../../../features/Button';
import { submitButton } from '../../../../features/game/GameSlice';
import useWindowDimensions from '../../../../hooks/useWindowDimensions';
import { parseHtmlToReactElements } from 'utils/ParseEscapedString';
import { MdDragHandle } from 'react-icons/md';
import useShowModal from '../../../../hooks/useShowModals';

const STORAGE_KEY = 'combatChainPosition';
const MAX_Y_OFFSET = 30; // dvh
const MIN_Y_OFFSET = -35; // dvh

export default function CombatChain() {
  const oldCombatChain =
    useAppSelector((state: RootState) => state.game.oldCombatChain) ?? [];
  const activeCombatChain = useAppSelector(
    (state: RootState) => state.game.activeChainLink
  );
  const showModals = useShowModal();
  const [canSkipBlock, setCanSkipBlock] = React.useState(false);
  const [canSkipBlockAndDef, setCanSkipBlockAndDef] = React.useState(false);
  const storedOffset = parseFloat(localStorage.getItem(STORAGE_KEY) ?? '') || 0;
  const yOffsetMV = useMotionValue(storedOffset);
  const dragStartYRef = React.useRef(0);
  const dragStartOffsetRef = React.useRef(storedOffset);
  const currentDragOffsetRef = React.useRef(storedOffset);
  const [isDragging, setIsDragging] = React.useState(false);
  const containerRef = React.useRef<HTMLDivElement>(null);
  const [width, height] = useWindowDimensions();
  const isPortrait = height > width;

  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    dragStartYRef.current = e.clientY;
    dragStartOffsetRef.current = currentDragOffsetRef.current;
    setIsDragging(true);
  };

  const handleTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
    dragStartYRef.current = e.touches[0].clientY;
    dragStartOffsetRef.current = currentDragOffsetRef.current;
    setIsDragging(true);
  };

  const rafRef = React.useRef<number>(0);

  React.useEffect(() => {
    if (!isDragging) return;

    const handleMouseMove = (e: MouseEvent) => {
      if (!containerRef.current) return;
      cancelAnimationFrame(rafRef.current);
      rafRef.current = requestAnimationFrame(() => {
        const delta = e.clientY - dragStartYRef.current;
        const deltaDvh = (delta / window.innerHeight) * 100;
        const newOffset = Math.max(MIN_Y_OFFSET, Math.min(MAX_Y_OFFSET, dragStartOffsetRef.current + deltaDvh));
        currentDragOffsetRef.current = newOffset;
        yOffsetMV.set(newOffset); // direct DOM update — no React re-render
      });
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (!containerRef.current) return;
      cancelAnimationFrame(rafRef.current);
      rafRef.current = requestAnimationFrame(() => {
        const delta = e.touches[0].clientY - dragStartYRef.current;
        const deltaDvh = (delta / window.innerHeight) * 100;
        const newOffset = Math.max(MIN_Y_OFFSET, Math.min(MAX_Y_OFFSET, dragStartOffsetRef.current + deltaDvh));
        currentDragOffsetRef.current = newOffset;
        yOffsetMV.set(newOffset); // direct DOM update — no React re-render
      });
    };

    const handleMouseUp = () => {
      cancelAnimationFrame(rafRef.current);
      setIsDragging(false);
      localStorage.setItem(STORAGE_KEY, currentDragOffsetRef.current.toString());
    };

    const handleTouchEnd = () => {
      cancelAnimationFrame(rafRef.current);
      setIsDragging(false);
      localStorage.setItem(STORAGE_KEY, currentDragOffsetRef.current.toString());
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('touchmove', handleTouchMove, { passive: true });
    document.addEventListener('mouseup', handleMouseUp);
    document.addEventListener('touchend', handleTouchEnd);

    return () => {
      cancelAnimationFrame(rafRef.current);
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('touchmove', handleTouchMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.removeEventListener('touchend', handleTouchEnd);
    };
  }, [isDragging, yOffsetMV]);

  const showCombatChain =
    showModals &&
    (oldCombatChain?.length > 0 ||
      (activeCombatChain?.attackingCard &&
        activeCombatChain?.attackingCard?.cardNumber !== 'blank'));
  return (
    <AnimatePresence>
      {showCombatChain && (
        <motion.div
          ref={containerRef}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          style={{ y: yOffsetMV }}
          className={`${styles.combatChain} ${!isPortrait ? styles.noBottomBorder : ''}`}
        >
          <CurrentAttack />
          <div className={styles.chainCentre}>
            <ChainLinks />
            <Reactions />
          </div>
          <div
            className={`${styles.grabbyHandle} ${
              isDragging ? styles.grabbyHandleDragging : ''
            }`}
            onMouseDown={handleMouseDown}
            onTouchStart={handleTouchStart}
          >
            <MdDragHandle
              size={32}
              className={styles.gripIcon}
              aria-label="Drag to move combat chain"
            />
          </div>
          {!isPortrait && <PlayerPrompt />}
          {canSkipBlock ? <div className={styles.icon}></div> : <div></div>}
          {canSkipBlockAndDef ? (
            <div className={styles.icon}></div>
          ) : (
            <div></div>
          )}
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

  const clickButton = (button: Button) => {
    dispatch(submitButton({ button: button }));
  };

  const buttons = playerPrompt?.buttons?.map((button, ix) => {
    return (
      <div
        className={styles.buttonDiv}
        onClick={() => {
          clickButton(button);
        }}
        key={ix.toString()}
      >
        {button.caption}
      </div>
    );
  });
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
          <div>{parseHtmlToReactElements(playerPrompt?.helpText ?? '')}</div>
        </div>
        {buttons}
      </motion.div>
    </AnimatePresence>
  );
};

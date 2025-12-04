import React from 'react';
import styles from './CombatChain.module.css';
import ChainLinks from '../elements/chainLinks/ChainLinks';
import CurrentAttack from '../elements/currentAttack/CurrentAttack';
import Reactions from '../elements/reactions/Reactions';
import { useAppDispatch, useAppSelector } from '../../../../app/Hooks';
import { RootState } from 'app/Store';
import { motion, AnimatePresence } from 'framer-motion';
import Button from '../../../../features/Button';
import { submitButton } from '../../../../features/game/GameSlice';
import useWindowDimensions from '../../../../hooks/useWindowDimensions';
import { parseHtmlToReactElements } from 'utils/ParseEscapedString';
import { MdDragHandle } from 'react-icons/md';

const STORAGE_KEY = 'combatChainPosition';
const MAX_Y_OFFSET = 30; // dvh
const MIN_Y_OFFSET = -35; // dvh

export default function CombatChain() {
  const oldCombatChain =
    useAppSelector((state: RootState) => state.game.oldCombatChain) ?? [];
  const activeCombatChain = useAppSelector(
    (state: RootState) => state.game.activeChainLink
  );
  const [canSkipBlock, setCanSkipBlock] = React.useState(false);
  const [canSkipBlockAndDef, setCanSkipBlockAndDef] = React.useState(false);
  const [yOffset, setYOffset] = React.useState(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? parseFloat(stored) : 0;
  });
  const [isDragging, setIsDragging] = React.useState(false);
  const [dragStartY, setDragStartY] = React.useState(0);
  const [dragStartOffset, setDragStartOffset] = React.useState(0);
  const containerRef = React.useRef<HTMLDivElement>(null);
  const [width, height] = useWindowDimensions();
  const isPortrait = height > width;

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

  React.useEffect(() => {
    if (!isDragging) return;

    const handleMouseMove = (e: MouseEvent) => {
      if (!containerRef.current) return;
      const delta = e.clientY - dragStartY;
      const deltaDvh = (delta / window.innerHeight) * 100;
      let newOffset = dragStartOffset + deltaDvh;

      // Constrain the position to stay on screen
      newOffset = Math.max(MIN_Y_OFFSET, Math.min(MAX_Y_OFFSET, newOffset));
      setYOffset(newOffset);
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (!containerRef.current) return;
      const delta = e.touches[0].clientY - dragStartY;
      const deltaDvh = (delta / window.innerHeight) * 100;
      let newOffset = dragStartOffset + deltaDvh;

      // Constrain the position to stay on screen
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

    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('touchmove', handleTouchMove);
      document.addEventListener('mouseup', handleMouseUp);
      document.addEventListener('touchend', handleTouchEnd);

      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('touchmove', handleTouchMove);
        document.removeEventListener('mouseup', handleMouseUp);
        document.removeEventListener('touchend', handleTouchEnd);
      };
    }
  }, [isDragging, dragStartY, dragStartOffset, yOffset]);

  const showCombatChain =
    oldCombatChain?.length > 0 ||
    (activeCombatChain?.attackingCard &&
      activeCombatChain?.attackingCard?.cardNumber !== 'blank');
  return (
    <AnimatePresence>
      {showCombatChain && (
        <motion.div
          ref={containerRef}
          initial={{ opacity: 0, y: `${yOffset}dvh` }}
          animate={{ opacity: 1, x: 0, y: `${yOffset}dvh` }}
          transition={isDragging ? { type: 'tween', duration: 0 } : { type: 'tween' }}
          exit={{ opacity: 0 }}
          className={styles.combatChain}
        >
          <CurrentAttack />
          <div className={styles.chainCentre}>
            <ChainLinks />
            <Reactions />
          </div>
          <div 
            className={`${styles.grabbyHandle} ${isDragging ? styles.grabbyHandleDragging : ''}`}
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
        initial={{ opacity: '0' }}
        animate={{ opacity: '1' }}
        exit={{ opacity: '0' }}
        key={`${playerPrompt?.helpText?.substring(0, 10)}`}
      >
        <div className={styles.content}>
          <div>
            {parseHtmlToReactElements(playerPrompt?.helpText ?? '')}
          </div>
        </div>
        {buttons}
      </motion.div>
    </AnimatePresence>
  );
};

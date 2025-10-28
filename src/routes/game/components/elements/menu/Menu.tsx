import { useState, useEffect, useRef } from 'react';
import screenfull from 'screenfull';
import { useAppDispatch } from 'app/Hooks';
import { submitButton } from 'features/game/GameSlice';
import { FaUndo } from 'react-icons/fa';
import { GiExpand } from 'react-icons/gi';
import styles from './Menu.module.css';
import { DEFAULT_SHORTCUTS, PROCESS_INPUT } from 'appConstants';
import FullControlToggle from './FullControlToggle/FullControlToggle';
import HideModalsToggle from './HideModalsToggle/HideModalsToggle';
import OptionsMenuToggle from './OptionsMenuToggle';
import ShowMobileChat from './ShowMobileChat';
import AlwaysPassToggle from './AlwaysPassToggle/AlwaysPassToggle';
import useShortcut from 'hooks/useShortcut';
import PlayerName from '../playerName/PlayerName';

function FullScreenButton() {
  function toggleFullScreen() {
    screenfull.toggle();
  }

  return (
    <div>
      <button
        className={styles.btn}
        aria-label="Full Screen"
        onClick={() => toggleFullScreen()}
        data-tooltip="Fullscreen"
        data-placement="bottom"
      >
        <GiExpand aria-hidden="true" fontSize={'2em'} />
      </button>
    </div>
  );
}

function UndoButton() {
  const dispatch = useAppDispatch();
  const undoClickCountRef = useRef(0);
  const undoTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [undoHint, setUndoHint] = useState<string>('');

  const clickUndo = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.currentTarget.blur();
    handleUndo();
  };

  const handleUndo = () => {
    // Increment click count for multi-undo tracking
    undoClickCountRef.current += 1;
    
    // Clear any existing timeout
    if (undoTimeoutRef.current) {
      clearTimeout(undoTimeoutRef.current);
    }

    // Show hint about current undo count (optional visual feedback)
    setUndoHint(undoClickCountRef.current > 1 ? `×${undoClickCountRef.current}` : '');

    // Reset the undo count after 500ms of inactivity
    // This allows rapid clicks to stack, but resets if user pauses
    undoTimeoutRef.current = setTimeout(() => {
      undoClickCountRef.current = 0;
      setUndoHint('');
    }, 500);

    // Always send undo action to backend
    dispatch(submitButton({ button: { mode: PROCESS_INPUT.UNDO } }));
  };

  useShortcut(DEFAULT_SHORTCUTS.UNDO, handleUndo);
  useShortcut(DEFAULT_SHORTCUTS.UNDOALT, handleUndo);

  return (
    <div style={{ position: 'relative' }}>
      <button
        className={styles.btn}
        aria-label="Undo"
        onClick={clickUndo}
        data-tooltip="Undo"
        data-placement="bottom"
        title="Click multiple times to undo multiple actions (up to 3 available states)"
      >
        <FaUndo aria-hidden="true" fontSize={'1.5em'} />
      </button>
      {undoHint && (
        <span
          style={{
            position: 'absolute',
            top: '-8px',
            right: '-8px',
            fontSize: '0.8em',
            fontWeight: 'bold',
            backgroundColor: '#ff6b6b',
            color: 'white',
            borderRadius: '50%',
            width: '20px',
            height: '20px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {undoHint}
        </span>
      )}
    </div>
  );
}

export default function Menu() {

  const [isMobile, setIsMobile] = useState(false);
  const [isTablet, setIsTablet] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      setIsMobile(width < 600);
      setIsTablet(width >= 600 && width < 1200);
    };
    window.addEventListener('resize', handleResize);
    handleResize();
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div>
      {isTablet && (
        <PlayerName isPlayer={false} />
      )}
      <div className={styles.menuList}>
        <UndoButton />
        <OptionsMenuToggle />
        <FullScreenButton />
      </div>
      <div className={styles.menuList}>
        <FullControlToggle />
        <AlwaysPassToggle />
        <HideModalsToggle />
        {(isMobile || isTablet) && (
          <>
            <ShowMobileChat />
          </>
        )}
      </div>
    </div>
  );
}

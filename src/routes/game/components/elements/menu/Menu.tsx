import { useState, useEffect } from 'react';
import screenfull from 'screenfull';
import { useAppDispatch } from 'app/Hooks';
import { submitButton } from 'features/game/GameSlice';
import { FaUndo } from 'react-icons/fa';
import { GiExpand } from 'react-icons/gi';
import styles from './Menu.module.css';
import { DEFAULT_SHORTCUTS, PROCESS_INPUT } from 'appConstants';
import FullControlToggle from './FullControlToggle/FullControlToggle';
import HideModalsToggle from './HideModalsToggle/HideModalsToggle';
import OptionsMenuToggle from './OptionsMenuToggle/OptionsMenuToggle';
import ShowMobileChat from './ShowMobileChat/ShowMobileChat';
import AlwaysPassToggle from './AlwaysPassToggle/AlwaysPassToggle';
import useShortcut from 'hooks/useShortcut';
import PlayerName from '../playerName/PlayerName';
import { ButtonDisableProvider, useButtonDisableContext } from 'contexts/ButtonDisableContext';

function FullScreenButton() {
  const { isDisabled, triggerDisable } = useButtonDisableContext();

  function toggleFullScreen() {
    triggerDisable();
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
        disabled={isDisabled}
      >
        <GiExpand aria-hidden="true" />
      </button>
    </div>
  );
}

function UndoButton() {
  const dispatch = useAppDispatch();
  const { isDisabled, triggerDisable } = useButtonDisableContext();

  const clickUndo = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.currentTarget.blur();
    handleUndo();
  };
  const handleUndo = () => {
    triggerDisable();
    dispatch(submitButton({ button: { mode: PROCESS_INPUT.UNDO } }));
  };
  useShortcut(DEFAULT_SHORTCUTS.UNDO, handleUndo);
  useShortcut(DEFAULT_SHORTCUTS.UNDOALT, handleUndo);
  return (
    <div>
      <button
        className={styles.btn}
        aria-label="Undo"
        onClick={clickUndo}
        data-tooltip="Undo"
        data-placement="bottom"
        disabled={isDisabled}
      >
        <FaUndo aria-hidden="true" />
      </button>
    </div>
  );
}

function MenuContent() {
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

export default function Menu() {
  return (
    <ButtonDisableProvider disableDuration={2000}>
      <MenuContent />
    </ButtonDisableProvider>
  );
}

import { useState, useEffect, useRef } from 'react';
import ReactDOM from 'react-dom';
import screenfull from 'screenfull';
import { useAppDispatch, useAppSelector } from 'app/Hooks';
import { submitButton } from 'features/game/GameSlice';
import { GiExpand } from 'react-icons/gi';
import { FaUndo, FaEllipsisH } from 'react-icons/fa';
import { MdInventory2 } from 'react-icons/md';
import styles from './Menu.module.css';
import { DEFAULT_SHORTCUTS, PROCESS_INPUT } from 'appConstants';
import HideModalsToggle from './HideModalsToggle/HideModalsToggle';
import OptionsMenuToggle from './OptionsMenuToggle/OptionsMenuToggle';
import ShowMobileChat from './ShowMobileChat/ShowMobileChat';
import FullControlToggle from './FullControlToggle/FullControlToggle';
import AlwaysPassToggle from './AlwaysPassToggle/AlwaysPassToggle';
import PlayerName from '../playerName/PlayerName';
import Inventory from '../inventory/Inventory';
import SpectatorCount from '../spectatorCount/SpectatorCount';
import useShortcut from 'hooks/useShortcut';
import {
  ButtonDisableProvider,
  useButtonDisableContext
} from 'contexts/ButtonDisableContext';
import { RootState } from 'app/Store';

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

function MobileOverflowMenu({ isSpectator }: { isSpectator: boolean }) {
  const [open, setOpen] = useState(false);
  const [panelStyle, setPanelStyle] = useState<React.CSSProperties>({});
  const btnRef = useRef<HTMLButtonElement>(null);

  const toggleFullScreen = () => {
    screenfull.toggle();
    setOpen(false);
  };

  const handleOpen = () => {
    if (!open && btnRef.current) {
      const rect = btnRef.current.getBoundingClientRect();
      setPanelStyle({
        position: 'fixed',
        top: rect.bottom + 6,
        right: window.innerWidth - rect.right,
      });
    }
    setOpen((v) => !v);
  };

  return (
    <div className={styles.overflowWrapper}>
      <button
        ref={btnRef}
        className={styles.btn}
        aria-label="More options"
        onClick={handleOpen}
      >
        <FaEllipsisH aria-hidden="true" />
      </button>
      {open && ReactDOM.createPortal(
        <>
          <div
            className={styles.overflowBackdrop}
            onClick={() => setOpen(false)}
          />
          <div className={styles.overflowPanel} style={panelStyle}>
            <div onClick={() => setOpen(false)}>
              <OptionsMenuToggle
                btnClass={styles.overflowItem}
                showLabel
              />
            </div>
            <div onClick={() => setOpen(false)}>
              <Inventory buttonClassName={styles.overflowItem} showLabel />
            </div>
            <button className={styles.overflowItem} onClick={toggleFullScreen}>
              <GiExpand aria-hidden="true" /> Fullscreen
            </button>
          </div>
        </>,
        document.body
      )}
    </div>
  );
}

function MenuContent() {
  const [isMobile, setIsMobile] = useState(false);
  const [isTablet, setIsTablet] = useState(false);
  const playerID = useAppSelector(
    (state: RootState) => state.game.gameInfo.playerID
  );
  const isSpectator = playerID === 3;

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

  // Spectator view: only show essential buttons
  if (isSpectator) {
    if (isMobile || isTablet) {
      return (
        <div>
          <div className={styles.menuRow}>
            <div className={styles.menuList}>
              <UndoButton />
              <ShowMobileChat />
              <MobileOverflowMenu isSpectator />
            </div>
          </div>
        </div>
      );
    }

    return (
      <div>
        <div className={styles.menuRow}>
          <div className={styles.spectatorFloating}>
            <SpectatorCount />
          </div>
          <div className={styles.menuList}>
            <HideModalsToggle />
            <OptionsMenuToggle />
            <FullScreenButton />
          </div>
        </div>
      </div>
    );
  }

  // Player mobile/tablet: essential buttons + overflow
  if (isMobile || isTablet) {
    return (
      <div>
        <div className={styles.menuRow}>
          <div className={styles.menuList}>
            <FullControlToggle />
            <AlwaysPassToggle />
            <UndoButton />
            <HideModalsToggle />
            <ShowMobileChat />
            <MobileOverflowMenu isSpectator={false} />
          </div>
        </div>
      </div>
    );
  }

  // Player desktop: show all buttons in one row
  return (
    <div>
      <div className={styles.menuRow}>
        <div className={styles.spectatorFloating}>
          <SpectatorCount />
        </div>
        <div className={styles.menuList}>
          <UndoButton />
          <Inventory buttonClassName={styles.btn} />
          <HideModalsToggle />
          <OptionsMenuToggle />
          <FullScreenButton />
        </div>
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

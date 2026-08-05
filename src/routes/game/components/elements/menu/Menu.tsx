import { useState, useEffect, useRef } from 'react';
import ReactDOM from 'react-dom';
import screenfull from 'screenfull';
import { useTranslation } from 'react-i18next';
import { useAppDispatch, useAppSelector } from 'app/Hooks';
import { submitButton, setSpectatorCameraView } from 'features/game/GameSlice';
import { GiExpand } from 'react-icons/gi';
import { FaUndo, FaEllipsisH, FaExchangeAlt, FaWrench } from 'react-icons/fa';
import styles from './Menu.module.css';
import { DEFAULT_SHORTCUTS, PROCESS_INPUT } from 'appConstants';
import HideModalsToggle from './HideModalsToggle/HideModalsToggle';
import OptionsMenuToggle from './OptionsMenuToggle/OptionsMenuToggle';
import ShowMobileChat from './ShowMobileChat/ShowMobileChat';
import FullControlToggle from './FullControlToggle/FullControlToggle';
import AlwaysPassToggle from './AlwaysPassToggle/AlwaysPassToggle';
import ManualTargetingToggle from './ManualTargetingToggle/ManualTargetingToggle';
import SkipReactionsToggle from '../priorityControl/SkipReactions/SkipReactionsToggle';
import SkipAllAttacksToggle from '../priorityControl/SkipAllAttacks/SkipAllAttacksToggle';
import Inventory from '../inventory/Inventory';
import SpectatorCount from '../spectatorCount/SpectatorCount';
import useShortcut from 'hooks/useShortcut';
import {
  ButtonDisableProvider,
  useButtonDisableContext
} from 'contexts/ButtonDisableContext';
import { RootState } from 'app/Store';
import { usePanelContext } from '../../leftColumn/PanelContext';
import useSetting from 'hooks/useSetting';
import { MANUAL_MODE } from 'features/options/constants';

function FullScreenButton() {
  const { t } = useTranslation();
  function toggleFullScreen() {
    screenfull.toggle();
  }

  return (
    <div>
      <button
        className={styles.btn}
        aria-label={t('MENU.FULL_SCREEN')}
        onClick={() => toggleFullScreen()}
        data-tooltip={t('MENU.FULLSCREEN')}
        data-placement="bottom"
      >
        <GiExpand aria-hidden="true" />
      </button>
    </div>
  );
}

function UndoButton() {
  const { t } = useTranslation();
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
        aria-label={t('OPTIONS_MENU.UNDO')}
        onClick={clickUndo}
        data-tooltip={t('OPTIONS_MENU.UNDO')}
        data-placement="bottom"
        disabled={isDisabled}
      >
        <FaUndo aria-hidden="true" />
      </button>
    </div>
  );
}

function CameraSwitchButton() {
  const dispatch = useAppDispatch();
  const spectatorCameraView = useAppSelector(
    (state: RootState) => state.game.spectatorCameraView
  );
  const toggleView = () => {
    const newView = spectatorCameraView === 1 ? 2 : 1;
    dispatch(setSpectatorCameraView(newView));
  };
  return (
    <button
      className={styles.btn}
      onClick={toggleView}
      aria-label={`Switch to Player ${spectatorCameraView === 1 ? 2 : 1} View`}
      data-tooltip={`Switch to P${spectatorCameraView === 1 ? 2 : 1} View`}
      data-placement="bottom"
    >
      <FaExchangeAlt aria-hidden="true" />
    </button>
  );
}

function MobileOverflowMenu({ isSpectator }: { isSpectator: boolean }) {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const [panelStyle, setPanelStyle] = useState<React.CSSProperties>({});
  const btnRef = useRef<HTMLButtonElement>(null);
  const { setIsManualModeOpen, isManualModeOpen } = usePanelContext();
  const isManualMode = useSetting({ settingName: MANUAL_MODE })?.value === '1';
  const isLocalEnvironment =
    import.meta.env.MODE === 'development' ||
    window.location.hostname === 'localhost';
  const isPracticeDummy = useAppSelector(
    (state: RootState) => state.game.playerTwo.Name === 'Practice Dummy'
  );
  const showManualMode =
    !isSpectator && (isLocalEnvironment || isManualMode || isPracticeDummy);

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
        right: window.innerWidth - rect.right
      });
    }
    setOpen((v) => !v);
  };

  const handleManualMode = () => {
    setIsManualModeOpen(!isManualModeOpen);
    setOpen(false);
  };

  return (
    <div className={styles.overflowWrapper}>
      <button
        ref={btnRef}
        className={styles.btn}
        aria-label={t('MENU.MORE_OPTIONS')}
        onClick={handleOpen}
      >
        <FaEllipsisH aria-hidden="true" />
      </button>
      {open &&
        ReactDOM.createPortal(
          <>
            <div
              className={styles.overflowBackdrop}
              onClick={() => setOpen(false)}
            />
            <div className={styles.overflowPanel} style={panelStyle}>
              <div onClick={() => setOpen(false)}>
                <OptionsMenuToggle btnClass={styles.overflowItem} showLabel />
              </div>
              {!isSpectator && (
                <Inventory buttonClassName={styles.overflowItem} showLabel />
              )}
              {showManualMode && (
                <button
                  className={styles.overflowItem}
                  onClick={handleManualMode}
                >
                  <FaWrench aria-hidden="true" /> {t('MENU.MANUAL_MODE')}
                </button>
              )}
              <button
                className={styles.overflowItem}
                onClick={toggleFullScreen}
              >
                <GiExpand aria-hidden="true" /> {t('MENU.FULLSCREEN')}
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
  const isReplay = useAppSelector(
    (state: RootState) => state.game.gameInfo.isReplay
  );
  const isSpectator = playerID === 3;

  useEffect(() => {
    let rafId = 0;
    const handleResize = () => {
      cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(() => {
        const width = window.innerWidth;
        setIsMobile(width < 600);
        setIsTablet(width >= 600 && width < 1200);
      });
    };
    window.addEventListener('resize', handleResize, { passive: true });
    handleResize();
    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  // Replay controls are provided by the replay panel and Advance replay button.
  // Normal game controls (including undo) must not alter replay state.
  if (isReplay) return null;

  // Spectator view: only show essential buttons
  if (isSpectator) {
    if (isMobile || isTablet) {
      return (
        <div>
          <div className={styles.menuRow}>
            <div className={styles.menuList}>
              <CameraSwitchButton />
              <ShowMobileChat />
              <MobileOverflowMenu isSpectator />
              <SpectatorCount compact />
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
            <SkipReactionsToggle
              btnClass={styles.btn}
              activeBtnClass={styles.buttonActive}
              placement="bottom"
            />
            <ManualTargetingToggle
              btnClass={styles.btn}
              activeBtnClass={styles.buttonActive}
              placement="bottom"
            />
            <UndoButton />
            <HideModalsToggle />
            <ShowMobileChat />
            <MobileOverflowMenu isSpectator={false} />
            <SpectatorCount compact />
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
    <ButtonDisableProvider disableDuration={1000}>
      <MenuContent />
    </ButtonDisableProvider>
  );
}

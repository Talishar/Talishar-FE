import React from 'react';
import screenfull from 'screenfull';
import { useAppDispatch, useAppSelector } from 'app/Hooks';
import {
  openOptionsMenu,
  closeOptionsMenu,
  submitButton
} from 'features/game/GameSlice';
import { FaUndo } from 'react-icons/fa';
import { GiExpand, GiHamburgerMenu } from 'react-icons/gi';
import styles from './Menu.module.css';
import { DEFAULT_SHORTCUTS, PROCESS_INPUT } from 'appConstants';
import { RootState } from 'app/Store';
import useShortcut from 'hooks/useShortcut';
import FullControlButton from './fullControlButton';

function MenuButton() {
  const optionsMenu = useAppSelector(
    (state: RootState) => state.game.optionsMenu
  );
  const dispatch = useAppDispatch();
  const toggleMenu = () => {
    if (optionsMenu?.active) return dispatch(closeOptionsMenu());
    return dispatch(openOptionsMenu());
  };

  useShortcut(DEFAULT_SHORTCUTS.TOGGLE_OPTIONS_MENU, toggleMenu);

  return (
    <div>
      <button
        className={styles.btn}
        aria-label="Toggle main menu"
        title="Options Menu"
        onClick={() => toggleMenu()}
        data-tooltip="Options Menu"
        data-placement="bottom"
      >
        <GiHamburgerMenu aria-hidden="true" fontSize={'1.5em'} />
      </button>
    </div>
  );
}

function FullScreenButton() {
  function toggleFullScreen() {
    screenfull.toggle();
  }

  return (
    <div>
      <button
        className={styles.btn}
        aria-label="Full Screen"
        title="Full Screen"
        onClick={() => toggleFullScreen()}
        data-tooltip="Fullscreen"
        data-placement="bottom"
      >
        <GiExpand aria-hidden="true" fontSize={'1.5em'} />
      </button>
    </div>
  );
}

function UndoButton() {
  const dispatch = useAppDispatch();
  const clickUndo = () => {
    dispatch(submitButton({ button: { mode: PROCESS_INPUT.UNDO } }));
  };
  return (
    <div>
      <button
        className={styles.btn}
        aria-label="Undo"
        onClick={clickUndo}
        title="Undo"
        data-tooltip="Undo"
        data-placement="bottom"
      >
        <FaUndo aria-hidden="true" fontSize={'1.5em'} />
      </button>
    </div>
  );
}

export default function Menu() {
  return (
    <div>
      <div className={styles.menuList}>
        <UndoButton />
        <MenuButton />
        <FullScreenButton />
      </div>
      <div className={styles.menuList}>
        <FullControlButton />
      </div>
    </div>
  );
}

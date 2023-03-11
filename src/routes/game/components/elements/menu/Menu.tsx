import React from 'react';
import screenfull from 'screenfull';
import { useAppDispatch } from 'app/Hooks';
import { submitButton } from 'features/game/GameSlice';
import { FaUndo } from 'react-icons/fa';
import { GiExpand } from 'react-icons/gi';
import styles from './Menu.module.css';
import { PROCESS_INPUT } from 'appConstants';
import FullControlToggle from './FullControlToggle';
import HideModalsToggle from './HideModalsToggle/HideModalsToggle';
import OptionsMenuToggle from './OptionsMenuToggle';

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
        <GiExpand aria-hidden="true" fontSize={'2em'} />
      </button>
    </div>
  );
}

function UndoButton() {
  const dispatch = useAppDispatch();
  const clickUndo = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.currentTarget.blur();
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
        <OptionsMenuToggle />
        <FullScreenButton />
      </div>
      <div className={styles.menuList}>
        <FullControlToggle />
        <HideModalsToggle />
      </div>
    </div>
  );
}

import React from 'react';
import screenfull from 'screenfull';
import { useAppDispatch } from '../../../app/Hooks';
import {
  openOptionsMenu,
  submitButton
} from '../../../features/game/GameSlice';
import { FaBars, FaUndo } from 'react-icons/fa';
import { HiOutlineArrowsExpand } from 'react-icons/hi';
import styles from './Menu.module.css';

function MenuButton() {
  const dispatch = useAppDispatch();
  const toggleMenu = () => {
    dispatch(openOptionsMenu());
  };

  return (
    <div>
      <button
        className={styles.btn}
        aria-label="Open main menu"
        title="options menu"
        onClick={() => toggleMenu()}
      >
        <FaBars aria-hidden="true" />
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
        onClick={() => toggleFullScreen()}
      >
        <HiOutlineArrowsExpand aria-hidden="true" />
      </button>
    </div>
  );
}

function UndoButton() {
  const dispatch = useAppDispatch();
  const clickUndo = () => {
    dispatch(submitButton({ button: { mode: 10000 } }));
  };
  return (
    <div>
      <button className={styles.btn} aria-label="Undo" onClick={clickUndo}>
        <FaUndo aria-hidden="true" />
      </button>
    </div>
  );
}

export default function Menu() {
  return (
    <div className={styles.menuList}>
      <UndoButton />
      <MenuButton />
      <FullScreenButton />
    </div>
  );
}

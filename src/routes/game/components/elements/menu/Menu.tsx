import React from 'react';
import screenfull from 'screenfull';
import { useAppDispatch, useAppSelector } from 'app/Hooks';
import { openOptionsMenu, closeOptionsMenu, submitButton } from 'features/game/GameSlice';
import { FaUndo } from 'react-icons/fa';
import { GiExpand, GiHamburgerMenu } from 'react-icons/gi';
import styles from './Menu.module.css';
import { PROCESS_INPUT } from 'constants';
import { RootState } from 'app/Store';

function MenuButton() {
  const optionsMenu = useAppSelector(
    (state: RootState) => state.game.optionsMenu
  );
  const dispatch = useAppDispatch();
  const toggleMenu = () => {
    if (optionsMenu?.active) return dispatch(closeOptionsMenu());
    return dispatch(openOptionsMenu());
  };

  return (
    <div>
      <button
        className={styles.btn}
        aria-label="Open main menu"
        title="options menu"
        onClick={() => toggleMenu()}
      >
        <GiHamburgerMenu aria-hidden="true" fontSize={'1.5rem'} />
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
        <GiExpand aria-hidden="true" fontSize={'1.5rem'} />
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
      <button className={styles.btn} aria-label="Undo" onClick={clickUndo}>
        <FaUndo aria-hidden="true" fontSize={'1.5rem'} />
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

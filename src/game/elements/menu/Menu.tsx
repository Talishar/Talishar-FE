import React from 'react';
import { useDispatch } from 'react-redux';
import screenfull from 'screenfull';
import { useAppDispatch } from '../../../app/Hooks';
import { submitButton } from '../../../features/game/GameSlice';
import styles from './Menu.module.css';

function MenuButton() {
  function toggleMenu() {
    // TODO: Implement menu
    console.log('opening menu');
  }
  return (
    <div>
      <button
        className={styles.btn}
        aria-label="Skip to main navigation"
        onClick={() => toggleMenu()}
      >
        <i className="fa fa-bars" aria-hidden="true" />
      </button>
    </div>
  );
}

function FullScreenButton() {
  function toggleFullScreen() {
    if (screenfull.isEnabled) {
      screenfull.request();
    }
  }

  return (
    <div>
      <button
        className={styles.btn}
        aria-label="Skip to main navigation"
        onClick={() => toggleFullScreen()}
      >
        <i className="fa fa-arrows-alt" aria-hidden="true" />
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
      <button
        className={styles.btn}
        aria-label="Skip to main navigation"
        onClick={clickUndo}
      >
        <i className="fa fa-undo" aria-hidden="true" />
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

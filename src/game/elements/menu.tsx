import React from 'react';
import { Card } from '../../features/cardSlice';
import styles from './menu.module.css';
import screenfull from 'screenfull';

function MenuButton() {
  function toggleMenu() {
    console.log('opening menu');
  }
  return (
    <div>
      <button
        className={styles.btn}
        aria-label="Skip to main navigation"
        onClick={() => toggleMenu()}
      >
        <i className="fa fa-bars" aria-hidden="true"></i>
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
        <i className="fa fa-arrows-alt" aria-hidden="true"></i>
      </button>
    </div>
  );
}

export function Menu() {
  return (
    <div className={styles.menuList}>
      <MenuButton />
      <FullScreenButton />
    </div>
  );
}

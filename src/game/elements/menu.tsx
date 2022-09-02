import React from 'react';
import screenfull from 'screenfull';
import styles from './Menu.module.css';

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

export default function Menu() {
  return (
    <div className={styles.menuList}>
      <MenuButton />
      <FullScreenButton />
    </div>
  );
}

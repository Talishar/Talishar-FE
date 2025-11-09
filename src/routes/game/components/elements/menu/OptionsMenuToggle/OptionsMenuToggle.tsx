import React from 'react';
import styles from '../Menu.module.css';
import { useAppDispatch, useAppSelector } from 'app/Hooks';
import { RootState } from 'app/Store';
import {
  openOptionsMenu,
  closeOptionsMenu,
  enableModals
} from 'features/game/GameSlice';
import { DEFAULT_SHORTCUTS } from 'appConstants';
import useShortcut from 'hooks/useShortcut';
import { GiHamburgerMenu } from 'react-icons/gi';

function OptionsMenuToggle() {
  const optionsMenu = useAppSelector(
    (state: RootState) => state.game.optionsMenu
  );
  const dispatch = useAppDispatch();
  const toggleMenu = () => {
    dispatch(enableModals());
    if (optionsMenu?.active) return dispatch(closeOptionsMenu());
    return dispatch(openOptionsMenu());
  };

  useShortcut(DEFAULT_SHORTCUTS.TOGGLE_OPTIONS_MENU, toggleMenu);

  return (
    <div>
      <button
        className={styles.btn}
        aria-label="Toggle main menu"
        onClick={() => toggleMenu()}
        data-tooltip="Settings Menu"
        data-placement="bottom"
      >
        <GiHamburgerMenu aria-hidden="true" />
      </button>
    </div>
  );
}

export default OptionsMenuToggle;

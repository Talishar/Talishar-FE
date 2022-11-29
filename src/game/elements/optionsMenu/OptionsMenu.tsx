import React from 'react';
import { useAppSelector } from '../../../app/Hooks';
import { RootState } from '../../../app/Store';
import styles from './OptionsMenu.module.css';

export default function OptionsOverlay() {
  const optionsMenu = useAppSelector(
    (state: RootState) => state.game.optionsMenu
  );

  if (
    optionsMenu === undefined ||
    optionsMenu.active === undefined ||
    optionsMenu.active == false
  ) {
    return null;
  }

  const closeOptions = () => {
    console.log('closing options');
  };

  return (
    <div className={styles.optionsContainer}>
      <div className={styles.optionsTitleContainer}>
        <div className={styles.optionsTitle}>
          <h3 className={styles.title}>Options</h3>
          (priority settings can be adjusted here)
        </div>
        <div className={styles.optionsMenuCloseIcon} onClick={closeOptions}>
          <div>
            <h3 className={styles.title}>
              <i className="fa fa-times" aria-hidden="true"></i>
            </h3>
          </div>
        </div>
      </div>
    </div>
  );
}

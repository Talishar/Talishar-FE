import React from 'react';
import styles from './PriorityControl.module.css';
import SkipReactionsToggle from './SkipReactions/SkipReactionsToggle';
import SkipAllAttacksToggle from './SkipAllAttacks/SkipAllAttacksToggle';
import FullControlToggle from '../menu/FullControlToggle/FullControlToggle';
import AlwaysPassToggle from '../menu/AlwaysPassToggle/AlwaysPassToggle';
import ManualTargetingToggle from '../menu/ManualTargetingToggle/ManualTargetingToggle';
import { ButtonDisableProvider } from 'contexts/ButtonDisableContext';

export default function PriorityControl() {
  return (
    <ButtonDisableProvider disableDuration={1000}>
      <div>
        <div className={styles.menuList}>
          <FullControlToggle btnClass={styles.btn} activeBtnClass={styles.buttonActive} />
          <AlwaysPassToggle btnClass={styles.btn} activeBtnClass={styles.buttonActive} />
          <SkipReactionsToggle />
          <SkipAllAttacksToggle />
          <ManualTargetingToggle
            btnClass={styles.btn}
            activeBtnClass={styles.buttonActive}
            placement="top-end"
          />
        </div>
      </div>
    </ButtonDisableProvider>
  );
}

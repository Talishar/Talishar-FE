import React from 'react';
import styles from './PriorityControl.module.css';
import SkipAttackReactionsToggle from './SkipAttackReactions/SkipAttackReactionsToggle';
import SkipDefenseReactionsToggle from './SkipDefenseReactions/SkipDefenseReactionsToggle';
import SkipAllAttacksToggle from './SkipAllAttacks/SkipAllAttacksToggle';
import FullControlToggle from '../menu/FullControlToggle/FullControlToggle';
import AlwaysPassToggle from '../menu/AlwaysPassToggle/AlwaysPassToggle';
import { ButtonDisableProvider } from 'contexts/ButtonDisableContext';

export default function PriorityControl() {
  return (
    <ButtonDisableProvider disableDuration={1000}>
      <div>
        <div className={styles.menuList}>
          <FullControlToggle btnClass={styles.btn} activeBtnClass={styles.buttonActive} />
          <AlwaysPassToggle btnClass={styles.btn} activeBtnClass={styles.buttonActive} />
          <SkipAttackReactionsToggle />
          <SkipDefenseReactionsToggle />
          <SkipAllAttacksToggle />
        </div>
      </div>
    </ButtonDisableProvider>
  );
}

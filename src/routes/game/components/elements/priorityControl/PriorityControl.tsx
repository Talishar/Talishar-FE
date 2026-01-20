import React from 'react';
import styles from './PriorityControl.module.css';
import SkipAttackReactionsToggle from './SkipAttackReactions/SkipAttackReactionsToggle';
import SkipDefenseReactionsToggle from './SkipDefenseReactions/SkipDefenseReactionsToggle';
import SkipAllAttacksToggle from './SkipAllAttacks/SkipAllAttacksToggle';
import Inventory from '../inventory/Inventory';
import { ButtonDisableProvider } from 'contexts/ButtonDisableContext';

export default function Menu() {
  return (
    <ButtonDisableProvider disableDuration={1100}>
      <div>
        <div className={styles.menuList}>
          <SkipAttackReactionsToggle />
          <SkipDefenseReactionsToggle />
          {/* <Skip1PowerAttacksToggle /> */} <SkipAllAttacksToggle />
          <Inventory />
        </div>
      </div>
    </ButtonDisableProvider>
  );
}

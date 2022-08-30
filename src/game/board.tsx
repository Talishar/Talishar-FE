import React from 'react';
import { PlayerBoard } from './playerboard';
import { OpponentBoard } from './opponentboard';
import { CombatChain } from './combatchain';
import styles from './board.module.css';

export interface playAreaDimensions {
  dimension: number;
}

export function Board() {
  return (
    <div className={styles.gameBoard}>
      <OpponentBoard />
      <CombatChain />
      <PlayerBoard />
    </div>
  );
}

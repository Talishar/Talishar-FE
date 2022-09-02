import React from 'react';
import PlayerBoard from './PlayerBoard';
import OpponentBoard from './OpponentBoard';
import CombatChain from './CombatChain';
import styles from './Board.module.css';

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

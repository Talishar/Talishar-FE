import React from 'react';
import PlayerBoard from './Playerboard';
import OpponentBoard from './Opponentboard';
import CombatChain from './Combatchain';
import styles from './Board.module.css';
import CardListZone from './zones/CardListZone';

export interface playAreaDimensions {
  dimension: number;
}

export function Board() {
  return (
    <div className={styles.gameBoard}>
      <OpponentBoard />
      <CombatChain />
      <PlayerBoard />
      <CardListZone />
    </div>
  );
}

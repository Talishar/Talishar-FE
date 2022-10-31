import React from 'react';
import PlayerBoard from '../playerBoard/PlayerBoard';
import OpponentBoard from '../opponentBoard/OpponentBoard';
import CombatChain from '../combatChain/Combatchain';
import styles from './Board.module.css';
import CardListZone from '../zones/cardListZone/CardListZone';
import ActiveLayersZone from '../zones/activeLayersZone/ActiveLayersZone';

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
      <ActiveLayersZone />
    </div>
  );
}

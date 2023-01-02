import React from 'react';
import PlayerBoard from '../playerBoard/PlayerBoard';
import OpponentBoard from '../opponentBoard/OpponentBoard';
import CombatChain from '../combatChain/CombatChain';
import styles from './Board.module.css';
import CardListZone from '../zones/cardListZone/CardListZone';
import ActiveLayersZone from '../zones/activeLayersZone/ActiveLayersZone';
import PlayerInputPopUp from '../elements/playerInputPopUp/PlayerInputPopUp';
import PlayerPrompt from '../elements/playerPrompt/PlayerPrompt';
import ChainLinkSummaryContainer from '../elements/chainLinkSummary/ChainLinkSummary';

export interface playAreaDimensions {
  dimension: number;
}

export function Board() {
  return (
    <div className={styles.gameBoard}>
      <OpponentBoard />
      <CombatChain />
      <PlayerPrompt />
      <PlayerBoard />
      <CardListZone />
      <ChainLinkSummaryContainer />
      <ActiveLayersZone />
      <PlayerInputPopUp />
    </div>
  );
}

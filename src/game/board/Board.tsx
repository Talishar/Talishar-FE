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
import PlayerBoardGrid from '../playerBoardGrid/PlayerBoardGrid';
import OpponentBoardGrid from '../opponentBoardGrid/OpponentBoardGrid';

export interface playAreaDimensions {
  dimension: number;
}

export function Board() {
  return (
    <div className={styles.gameBoard}>
      <OpponentBoardGrid />
      <CombatChain />
      <PlayerPrompt />
      <PlayerBoardGrid />
      <CardListZone />
      <ChainLinkSummaryContainer />
      <ActiveLayersZone />
    </div>
  );
}

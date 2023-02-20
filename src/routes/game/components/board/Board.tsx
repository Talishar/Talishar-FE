import React from 'react';
import CombatChain from '../combatChain/CombatChain';
import styles from './Board.module.css';
import CardListZone from '../zones/cardListZone/CardListZone';
import ActiveLayersZone from '../zones/activeLayersZone/ActiveLayersZone';
import PlayerPrompt from '../elements/playerPrompt/PlayerPrompt';
import ChainLinkSummaryContainer from '../elements/chainLinkSummary/ChainLinkSummary';
import PlayerBoardGrid from '../playerBoardGrid/PlayerBoardGrid';
import OpponentBoardGrid from '../opponentBoardGrid/OpponentBoardGrid';
import GridBoard from './../gridBoard';

export interface playAreaDimensions {
  dimension: number;
}

export function Board() {
  const optionA = false;
  if (optionA) {
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
  return <GridBoard />;
}

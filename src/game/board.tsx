import React from 'react';
import { PlayerBoard } from './playerboard';
import { OpponentBoard } from './opponentboard';
import { CombatChain } from './combatchain';

export interface playAreaDimensions {
  dimension: number;
}

export function Board(dimension: playAreaDimensions) {
  return (
    <div
      className="GameBoard"
      style={{ height: dimension.dimension, width: dimension.dimension }}
    >
      <OpponentBoard />
      <CombatChain />
      <PlayerBoard />
    </div>
  );
}

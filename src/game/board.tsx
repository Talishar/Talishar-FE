import React from 'react';
import { PlayerBoard } from './playerboard';
import { OpponentBoard } from './opponentboard';
import { CombatChain } from './combatchain';

export function Board() {
  return (
    <div className="GameBoard">
      <OpponentBoard />
      <CombatChain />
      <PlayerBoard />
    </div>
  );
}

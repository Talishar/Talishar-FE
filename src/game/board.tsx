import React from 'react';
import { PlayerBoard } from './playerboard';
import { OpponentBoard } from './opponentboard';

export function Board() {
  return (
    <div className="GameBoard">
      <OpponentBoard />
      <PlayerBoard />
    </div>
  );
}

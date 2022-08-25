import React from 'react';
import { TopRow } from './toprow';
import { MiddleRow } from './middlerow';
import { BottomRow } from './bottomrow';
import { Player } from '../interface/player';

export function OpponentBoard() {
  return (
    <div className="OpponentPlaymat">
      {/* Customise the playmat here */}
      <div className="PlayerBoard">
        <BottomRow isPlayer={false} />
        <MiddleRow isPlayer={false} />
        <TopRow isPlayer={false} />
      </div>
    </div>
  );
}

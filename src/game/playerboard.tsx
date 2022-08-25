import React from 'react';
import { TopRow } from './toprow';
import { MiddleRow } from './middlerow';
import { BottomRow } from './bottomrow';

export function PlayerBoard() {
  return (
    <div className="PlayerPlaymat">
      {/* Customise the playmat here */}
      <div className="PlayerBoard">
        <TopRow isPlayer={true} />
        <MiddleRow isPlayer={true} />
        <BottomRow isPlayer={true} />
      </div>
    </div>
  );
}

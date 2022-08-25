import React from 'react';
import { TopRow } from './toprow';
import { MiddleRow } from './middlerow';
import { BottomRow } from './bottomrow';

export function PlayerBoard() {
  const height = (window.innerHeight / 8) * 3;
  return (
    <div className="PlayerPlaymat" style={{ height: height }}>
      {/* Customise the playmat here */}
      <div className="PlayerBoard">
        <TopRow isPlayer={true} />
        <MiddleRow isPlayer={true} />
        <BottomRow isPlayer={true} />
      </div>
    </div>
  );
}

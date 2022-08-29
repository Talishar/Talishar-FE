import React from 'react';
import { TopRow } from './toprow';
import { MiddleRow } from './middlerow';
import { BottomRow } from './bottomrow';

export function OpponentBoard() {
  const height = (window.innerHeight / 8) * 3;
  return (
    <div className="OpponentPlaymat" style={{ height: height }}>
      {/* Customise the playmat here */}
      <div className="PlayerBoard">
        <BottomRow isPlayer={false} />
        <MiddleRow isPlayer={false} />
        <TopRow isPlayer={false} />
      </div>
    </div>
  );
}

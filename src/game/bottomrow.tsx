import React from 'react';
import { Player } from '../interface/player';

export function BottomRow(props: Player) {
  return (
    <>
      <div className="feetZone bottomRow">Feet</div>
      <div className="beforeArsenal bottomRow"></div>
      <div className="arsenalZone bottomRow">Arsenal</div>
      <div className="afterArsenal bottomRow"></div>
      <div className="banishedZone bottomRow">Banished Zone</div>
    </>
  );
}

import React from 'react';
import { Player } from '../interface/player';

export function BottomRow(props: Player) {
  const displayRow = props.isPlayer ? 'bottomRow' : 'topRow';
  return (
    <>
      <div className={'feetZone ' + displayRow}>Feet</div>
      <div className={'beforeArsenal ' + displayRow}></div>
      <div className={'arsenalZone ' + displayRow}>Arsenal</div>
      <div className={'afterArsenal ' + displayRow}></div>
      <div className={'banishedZone ' + displayRow}>Banished Zone</div>
    </>
  );
}

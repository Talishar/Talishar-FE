import React from 'react';
import { Player } from '../interface/player';

export function TopRow(props: Player) {
  const displayRow = props.isPlayer ? 'topRow' : 'bottomRow';

  return (
    <>
      <div className={'hatZone ' + displayRow}>Hat</div>
      <div className={'permanentZone ' + displayRow}>Permanents</div>
      <div className={'graveyardZone ' + displayRow}>Graveyard</div>
    </>
  );
}

import React from 'react';
import { Player } from '../interface/player';

export function TopRow(props: Player) {
  return (
    <>
      <div className="hatZone topRow">Hat</div>
      <div className="permanentZone topRow">Permanents</div>
      <div className="graveyardZone topRow">Graveyard</div>
    </>
  );
}

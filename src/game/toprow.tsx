import React from 'react';
import { Player } from '../interface/player';
import { HeadEqZone } from './zones/headEqZone';
import { Displayrow } from '../interface/displayrow';

export function TopRow(props: Player) {
  const row = props.isPlayer ? 'topRow' : 'bottomRow';
  return (
    <>
      <div>
        <HeadEqZone DisplayRow={row} isPlayer={props.isPlayer} />
      </div>
      <div className={'permanentZone ' + row}></div>
      <div className={'graveyardZone ' + row}>Graveyard</div>
    </>
  );
}

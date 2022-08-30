import React from 'react';
import { Player } from '../interface/player';
import { HeadEqZone } from './zones/headEqZone';
import styles from './rows.module.css';
import { PermanentsZone } from './zones/permanentsZone';
import { GraveyardZone } from './zones/graveyardZone';

export function TopRow(props: Player) {
  const row = props.isPlayer ? styles.topRow : styles.bottomRow;
  return (
    <div className={row}>
      <HeadEqZone DisplayRow={row} isPlayer={props.isPlayer} />
      <PermanentsZone DisplayRow={row} isPlayer={props.isPlayer} />
      <GraveyardZone DisplayRow={row} isPlayer={props.isPlayer} />
    </div>
  );
}

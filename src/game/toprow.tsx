import React from 'react';
import { Player } from '../interface/player';
import { HeadEqZone } from './zones/headEqZone';
import styles from './rows.module.css';

export function TopRow(props: Player) {
  const row = props.isPlayer ? 'topRow' : 'bottomRow';
  return (
    <div className={styles.topRow}>
      <div>
        <HeadEqZone DisplayRow={row} isPlayer={props.isPlayer} />
      </div>
      <div className={'permanentZone cardStackZone ' + row}>Permanents</div>
      <div className={'graveyardZone cardStackZone ' + row}>Graveyard</div>
    </div>
  );
}

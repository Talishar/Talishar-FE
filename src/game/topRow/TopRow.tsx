import React from 'react';
import Player from '../../interface/Player';
import HeadEqZone from '../zones/headEqZone/HeadEqZone';
import styles from './Rows.module.css';
import PermanentsZone from '../zones/permanentsZone/PermanentsZone';
import GraveyardZone from '../zones/graveyardZone/GraveyardZone';

export default function TopRow(props: Player) {
  const row = props.isPlayer ? styles.topRow : styles.bottomRow;
  return (
    <div className={row}>
      <HeadEqZone DisplayRow={row} isPlayer={props.isPlayer} />
      <PermanentsZone DisplayRow={row} isPlayer={props.isPlayer} />
      <GraveyardZone DisplayRow={row} isPlayer={props.isPlayer} />
    </div>
  );
}

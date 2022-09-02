import React from 'react';
import Player from '../interface/Player';
import FeetEqZone from './zones/FeetEqZone';
import styles from './Rows.module.css';
import BanishZone from './zones/BanishZone';
import ArsenalZone from './zones/ArsenalZone';

export default function BottomRow(props: Player) {
  const displayRow = props.isPlayer ? styles.bottomRow : styles.topRow;
  return (
    <div className={displayRow}>
      <FeetEqZone DisplayRow={displayRow} isPlayer={props.isPlayer} />
      <ArsenalZone DisplayRow={displayRow} isPlayer={props.isPlayer} />
      <BanishZone DisplayRow={displayRow} isPlayer={props.isPlayer} />
    </div>
  );
}

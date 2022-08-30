import React from 'react';
import { Player } from '../interface/player';
import { FeetEqZone } from './zones/feetEqZone';
import styles from './rows.module.css';
import { BanishZone } from './zones/banishZone';
import { ArsenalZone } from './zones/arsenalZone';

export function BottomRow(props: Player) {
  const displayRow = props.isPlayer ? styles.bottomRow : styles.topRow;
  return (
    <div className={displayRow}>
      <FeetEqZone DisplayRow={displayRow} isPlayer={props.isPlayer} />
      <ArsenalZone DisplayRow={displayRow} isPlayer={props.isPlayer} />
      <BanishZone DisplayRow={displayRow} isPlayer={props.isPlayer} />
    </div>
  );
}

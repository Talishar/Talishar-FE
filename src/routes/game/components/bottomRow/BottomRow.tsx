import React from 'react';
import Player from '../../../../interface/Player';
import LegsEqZone from '../zones/legsEqZone/LegsEqZone';
import styles from './BottomRow.module.css';
import BanishZone from '../zones/banishZone/BanishZone';
import ArsenalZone from '../zones/arsenalZone/ArsenalZone';
import ZoneCounts from '../zones/zoneCountsZone/ZoneCounts';

export default function BottomRow(props: Player) {
  const displayRow = props.isPlayer ? styles.bottomRow : styles.topRow;
  return (
    <div className={displayRow}>
      <LegsEqZone DisplayRow={displayRow} isPlayer={props.isPlayer} />
      <ArsenalZone DisplayRow={displayRow} isPlayer={props.isPlayer} />
      <div>
        <ZoneCounts DisplayRow={displayRow} isPlayer={props.isPlayer} />
        <BanishZone DisplayRow={displayRow} isPlayer={props.isPlayer} />
      </div>
    </div>
  );
}

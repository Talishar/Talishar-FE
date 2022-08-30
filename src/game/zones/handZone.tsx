import React from 'react';
import styles from './handZone.module.css';
import { Player } from '../../interface/player';

export function HandZone(props: Player) {
  let displayRow = props.isPlayer ? styles.isPlayer : styles.isOpponent;
  const whoIsIt = props.isPlayer ? "it's me" : "it's them";
  displayRow = displayRow + ' ' + styles.handZone;
  return <div className={displayRow}>This hand is {whoIsIt}</div>;
}

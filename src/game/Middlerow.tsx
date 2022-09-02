import React from 'react';
import Player from '../interface/Player';
import ChestEqZone from './zones/ChestEqZone';
import GlovesEqZone from './zones/GlovesEqZone';
import HeroZone from './zones/HeroZone';
import WeaponLZone from './zones/WeaponLZone';
import WeaponRZone from './zones/WeaponRZone';
import styles from './Rows.module.css';
import DeckZone from './zones/DeckZone';
import PitchZone from './zones/PitchZone';

export default function MiddleRow(props: Player) {
  return (
    <div className={styles.middleRow}>
      <div className={styles.groupL}>
        <ChestEqZone DisplayRow="middleRow" isPlayer={props.isPlayer} />
        <GlovesEqZone DisplayRow="middleRow" isPlayer={props.isPlayer} />
      </div>
      <div className={styles.groupM}>
        <WeaponLZone DisplayRow="middleRow" isPlayer={props.isPlayer} />
        <HeroZone DisplayRow="middleRow" isPlayer={props.isPlayer} />
        <WeaponRZone DisplayRow="middleRow" isPlayer={props.isPlayer} />
      </div>
      <div className={styles.groupR}>
        <PitchZone DisplayRow="middleRow" isPlayer={props.isPlayer} />
        <DeckZone DisplayRow="middleRow" isPlayer={props.isPlayer} />
      </div>
    </div>
  );
}

import React from 'react';
import Player from '../../interface/Player';
import ChestEqZone from '../zones/chestEqZone/ChestEqZone';
import GlovesEqZone from '../zones/glovesEqZone/GlovesEqZone';
import HeroZone from '../zones/heroZone/HeroZone';
import WeaponLZone from '../zones/weaponLZone/WeaponLZone';
import WeaponRZone from '../zones/weaponRZone/WeaponRZone';
import styles from './MiddleRow.module.css';
import DeckZone from '../zones/deckZone/DeckZone';
import PitchZone from '../zones/pitchZone/PitchZone';

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

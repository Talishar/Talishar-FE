import React from 'react';
import { Player } from '../interface/player';
import { ChestEqZone } from './zones/chestEqZone';
import { GlovesEqZone } from './zones/glovesEqZone';
import { HeroZone } from './zones/heroZone';
import { WeaponLZone } from './zones/weaponLZone';
import { WeaponRZone } from './zones/weaponRZone';
import styles from './rows.module.css';
import { DeckZone } from './zones/deckZone';
import { PitchZone } from './zones/pitchZone';

export function MiddleRow(props: Player) {
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

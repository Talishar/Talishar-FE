import React from 'react';
import Displayrow from 'interface/Displayrow';
import WeaponZone from '../weaponZone/WeaponZone';
import styles from './WeaponRZone.module.css';

export const WeaponRZone = (prop: Displayrow) => (
  <WeaponZone {...prop} side="R" zoneClassName={styles.weaponRZone} />
);

export default WeaponRZone;

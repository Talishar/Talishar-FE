import React from 'react';
import Displayrow from 'interface/Displayrow';
import EquipZone from '../equipZone/EquipZone';
import styles from './ArmsEqZone.module.css';

export const ArmsEqZone = (prop: Displayrow) => (
  <EquipZone {...prop} slot="Arms" zoneClassName={styles.armsZone} />
);

export default ArmsEqZone;

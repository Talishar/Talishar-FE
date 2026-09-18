import React from 'react';
import Displayrow from 'interface/Displayrow';
import EquipZone from '../equipZone/EquipZone';
import styles from './ChestEqZone.module.css';

export const ChestEqZone = (prop: Displayrow) => (
  <EquipZone {...prop} slot="Chest" zoneClassName={styles.chestZone} />
);

export default ChestEqZone;

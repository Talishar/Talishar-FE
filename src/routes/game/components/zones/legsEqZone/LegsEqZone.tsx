import React from 'react';
import Displayrow from 'interface/Displayrow';
import EquipZone from '../equipZone/EquipZone';
import styles from './LegsEqZone.module.css';

export const LegsEqZone = (prop: Displayrow) => (
  <EquipZone {...prop} slot="Legs" zoneClassName={styles.legsZone} />
);

export default LegsEqZone;

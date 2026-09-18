import React from 'react';
import Displayrow from 'interface/Displayrow';
import EquipZone from '../equipZone/EquipZone';
import styles from './HeadEqZone.module.css';

export const HeadEqZone = (prop: Displayrow) => (
  <EquipZone {...prop} slot="Head" zoneClassName={styles.headZone} />
);

export default HeadEqZone;

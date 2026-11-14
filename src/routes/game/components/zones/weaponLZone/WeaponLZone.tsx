import Displayrow from 'interface/Displayrow';
import WeaponZone from '../weaponZone/WeaponZone';
import styles from './WeaponLZone.module.css';

export const WeaponLZone = (prop: Displayrow) => (
  <WeaponZone {...prop} side="L" zoneClassName={styles.weaponLZone} />
);

export default WeaponLZone;

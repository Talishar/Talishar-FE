import styles from './ActiveEffects.module.css';
import Effects, { PHONE_PORTRAIT_QUERY } from '../elements/effects/Effects';
import LandmarkZone from '../zones/LandmarkZone';
import { useMediaQuery } from 'hooks/useMediaQuery';

export default function ActiveEffects() {
  const isPhonePortrait = useMediaQuery(PHONE_PORTRAIT_QUERY);
  return (
    <div className={styles.activeEffects}>
      <Effects isPlayer={false} />
      <LandmarkZone />
      {isPhonePortrait ? (
        <div className={styles.playerEffectsSpacer} />
      ) : (
        <Effects isPlayer />
      )}
    </div>
  );
}

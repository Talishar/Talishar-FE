import styles from './ActiveEffects.module.css';
import Effects, { PHONE_PORTRAIT_QUERY } from '../elements/effects/Effects';
import LandmarkZone from '../zones/LandmarkZone';
import { useMediaQuery } from 'hooks/useMediaQuery';
import { useShowsPortraitFan } from '../zones/playerHand/useShowsPortraitFan';

export default function ActiveEffects() {
  const isPhonePortrait = useMediaQuery(PHONE_PORTRAIT_QUERY);
  const showsPortraitFan = useShowsPortraitFan();
  return (
    <div className={styles.activeEffects}>
      {showsPortraitFan ? (
        <div className={styles.playerEffectsSpacer} />
      ) : (
        <Effects isPlayer={false} />
      )}
      <LandmarkZone />
      {isPhonePortrait || showsPortraitFan ? (
        <div className={styles.playerEffectsSpacer} />
      ) : (
        <Effects isPlayer />
      )}
    </div>
  );
}

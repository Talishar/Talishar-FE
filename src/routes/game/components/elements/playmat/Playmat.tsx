import { useAppSelector } from 'app/Hooks';
import { RootState } from 'app/Store';
import { selectSidePlayer } from 'features/game/perspective';
import { useCookieString } from 'utils/cookieStore';
import { useMemo } from 'react';
import { useColorblindPreset } from 'features/settings/accessibility';
import { COLORBLIND_PRESET } from 'features/settings/colorblindPresets';

import styles from './Playmat.module.css';
export const Playmat = ({ isPlayer }: { isPlayer: boolean }) => {
  const playmatIntensity = useCookieString('playmatIntensity');

  const sidePlaymat = useAppSelector(
    (state: RootState) => selectSidePlayer(state, isPlayer).Playmat
  );
  const colorblindPreset = useColorblindPreset();
  const playmat =
    colorblindPreset === COLORBLIND_PRESET.OFF ? sidePlaymat : 'Default';

  const styleToApply = useMemo(() => {
    const parsed = Number(playmatIntensity);
    const intensity =
      Number.isFinite(parsed) && parsed > 0 ? Math.min(parsed, 1) : 0.65;
    const dim = 1 - intensity;
    const dimLayer = `linear-gradient(rgba(0, 0, 0, ${dim}), rgba(0, 0, 0, ${dim}))`;
    return {
      backgroundImage: `${dimLayer}, url(/playmats/${playmat}.webp)`,
      borderRadius: `10px`
    };
  }, [playmat, playmatIntensity]);

  const playmatClass = isPlayer ? styles.playerOne : styles.playerTwo;

  return <div className={playmatClass} style={styleToApply} aria-hidden="true" />;
};

export default Playmat;

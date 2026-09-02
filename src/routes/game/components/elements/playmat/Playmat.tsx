import { useAppSelector } from 'app/Hooks';
import { RootState } from 'app/Store';
import { useCookieString } from 'utils/cookieStore';
import { useMemo } from 'react';

import styles from './Playmat.module.css';
export const Playmat = ({ isPlayer }: { isPlayer: boolean }) => {
  const playmatIntensity = useCookieString('playmatIntensity');

  const playerID = useAppSelector(
    (state: RootState) => state.game.gameInfo.playerID
  );
  const isReplay = useAppSelector(
    (state: RootState) => state.game.gameInfo.isReplay
  );
  const spectatorCameraView = useAppSelector(
    (state: RootState) => state.game.spectatorCameraView
  );

  // Get both playmats
  const playerOnePlaymat = useAppSelector(
    (state: RootState) => state.game.playerOne.Playmat
  );
  const playerTwoPlaymat = useAppSelector(
    (state: RootState) => state.game.playerTwo.Playmat
  );

  // Determine which playmat to display
  let playmat;
  if (playerID === 3 || isReplay) {
    if (spectatorCameraView === 2) {
      playmat = isPlayer ? playerTwoPlaymat : playerOnePlaymat;
    } else {
      playmat = isPlayer ? playerOnePlaymat : playerTwoPlaymat;
    }
  } else {
    playmat = isPlayer ? playerOnePlaymat : playerTwoPlaymat;
  }

  const styleToApply = useMemo(() => {
    const intensity = Number(playmatIntensity ?? 0.65);
    const dim =
      1 - (Number.isFinite(intensity) ? Math.min(intensity, 1) : 0.65);
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

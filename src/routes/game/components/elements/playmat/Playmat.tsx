import React from 'react';
import { useAppSelector } from 'app/Hooks';
import { RootState } from 'app/Store';
import { useCookies } from 'react-cookie';

import styles from './Playmat.module.css';
export const Playmat = ({ isPlayer }: { isPlayer: boolean }) => {
  const [cookies] = useCookies(['playmatIntensity']);
  
  const playerID = useAppSelector((state: RootState) => state.game.gameInfo.playerID);
  const spectatorCameraView = useAppSelector(
    (state: RootState) => state.game.spectatorCameraView
  );

  // Get both playmats
  const playerOnePlaymat = useAppSelector((state: RootState) => state.game.playerOne.Playmat);
  const playerTwoPlaymat = useAppSelector((state: RootState) => state.game.playerTwo.Playmat);

  // Determine which playmat to display
  let playmat;
  if (playerID === 3) {
    if (spectatorCameraView === 2) {
      playmat = isPlayer ? playerTwoPlaymat : playerOnePlaymat;
    } else {
      playmat = isPlayer ? playerOnePlaymat : playerTwoPlaymat;
    }
  } else {
    playmat = isPlayer ? playerOnePlaymat : playerTwoPlaymat;
  }

  const styleToApply = {
    backgroundImage: `url(/playmats/${playmat}.webp)`,
    filter: `brightness(${cookies.playmatIntensity ?? 0.65})`,
    borderRadius: `10px`,
  };

  const playmatClass = isPlayer ? styles.playerOne : styles.playerTwo;

  return <div className={playmatClass} style={styleToApply}></div>;
};

export default Playmat;

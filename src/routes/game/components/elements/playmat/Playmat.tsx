import React from 'react';
import { useAppSelector } from 'app/Hooks';
import { RootState } from 'app/Store';
import { useCookies } from 'react-cookie';

import styles from './Playmat.module.css';
export const Playmat = ({ isPlayer }: { isPlayer: boolean }) => {
  const [cookies] = useCookies(['playmatIntensity']);
  let playmat = useAppSelector((state: RootState) =>
    isPlayer ? state.game.playerOne.Playmat : state.game.playerTwo.Playmat
  );

  const styleToApply = {
    backgroundImage: `url(/playmats/${playmat}.webp)`,
    filter: `brightness(${cookies.playmatIntensity ?? 0.65})`,
    borderRadius: `10px`
  };

  const playmatClass = isPlayer ? styles.playerOne : styles.playerTwo;

  return <div className={playmatClass} style={styleToApply}></div>;
};

export default Playmat;

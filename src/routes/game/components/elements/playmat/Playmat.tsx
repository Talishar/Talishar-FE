import React from 'react';
import { useAppSelector } from 'app/Hooks';
import { RootState } from 'app/Store';

import styles from './Playmat.module.css';
export const Playmat = ({ isPlayer }: { isPlayer: boolean }) => {
  let playmat = useAppSelector((state: RootState) =>
    isPlayer ? state.game.playerOne.Playmat : state.game.playerTwo.Playmat
  );

  if (playmat === undefined) {
    // playmat = DEFAULT_PLAYMAT;
    playmat = isPlayer ? 'pits' : `volcor`;
  }

  const styleToApply = {
    backgroundImage: `url(/playmats/${playmat}.webp)`
  };

  const playmatClass = isPlayer ? styles.playerOne : styles.playerTwo;

  return <div className={playmatClass} style={styleToApply}></div>;
};

export default Playmat;

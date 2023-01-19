import React from 'react';
import TopRow from '../topRow/TopRow';
import MiddleRow from '../middleRow/MiddleRow';
import BottomRow from '../bottomRow/BottomRow';
import styles from './PlayerBoardGrid.module.css';
import { useAppSelector } from '../../app/Hooks';
import { RootState } from '../../app/Store';
import { DEFAULT_PLAYMAT } from '../../constants';

export default function PlayerBoardGrid() {
  let playmat = useAppSelector(
    (state: RootState) => state.game.playerOne.Playmat
  );

  if (playmat === undefined) {
    playmat = DEFAULT_PLAYMAT;
  }

  const styleToApply = {
    backgroundImage: `url(./playmats/${playmat}.webp)`
  };

  return (
    <div className={styles.playerPlaymat} style={styleToApply}>
      {/* Customise the playmat here */}
      <div className={styles.playerBoard}>
        <div className={styles.FirstBox}>Hello</div>
        <div className={styles.SecondBox}>Hello</div>
        <div className={styles.ThirdBox}>Hello</div>
      </div>
    </div>
  );
}

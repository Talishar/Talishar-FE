import React from 'react';
import TopRow from '../topRow/TopRow';
import MiddleRow from '../middleRow/MiddleRow';
import BottomRow from '../bottomRow/BottomRow';
import styles from './OpponentBoard.module.css';
import { useAppSelector } from 'app/Hooks';
import { RootState } from 'app/Store';
import { DEFAULT_PLAYMAT } from 'constants';

export default function OpponentBoard() {
  let playmat = useAppSelector(
    (state: RootState) => state.game.playerTwo.Playmat
  );

  if (playmat === undefined) {
    playmat = DEFAULT_PLAYMAT;
  }

  const styleToApply = {
    backgroundImage: `url(/playmats/${playmat}.webp)`
  };

  return (
    <div className={styles.opponentPlaymat} style={styleToApply}>
      <div className={styles.playerBoard}>
        <BottomRow isPlayer={false} />
        <MiddleRow isPlayer={false} />
        <TopRow isPlayer={false} />
      </div>
    </div>
  );
}

import React, { useMemo } from 'react';
import TopRow from '../topRow/TopRow';
import MiddleRow from '../middleRow/MiddleRow';
import BottomRow from '../bottomRow/BottomRow';
import styles from './PlayerBoard.module.css';
import { useAppSelector } from 'app/Hooks';
import { RootState } from 'app/Store';

export default function PlayerBoard() {
  const playmatRaw = useAppSelector(
    (state: RootState) => state.game.playerOne.Playmat
  );
  const playmat = playmatRaw ?? 'aria';

  const styleToApply = useMemo(
    () => ({ backgroundImage: `url(/playmats/${playmat}.webp)` }),
    [playmat]
  );

  return (
    <div className={styles.playerPlaymat} style={styleToApply}>
      {/* Customise the playmat here */}
      <div className={styles.playerBoard}>
        <TopRow isPlayer />
        <MiddleRow isPlayer />
        <BottomRow isPlayer />
      </div>
    </div>
  );
}

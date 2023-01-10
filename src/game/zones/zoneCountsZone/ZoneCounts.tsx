import React from 'react';
import {
  GiAngelOutfit,
  GiCannon,
  GiFluffySwirl,
  GiHand,
  GiStack,
  GiTombstone
} from 'react-icons/gi';
import { useAppDispatch, useAppSelector } from '../../../app/Hooks';
import { RootState } from '../../../app/Store';
import {
  setCardListFocus,
  setCardListLoadFocus
} from '../../../features/game/GameSlice';
import Displayrow from '../../../interface/Displayrow';
import styles from './ZoneCounts.module.css';

export const ZoneCounts = (prop: Displayrow) => {
  const { isPlayer } = prop;
  const dispatch = useAppDispatch();

  const soulCount = useAppSelector((state: RootState) =>
    isPlayer ? state.game.playerOne.SoulCount : state.game.playerTwo.SoulCount
  );
  const handCount = useAppSelector((state: RootState) =>
    isPlayer
      ? state.game.playerOne.Hand?.length
      : state.game.playerTwo.Hand?.length
  );
  const graveyardCount = useAppSelector((state: RootState) => {
    return (
      (isPlayer
        ? state.game.playerOne.GraveyardCount
        : state.game.playerTwo.GraveyardCount) ?? 0
    );
  });

  const banishCount = useAppSelector((state: RootState) => {
    return (
      (isPlayer
        ? state.game.playerOne.BanishCount
        : state.game.playerTwo.BanishCount) ?? 0
    );
  });

  const pitchCount = useAppSelector((state: RootState) => {
    return isPlayer
      ? state.game.playerOne.Pitch?.length
      : state.game.playerTwo.Pitch?.length;
  });

  const arsenalCount = useAppSelector((state: RootState) => {
    return isPlayer
      ? state.game.playerOne.Arsenal?.length
      : state.game.playerTwo.Arsenal?.length;
  });

  const soulDisplay = () => {
    const playerPronoun = isPlayer ? 'Your' : 'Your Opponents';
    const popUpName = isPlayer ? 'mySoulPopup' : 'theirSoulPopup';
    dispatch(
      setCardListLoadFocus({
        query: popUpName,
        name: `${playerPronoun} Soul`
      })
    );
  };

  return (
    <div className={styles.container}>
      <div className={styles.column}>
        <div title="Hand" className={styles.item}>
          <GiHand /> {handCount}
        </div>
        <div title="Graveyard" className={styles.item}>
          <GiTombstone /> {graveyardCount}
        </div>
        <div title="banish" className={styles.item}>
          <GiFluffySwirl /> {banishCount}
        </div>
      </div>
      <div className={styles.column}>
        <div title="pitch" className={styles.item}>
          <GiStack /> {pitchCount}
        </div>
        <div title="arsenal" className={styles.item}>
          <GiCannon /> {arsenalCount}
        </div>
        {!!soulCount && (
          <div title="soul" className={styles.item} onClick={soulDisplay}>
            <GiAngelOutfit /> {soulCount}
          </div>
        )}
      </div>
    </div>
  );
};

export default ZoneCounts;

import React from 'react';
import { GiAngelOutfit, GiGroundSprout } from 'react-icons/gi';
import { GiDroplets } from 'react-icons/gi';
import { FaPrayingHands } from 'react-icons/fa';
import { useAppDispatch, useAppSelector } from 'app/Hooks';
import { RootState } from 'app/Store';
import { setCardListLoadFocus } from 'features/game/GameSlice';
import Displayrow from 'interface/Displayrow';
import styles from './ZoneCounts.module.css';
import classNames from 'classnames';

export const ZoneCounts = (prop: Displayrow) => {
  const soulCount = useAppSelector((state: RootState) =>
    prop.isPlayer
      ? state.game.playerOne.SoulCount
      : state.game.playerTwo.SoulCount
  );

  const bloodDebt = useAppSelector((state: RootState) =>
    prop.isPlayer
      ? state.game.playerOne.bloodDebtCount
      : state.game.playerTwo.bloodDebtCount
  );

  const earthCount = useAppSelector((state: RootState) =>
    prop.isPlayer
      ? state.game.playerOne.earthCount
      : state.game.playerTwo.earthCount
  );

  const blessingsCount = useAppSelector((state: RootState) =>
    prop.isPlayer
      ? state.game.playerOne.blessingsCount
      : state.game.playerTwo.blessingsCount
  );

  if (!soulCount && !bloodDebt && !earthCount && !blessingsCount) {
    return null;
  }

  return (
    <div className={styles.container}>
      <div className={styles.column}>
        <SoulCount {...prop} />
        <BloodDebtCount {...prop} />
        <EarthCount {...prop} />
        <BlessingsCount {...prop} />
      </div>
    </div>
  );
};

const SoulCount = (prop: Displayrow) => {
  const dispatch = useAppDispatch();
  const { isPlayer } = prop;
  const soulCount = useAppSelector((state: RootState) =>
    isPlayer ? state.game.playerOne.SoulCount : state.game.playerTwo.SoulCount
  );

  if (!soulCount || soulCount <= 0) return null;

  const soulDisplay = () => {
    const playerPronoun = isPlayer ? 'Your' : "Opponent's";
    const popUpName = isPlayer ? 'mySoulPopup' : 'theirSoulPopup';
    dispatch(setCardListLoadFocus({ query: popUpName, name: `${playerPronoun} Soul` }));
  };

  return (
    <div title="Soul" className={styles.clickableItem} onClick={soulDisplay}>
      <GiAngelOutfit /> {soulCount}
    </div>
  );
};

const EarthCount = (prop: Displayrow) => {
  const { isPlayer } = prop;
  const earthCount = useAppSelector((state: RootState) =>
    isPlayer ? state.game.playerOne.earthCount : state.game.playerTwo.earthCount
  );

  if (!earthCount || earthCount <= 0) return null;

  return (
    <div title="Earth Cards Count" className={styles.NotClickableItem}>
      <GiGroundSprout /> {earthCount}
    </div>
  );
};

const BlessingsCount = (prop: Displayrow) => {
  const { isPlayer } = prop;
  const blessingsCount = useAppSelector((state: RootState) =>
    isPlayer
      ? state.game.playerOne.blessingsCount
      : state.game.playerTwo.blessingsCount
  );

  if (!blessingsCount || blessingsCount <= 0) return null;

  return (
    <div title="Count Your Blessings" className={styles.NotClickableItem}>
      <FaPrayingHands /> {blessingsCount}
    </div>
  );
};

const BloodDebtCount = (prop: Displayrow) => {
  const { isPlayer } = prop;
  const bloodDebtCount = useAppSelector((state: RootState) =>
    isPlayer
      ? state.game.playerOne.bloodDebtCount
      : state.game.playerTwo.bloodDebtCount
  );
  const isImmune = useAppSelector((state: RootState) =>
    isPlayer
      ? state.game.playerOne.bloodDebtImmune
      : state.game.playerTwo.bloodDebtImmune
  );

  if (!bloodDebtCount || bloodDebtCount <= 0) return null;

  const bloodDebtItem = classNames(
    { [styles.isRed]: !isImmune },
    styles.NotClickableItem
  );

  return (
    <div
      title={`Blood Debt${bloodDebtCount === 1 ? '' : 's'}`}
      className={bloodDebtItem}
    >
      <GiDroplets /> {bloodDebtCount}
    </div>
  );
};

export default ZoneCounts;

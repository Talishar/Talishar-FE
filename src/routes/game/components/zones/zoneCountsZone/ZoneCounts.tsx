import React, { useState } from 'react';
import {
  GiAngelOutfit,
  GiCannon,
  GiCircleClaws,
  GiDrop,
  GiFluffySwirl,
  GiHand,
  GiStack,
  GiTombstone
} from 'react-icons/gi';
import { useAppDispatch, useAppSelector } from 'app/Hooks';
import { RootState } from 'app/Store';
import { setCardListLoadFocus } from 'features/game/GameSlice';
import Displayrow from 'interface/Displayrow';
import styles from './ZoneCounts.module.css';
import classNames from 'classnames';

export const ZoneCounts = (prop: Displayrow) => {
  return (
    <div className={styles.container}>
      <div className={styles.column}>
        <SoulCount {...prop} />
        <HandCount {...prop} />
        <PitchCount {...prop} />
        <ArsenalCount {...prop} />
      </div>
      <div className={styles.column}>
        <BloodDebtCount {...prop} />
        <GraveyardCount {...prop} />
        <DeckCount {...prop} />
        <BanishCount {...prop} />
      </div>
    </div>
  );
};

const HandCount = (prop: Displayrow) => {
  const { isPlayer } = prop;
  const handCount = useAppSelector((state: RootState) =>
    isPlayer
      ? state.game.playerOne.Hand?.length
      : state.game.playerTwo.Hand?.length
  );

  return (
    <div title="Hand" className={styles.item}>
      <GiHand /> {handCount}
    </div>
  );
};

const GraveyardCount = (prop: Displayrow) => {
  const { isPlayer } = prop;
  const graveyardCount = useAppSelector((state: RootState) => {
    return isPlayer
      ? state.game.playerOne.Graveyard?.length
      : state.game.playerTwo.Graveyard?.length;
  });

  return (
    <div title="Graveyard" className={styles.item}>
      <GiTombstone /> {graveyardCount}
    </div>
  );
};

const BanishCount = (prop: Displayrow) => {
  const { isPlayer } = prop;
  const banishCount = useAppSelector((state: RootState) => {
    return isPlayer
      ? state.game.playerOne.Banish?.length
      : state.game.playerTwo.Banish?.length;
  });

  return (
    <div title="Banish" className={styles.item}>
      <GiFluffySwirl /> {banishCount}
    </div>
  );
};

const DeckCount = (prop: Displayrow) => {
  const { isPlayer } = prop;
  const pitchCount = useAppSelector((state: RootState) => {
    return (
      (isPlayer
        ? state.game.playerOne.DeckSize
        : state.game.playerTwo.DeckSize) ?? 0
    );
  });

  return (
    <div title="Deck" className={styles.item}>
      <GiStack /> {pitchCount}
    </div>
  );
};

const PitchCount = (prop: Displayrow) => {
  const { isPlayer } = prop;
  const pitchCount = useAppSelector((state: RootState) => {
    return isPlayer
      ? state.game.playerOne.Pitch?.length
      : state.game.playerTwo.Pitch?.length;
  });

  return (
    <div title="Pitch" className={styles.item}>
      <GiCircleClaws /> {pitchCount}
    </div>
  );
};

const ArsenalCount = (prop: Displayrow) => {
  const { isPlayer } = prop;
  const arsenalCount = useAppSelector((state: RootState) => {
    return isPlayer
      ? state.game.playerOne.Arsenal?.length
      : state.game.playerTwo.Arsenal?.length;
  });

  return (
    <div title="Arsenal" className={styles.item}>
      <GiCannon /> {arsenalCount}
    </div>
  );
};

const SoulCount = (prop: Displayrow) => {
  const [hasSoul, setHasSoul] = useState(false);
  const dispatch = useAppDispatch();
  const { isPlayer } = prop;
  const soulCount = useAppSelector((state: RootState) =>
    isPlayer ? state.game.playerOne.SoulCount : state.game.playerTwo.SoulCount
  );

  const soulDisplay = () => {
    const playerPronoun = isPlayer ? 'Your' : "Your Opponent's";
    const popUpName = isPlayer ? 'mySoulPopup' : 'theirSoulPopup';
    dispatch(
      setCardListLoadFocus({
        query: popUpName,
        name: `${playerPronoun} Soul`
      })
    );
  };

  if (!hasSoul && soulCount != undefined && soulCount > 0) {
    setHasSoul(true);
  }

  return (
    <div>
      {!!hasSoul ? (
        <div
          title="Soul"
          className={styles.clickableItem}
          onClick={soulDisplay}
        >
          <GiAngelOutfit /> {soulCount}
        </div>
      ) : (
        <div className={styles.item}> </div>
      )}
    </div>
  );
};

const BloodDebtCount = (prop: Displayrow) => {
  const [hasBloodDebt, setHasBloodDebt] = useState(false);
  const dispatch = useAppDispatch();
  const { isPlayer } = prop;
  const BloodDebtCount = useAppSelector((state: RootState) =>
    isPlayer
      ? state.game.playerOne.bloodDebtCount
      : state.game.playerTwo.bloodDebtCount
  );
  const isImmune = useAppSelector((state: RootState) =>
    isPlayer
      ? state.game.playerOne.bloodDebtImmune
      : state.game.playerTwo.bloodDebtImmune
  );

  const BloodDebtDisplay = () => {
    const playerPronoun = isPlayer ? 'Your' : "Your Opponent's";
    const popUpName = isPlayer ? 'myBloodDebtPopup' : 'theirBloodDebtPopup';
    dispatch(
      setCardListLoadFocus({
        query: popUpName,
        name: `${playerPronoun} BloodDebt`
      })
    );
  };

  if (!hasBloodDebt && BloodDebtCount != undefined && BloodDebtCount > 0) {
    setHasBloodDebt(true);
  }

  const bloodDebtItem = classNames(
    { [styles.isRed]: !isImmune },
    styles.clickableItem
  );

  return (
    <div>
      {!!hasBloodDebt ? (
        <div title="BloodDebt" className={bloodDebtItem}>
          <GiDrop /> {BloodDebtCount}
        </div>
      ) : (
        <div className={styles.item}> </div>
      )}
    </div>
  );
};

export default ZoneCounts;

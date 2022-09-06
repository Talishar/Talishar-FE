import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../app/Store';
import { setCardListFocus } from '../../features/game/GameSlice';
import Displayrow from '../../interface/Displayrow';
import CardDisplay from '../elements/CardDisplay';
import styles from './Cardzone.module.css';

export default function BanishZone(prop: Displayrow) {
  const { isPlayer } = prop;
  const dispatch = useDispatch();

  const banishZone = useSelector((state: RootState) =>
    isPlayer ? state.game.playerOne.Banish : state.game.playerTwo.Banish
  );

  const numInBanish = useSelector((state: RootState) =>
    isPlayer
      ? state.game.playerOne.BanishCount
      : state.game.playerTwo.BanishCount
  );

  if (
    banishZone === undefined ||
    banishZone.length === 0 ||
    numInBanish === 0
  ) {
    return <div className={styles.banishZone}>Banish</div>;
  }

  const banishZoneDisplay = () => {
    // TODO: send get request to get this (async thunk)
    const isPlayerPronoun = isPlayer ? 'Your' : 'Your Opponents';
    dispatch(
      setCardListFocus({
        cardList: banishZone,
        name: `${isPlayerPronoun} Banish Zone`
      })
    );
  };

  numInBanish;
  const cardToDisplay = banishZone[0];

  return (
    <div className={styles.banishZone} onClick={banishZoneDisplay}>
      <CardDisplay card={cardToDisplay} num={numInBanish} preventUseOnClick />
    </div>
  );
}

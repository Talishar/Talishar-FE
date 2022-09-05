import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../app/Store';
import { setCardListFocus } from '../../features/game/GameSlice';
import Displayrow from '../../interface/Displayrow';
import CardDisplay from '../elements/CardDisplay';
import styles from './Cardzone.module.css';

export default function BanishZone(prop: Displayrow) {
  const { isPlayer } = prop;

  const banishZone = useSelector((state: RootState) =>
    isPlayer ? state.game.playerOne.Banish : state.game.playerTwo.Banish
  );

  if (banishZone === undefined || banishZone.length === 0) {
    return <div className={styles.banishZone}>Banish</div>;
  }

  const dispatch = useDispatch();

  const banishZoneDisplay = () => {
    console.log('displaying the banish zone!');
    const isPlayerPronoun = isPlayer ? 'Your' : 'Your Opponents';
    dispatch(
      setCardListFocus({
        cardList: banishZone,
        name: `${isPlayerPronoun} Banish Zone`
      })
    );
  };

  const numInBanish = banishZone.length;
  const cardToDisplay = banishZone[numInBanish - 1];

  return (
    <div className={styles.banishZone} onClick={banishZoneDisplay}>
      <CardDisplay card={cardToDisplay} num={numInBanish} preventUseOnClick />
    </div>
  );
}

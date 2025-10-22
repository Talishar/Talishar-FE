import React from 'react';
import { useAppDispatch, useAppSelector } from 'app/Hooks';
import { RootState } from 'app/Store';
import { setCardListFocus } from 'features/game/GameSlice';
import Displayrow from 'interface/Displayrow';
import CardDisplay from '../../elements/cardDisplay/CardDisplay';
import styles from './BanishZone.module.css';

export const BanishZone = React.memo((prop: Displayrow) => {
  const { isPlayer } = prop;
  const dispatch = useAppDispatch();
  const showCount = true;

  const banishZone = useAppSelector((state: RootState) =>
    isPlayer ? state.game.playerOne.Banish : state.game.playerTwo.Banish
  );

  if (banishZone === undefined || banishZone.length === 0) {
    return <div className={styles.banishZone}>Banish</div>;
  }

  const banishZoneDisplay = () => {
    const isPlayerPronoun = isPlayer ? 'Your' : "Opponent's";
    dispatch(
      setCardListFocus({
        cardList: banishZone,
        name: `${isPlayerPronoun} Banish Zone`
      })
    );
  };

  const cardToDisplay = { ...banishZone[0], borderColor: '' };

  return (
    <div className={styles.banishZone} onClick={banishZoneDisplay}>
      <CardDisplay
        card={cardToDisplay}
        isPlayer={isPlayer}
        num={showCount ? banishZone.length : undefined}
        preventUseOnClick
      />
    </div>
  );
});

export default BanishZone;

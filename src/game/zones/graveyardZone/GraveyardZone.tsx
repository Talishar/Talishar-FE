import React from 'react';
import { RootState } from '../../../app/Store';
import Displayrow from '../../../interface/Displayrow';
import { setCardListFocus } from '../../../features/game/GameSlice';
import CardDisplay from '../../elements/cardDisplay/CardDisplay';
import styles from '../Cardzone.module.css';
import { useAppDispatch, useAppSelector } from '../../../app/Hooks';

export default function GraveyardZone(prop: Displayrow) {
  const { isPlayer } = prop;
  const dispatch = useAppDispatch();

  const graveyardZone = useAppSelector((state: RootState) =>
    isPlayer ? state.game.playerOne.Graveyard : state.game.playerTwo.Graveyard
  );

  if (graveyardZone === undefined || graveyardZone.length === 0) {
    return <div className={styles.graveyardZone}>Graveyard</div>;
  }

  const graveyardZoneDisplay = () => {
    const isPlayerPronoun = isPlayer ? 'Your' : 'Your Opponents';
    dispatch(
      setCardListFocus({
        cardList: graveyardZone,
        name: `${isPlayerPronoun} Graveyard`
      })
    );
  };

  const cardToDisplay = { ...graveyardZone[0], borderColor: '' };

  return (
    <div className={styles.graveyardZone} onClick={graveyardZoneDisplay}>
      <CardDisplay
        card={cardToDisplay}
        num={graveyardZone.length}
        preventUseOnClick
      />
    </div>
  );
}

import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../../app/Store';
import Displayrow from '../../interface/Displayrow';
import { setCardListFocus } from '../../features/game/GameSlice';
import CardDisplay from '../elements/CardDisplay';
import styles from './Cardzone.module.css';

export default function GraveyardZone(prop: Displayrow) {
  const { isPlayer } = prop;
  const dispatch = useDispatch();

  const graveyardZone = useSelector((state: RootState) =>
    isPlayer ? state.game.playerOne.Graveyard : state.game.playerTwo.Graveyard
  );

  const numInGraveYard = useSelector((state: RootState) =>
    isPlayer
      ? state.game.playerOne.GraveyardCount
      : state.game.playerTwo.GraveyardCount
  );

  if (graveyardZone === undefined || numInGraveYard === 0) {
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

  const cardToDisplay = graveyardZone[0];

  return (
    <div className={styles.graveyardZone} onClick={graveyardZoneDisplay}>
      <CardDisplay
        card={cardToDisplay}
        num={numInGraveYard}
        preventUseOnClick
      />
    </div>
  );
}

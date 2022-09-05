import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../../app/Store';
import Displayrow from '../../interface/Displayrow';
import { setCardListFocus } from '../../features/game/GameSlice';
import CardDisplay from '../elements/CardDisplay';
import styles from './Cardzone.module.css';

export default function GraveyardZone(prop: Displayrow) {
  const { isPlayer } = prop;

  const graveyardZone = useSelector((state: RootState) =>
    isPlayer ? state.game.playerOne.Graveyard : state.game.playerTwo.Graveyard
  );

  if (graveyardZone === undefined) {
    return <div className={styles.graveyardZone}>Graveyard</div>;
  }

  const dispatch = useDispatch();

  const graveyardZoneDisplay = () => {
    console.log('displaying the banish zone!');
    const isPlayerPronoun = isPlayer ? 'Your' : 'Your Opponents';
    dispatch(
      setCardListFocus({
        cardList: graveyardZone,
        name: `${isPlayerPronoun} Graveyard`
      })
    );
  };

  const numInGraveyard = graveyardZone.length;
  const cardToDisplay = graveyardZone[numInGraveyard - 1];

  return (
    <div className={styles.graveyardZone} onClick={graveyardZoneDisplay}>
      <CardDisplay
        card={cardToDisplay}
        num={numInGraveyard}
        preventUseOnClick
      />
    </div>
  );
}

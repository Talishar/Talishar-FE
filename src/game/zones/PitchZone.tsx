import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../../app/Store';
import Displayrow from '../../interface/Displayrow';
import CardDisplay from '../elements/CardDisplay';
import { setCardListFocus } from '../../features/game/GameSlice';
import styles from './Cardzone.module.css';
import PitchDisplay from '../elements/PitchDisplay';

export default function PitchZone(prop: Displayrow) {
  const { isPlayer } = prop;
  const { DisplayRow } = prop;

  const pitchZone = useSelector((state: RootState) =>
    isPlayer ? state.game.playerOne.Pitch : state.game.playerTwo.Pitch
  );

  if (pitchZone === undefined) {
    return <div className={styles.pitchZone}>Pitch</div>;
  }

  const dispatch = useDispatch();

  const pitchZoneDisplay = () => {
    const isPlayerPronoun = isPlayer ? 'Your' : 'Your Opponents';
    dispatch(
      setCardListFocus({
        cardList: pitchZone,
        name: `${isPlayerPronoun} Pitch Zone`
      })
    );
  };

  const numInPitch = pitchZone.length;
  const cardToDisplay = pitchZone[numInPitch - 1];

  return (
    <div className={styles.pitchZone} onClick={pitchZoneDisplay}>
      <CardDisplay card={cardToDisplay} num={numInPitch} preventUseOnClick />
      <PitchDisplay isPlayer={isPlayer} DisplayRow={DisplayRow} />
    </div>
  );
}

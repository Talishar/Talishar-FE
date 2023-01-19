import React from 'react';
import { RootState } from '../../../app/Store';
import Displayrow from '../../../interface/Displayrow';
import CardDisplay from '../../elements/cardDisplay/CardDisplay';
import { setCardListFocus } from '../../../features/game/GameSlice';
import styles from './PitchZone.module.css';
import PitchDisplay from '../../elements/pitchDisplay/PitchDisplay';
import { useAppDispatch, useAppSelector } from '../../../app/Hooks';

export default function PitchZone(prop: Displayrow) {
  const { isPlayer } = prop;
  const { DisplayRow } = prop;
  const dispatch = useAppDispatch();

  const pitchZone = useAppSelector((state: RootState) =>
    isPlayer ? state.game.playerOne.Pitch : state.game.playerTwo.Pitch
  );

  if (
    pitchZone === undefined ||
    pitchZone.length === 0 ||
    pitchZone[0].cardNumber === 'blankZone'
  ) {
    return (
      <>
        <div className={styles.pitchZone}>
          <PitchDisplay isPlayer={isPlayer} DisplayRow={DisplayRow} />
        </div>
      </>
    );
  }

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
  const cardToDisplay = { ...pitchZone[numInPitch - 1], borderColor: '' };

  // TODO: Have the nice stacking effect like it was requested on twitter
  return (
    <div className={styles.pitchZone} onClick={pitchZoneDisplay}>
      <CardDisplay card={cardToDisplay} num={0} preventUseOnClick />
      <PitchDisplay isPlayer={isPlayer} DisplayRow={DisplayRow} />
    </div>
  );
}

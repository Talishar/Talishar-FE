import React from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../../app/store';
import { Displayrow } from '../../interface/displayrow';
import { CardDisplay } from '../elements/card';

export function FeetEqZone(prop: Displayrow) {
  let cardToDisplay;
  if (prop.isPlayer) {
    cardToDisplay = useSelector(
      (state: RootState) => state.game.playerOne.FeetEq
    );
  } else {
    cardToDisplay = useSelector(
      (state: RootState) => state.game.playerTwo.FeetEq
    );
  }
  return (
    <div className={'feetZone singleCardZone ' + prop.DisplayRow}>
      <CardDisplay card={cardToDisplay} />
    </div>
  );
}

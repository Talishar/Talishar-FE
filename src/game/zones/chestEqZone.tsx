import React from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../../app/store';
import { Displayrow } from '../../interface/displayrow';
import { CardDisplay } from '../elements/card';

export function ChestEqZone(prop: Displayrow) {
  let cardToDisplay;
  if (prop.isPlayer) {
    cardToDisplay = useSelector(
      (state: RootState) => state.game.playerOne.ChestEq
    );
  } else {
    cardToDisplay = useSelector(
      (state: RootState) => state.game.playerTwo.ChestEq
    );
  }
  return (
    <div className={'chestZone singleCardZone ' + prop.DisplayRow}>
      <CardDisplay card={cardToDisplay} />
    </div>
  );
}

import React from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../../app/store';
import { Displayrow } from '../../interface/displayrow';
import { CardDisplay } from '../elements/card';

export function GlovesEqZone(prop: Displayrow) {
  let cardToDisplay;
  if (prop.isPlayer) {
    cardToDisplay = useSelector(
      (state: RootState) => state.game.playerOne.GlovesEq
    );
  } else {
    cardToDisplay = useSelector(
      (state: RootState) => state.game.playerTwo.GlovesEq
    );
  }
  return (
    <div className={'glovesZone singleCardZone ' + prop.DisplayRow}>
      <CardDisplay card={cardToDisplay} />
    </div>
  );
}

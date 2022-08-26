import React from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../../app/store';
import { Displayrow } from '../../interface/displayrow';
import { CardDisplay } from '../elements/card';

export function HeadEqZone(prop: Displayrow) {
  let cardToDisplay;
  if (prop.isPlayer) {
    cardToDisplay = useSelector(
      (state: RootState) => state.game.playerOne.HeadEq
    );
  } else {
    cardToDisplay = useSelector(
      (state: RootState) => state.game.playerTwo.HeadEq
    );
  }

  return (
    <div className={'hatZone singleCardZone ' + prop.DisplayRow}>
      <CardDisplay card={cardToDisplay} />
    </div>
  );
}

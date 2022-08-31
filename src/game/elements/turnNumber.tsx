import React from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../../app/store';
import { Displayrow } from '../../interface/displayrow';
import { CardDisplay } from '../elements/card';

export function TurnNumber() {
  let turnNumber = useSelector(
    (state: RootState) => state.game.gameInfo.turnNo
  );

  if (turnNumber === undefined) {
    turnNumber = 0;
  }

  return (
    <div>
      <div>TURN No.{turnNumber}</div>
    </div>
  );
}

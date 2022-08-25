import React from 'react';
import { Player } from '../interface/player';

export function MiddleRow(props: Player) {
  return (
    <>
      <div className="chestZone middleRow">Chest</div>
      <div className="glovesZone middleRow">Gloves</div>
      <div className="weaponLzone middleRow">Weapon L</div>
      <div className="heroZone middleRow">Hero</div>
      <div className="weaponRZone middleRow">Weapon R</div>
      <div className="pitchZone middleRow">Pitch</div>
      <div className="deckZone middleRow">Deck</div>
    </>
  );
}

import React from 'react';
import { Player } from '../interface/player';
import { ChestEqZone } from './zones/chestEqZone';
import { GlovesEqZone } from './zones/glovesEqZone';

export function MiddleRow(props: Player) {
  return (
    <>
      <div>
        <ChestEqZone DisplayRow="middleRow" isPlayer={props.isPlayer} />
      </div>
      <div>
        <GlovesEqZone DisplayRow="middleRow" isPlayer={props.isPlayer} />
      </div>
      <div className="weaponLzone middleRow">Weapon L</div>
      <div className="heroZone middleRow">Hero</div>
      <div className="weaponRZone middleRow">Weapon R</div>
      <div className="pitchZone middleRow">Pitch</div>
      <div className="deckZone middleRow">Deck</div>
    </>
  );
}

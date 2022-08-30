import React from 'react';
import { Player } from '../interface/player';

export function Hand(player: Player) {
  const whoIsIt = player.isPlayer ? 'me!' : 'them!';
  return <div>HAND FOR {whoIsIt}</div>;
}

import React from 'react';
import { Displayrow } from '../../interface/displayrow';

export function ChestEqZone(prop: Displayrow) {
  const eqImg = 'http://localhost/FaBOnline/concat/WTR150.webp';
  return (
    <div className={'chestZone singleCardZone ' + prop.DisplayRow}>
      <img src={eqImg} />
    </div>
  );
}

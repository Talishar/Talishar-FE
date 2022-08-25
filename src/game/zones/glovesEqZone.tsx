import React from 'react';
import { Displayrow } from '../../interface/displayrow';

export function GlovesEqZone(prop: Displayrow) {
  const eqImg = 'http://localhost/FaBOnline/concat/UPR158.webp';
  return (
    <div className={'glovesZone singleCardZone ' + prop.DisplayRow}>
      <img src={eqImg} />
    </div>
  );
}

import React from 'react';
import { Displayrow } from '../../interface/displayrow';

export function FeetEqZone(prop: Displayrow) {
  const eqImg =
    'http://www.fleshandbloodonline.com/FaBOnline/concat/WTR154.webp';
  return (
    <div className={'feetZone singleCardZone ' + prop.DisplayRow}>
      <img src={eqImg} />
    </div>
  );
}

import React from 'react';
import { Displayrow } from '../../interface/displayrow';

export function WeaponRZone(prop: Displayrow) {
  const eqImg =
    'http://www.fleshandbloodonline.com/FaBOnline/concat/CRU049.webp';
  return (
    <div className={'weaponRZone singleCardZone ' + prop.DisplayRow}>
      <img src={eqImg} />
    </div>
  );
}

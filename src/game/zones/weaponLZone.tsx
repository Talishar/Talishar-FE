import React from 'react';
import { Displayrow } from '../../interface/displayrow';

export function WeaponLZone(prop: Displayrow) {
  const eqImg = 'http://localhost/FaBOnline/concat/WTR078.webp';
  return (
    <div className={'weaponLZone singleCardZone ' + prop.DisplayRow}>
      <img src={eqImg} />
    </div>
  );
}

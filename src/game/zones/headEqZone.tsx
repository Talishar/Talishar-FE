import React from 'react';
import { Displayrow } from '../../interface/displayrow';

export function HeadEqZone(prop: Displayrow) {
  const eqImg =
    'http://www.fleshandbloodonline.com/FaBOnline/concat/WTR079.webp';
  return (
    <div className={'hatZone singleCardZone ' + prop.DisplayRow}>
      <img src={eqImg} />
    </div>
  );
}

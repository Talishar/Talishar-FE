import React from 'react';
import { Displayrow } from '../../interface/displayrow';

export function HeroZone(prop: Displayrow) {
  const eqImg =
    'http://www.fleshandbloodonline.com/FaBOnline/concat/CRU046.webp';
  return (
    <div className={'heroZone singleCardZone ' + prop.DisplayRow}>
      <img src={eqImg} />
    </div>
  );
}

import React from 'react';
import { Displayrow } from '../../interface/displayrow';
// http://localhost/FaBOnline/concat/WTR155.webp
export function HeadEqZone(prop: Displayrow) {
  const eqImg = 'http://localhost/FaBOnline/concat/WTR155.webp';
  return (
    <div className={'hatZone singleCardZone ' + prop.DisplayRow}>
      <img src={eqImg} />
    </div>
  );
}

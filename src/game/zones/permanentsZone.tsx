import React from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../../app/store';
import { Displayrow } from '../../interface/displayrow';
import { CardDisplay } from '../elements/card';
import styles from './cardzone.module.css';

export function PermanentsZone(prop: Displayrow) {
  // let cardToDisplay;
  // if (prop.isPlayer) {
  //   cardToDisplay = useSelector(
  //     (state: RootState) => state.game.playerOne.Hero
  //   );
  // } else {
  //   cardToDisplay = useSelector(
  //     (state: RootState) => state.game.playerTwo.Hero
  //   );
  // }
  return <div className={styles.permanentsZone}>Permanents Zone</div>;
}

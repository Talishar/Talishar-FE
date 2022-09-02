import React from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../../app/Store';
import Displayrow from '../../interface/displayrow';
import CardDisplay from '../elements/CardDisplay';
import styles from './Cardzone.module.css';

export default function DeckZone(prop: Displayrow) {
  const { isPlayer } = prop;

  const deckCards = useSelector((state: RootState) =>
    isPlayer ? state.game.playerOne.DeckSize : state.game.playerTwo.DeckSize
  );

  return <div className={styles.deckZone}>Deck</div>;
}

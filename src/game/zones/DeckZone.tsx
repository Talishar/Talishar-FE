import React from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../../app/Store';
import Displayrow from '../../interface/Displayrow';
import CardDisplay from '../elements/CardDisplay';
import styles from './Cardzone.module.css';

export default function DeckZone(prop: Displayrow) {
  const { isPlayer } = prop;

  const deckCards = useSelector((state: RootState) =>
    isPlayer ? state.game.playerOne.DeckSize : state.game.playerTwo.DeckSize
  );
  const deckBack = useSelector((state: RootState) =>
    isPlayer ? state.game.playerOne.DeckBack : state.game.playerTwo.DeckBack
  );

  if (deckCards === undefined || deckCards === 0) {
    return <div className={styles.banishZone}>Deck</div>;
  }

  return (
    <div className={styles.deckZone}>
      <CardDisplay card={deckBack} num={deckCards} preventUseOnClick />
    </div>
  );
}

import React from 'react';
import { useAppSelector } from 'app/Hooks';
import { RootState } from 'app/Store';
import Displayrow from 'interface/Displayrow';
import CardDisplay from '../../elements/cardDisplay/CardDisplay';
import styles from './DeckZone.module.css';

export const DeckZone = React.memo((prop: Displayrow) => {
  const { isPlayer } = prop;

  const showCount = false;

  const deckCards = useAppSelector((state: RootState) =>
    isPlayer ? state.game.playerOne.DeckSize : state.game.playerTwo.DeckSize
  );
  const deckBack = useAppSelector((state: RootState) =>
    isPlayer ? state.game.playerOne.DeckBack : state.game.playerTwo.DeckBack
  );

  if (deckCards === undefined || deckCards === 0) {
    return <div className={styles.deckZone}>Deck</div>;
  }

  return (
    <div className={styles.deckZone}>
      <CardDisplay
        card={deckBack}
        num={showCount ? deckCards : undefined}
        preventUseOnClick
      />
    </div>
  );
});

export default DeckZone;

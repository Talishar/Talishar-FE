import React from 'react';
import { useAppDispatch, useAppSelector } from 'app/Hooks';
import { RootState } from 'app/Store';
import Displayrow from 'interface/Displayrow';
import CardDisplay from '../../elements/cardDisplay/CardDisplay';
import styles from './DeckZone.module.css';
import { setCardListFocus } from 'features/game/GameSlice';

export const DeckZone = React.memo((prop: Displayrow) => {
  const { isPlayer } = prop;
  const dispatch = useAppDispatch();

  const showCount = true;

  const deckCards = useAppSelector((state: RootState) =>
    isPlayer ? state.game.playerOne.DeckSize : state.game.playerTwo.DeckSize
  );
  const deckBack = useAppSelector((state: RootState) =>
    isPlayer ? state.game.playerOne.DeckBack : state.game.playerTwo.DeckBack
  );

  const deckZone = useAppSelector((state: RootState) =>
    isPlayer ? state.game.playerOne.Deck : state.game.playerTwo.Deck
  );

  const shufflingPlayerId = useAppSelector((state: RootState) => state.game.shufflingPlayerId);
  const isShuffling = useAppSelector((state: RootState) => state.game.isShuffling);
  const playerID = useAppSelector((state: RootState) => state.game.gameInfo.playerID);
  const otherPlayerID = useAppSelector((state: RootState) => state.game.gameInfo.playerID === 1 ? 2 : 1);

  const shouldAnimateShuffling = isShuffling && (
    (isPlayer && shufflingPlayerId === playerID) ||
    (!isPlayer && shufflingPlayerId === otherPlayerID)
  );

  if (deckCards === undefined || deckCards === 0) {
    return <div className={styles.deckZone}>Deck</div>;
  }

  const deckZoneDisplay = () => {
    if (deckZone?.length === 0) return;
    const isPlayerPronoun = isPlayer ? 'Your' : "Opponent's";
    dispatch(
      setCardListFocus({
        cardList: deckZone,
        name: `${isPlayerPronoun} Deck`
      })
    );
  };
  return (
    <div className={styles.deckZone} onClick={deckZoneDisplay}>
      <CardDisplay
        card={deckBack}
        num={showCount ? deckCards : undefined}
        isShuffling={shouldAnimateShuffling} 
      />
    </div>
  );
});

export default DeckZone;

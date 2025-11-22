import React from 'react';
import { RootState } from 'app/Store';
import Displayrow from 'interface/Displayrow';
import { setCardListFocus, clearCardListFocus } from 'features/game/GameSlice';
import CardDisplay from '../../elements/cardDisplay/CardDisplay';
import styles from './GraveyardZone.module.css';
import { useAppDispatch, useAppSelector } from 'app/Hooks';

export const GraveyardZone = React.memo((prop: Displayrow) => {
  const { isPlayer } = prop;
  const dispatch = useAppDispatch();

  const graveyardZone = useAppSelector((state: RootState) =>
    isPlayer ? state.game.playerOne.Graveyard : state.game.playerTwo.Graveyard
  );

  const cardListFocus = useAppSelector((state: RootState) => state.game.cardListFocus);

  if (graveyardZone === undefined || graveyardZone.length === 0) {
    return <div className={styles.graveyardZone}>Graveyard</div>;
  }

  const showCount = true;

  const graveyardZoneDisplay = () => {
    const isPlayerPronoun = isPlayer ? 'Your' : "Opponent's";
    const zoneTitle = `${isPlayerPronoun} Graveyard`;

    // Check if this zone is already open
    if (cardListFocus?.active && cardListFocus?.name === zoneTitle) {
      // Close it
      dispatch(clearCardListFocus());
    } else {
      // Open it
      dispatch(
        setCardListFocus({
          cardList: graveyardZone,
          name: zoneTitle
        })
      );
    }
  };

  const cardToDisplay = { ...graveyardZone[0], borderColor: '' };

  // Count only face-up cards (overlay !== 'disabled')
  const faceUpCount = graveyardZone.filter(card => card.overlay !== 'disabled').length;

  return (
    <div className={styles.graveyardZone} onClick={graveyardZoneDisplay}>
      <CardDisplay
        card={cardToDisplay}
        isPlayer={isPlayer}
        num={showCount ? faceUpCount : undefined}
        preventUseOnClick
      />
    </div>
  );
});

export default GraveyardZone;

import React from 'react';
import { useAppDispatch, useAppSelector } from 'app/Hooks';
import { RootState } from 'app/Store';
import { setCardListFocus, clearCardListFocus } from 'features/game/GameSlice';
import Displayrow from 'interface/Displayrow';
import CardDisplay from '../../elements/cardDisplay/CardDisplay';
import styles from './BanishZone.module.css';

export const BanishZone = React.memo((prop: Displayrow) => {
  const { isPlayer } = prop;
  const dispatch = useAppDispatch();
  const showCount = true;

  const banishZone = useAppSelector((state: RootState) =>
    isPlayer ? state.game.playerOne.Banish : state.game.playerTwo.Banish
  );

  const cardListFocus = useAppSelector((state: RootState) => state.game.cardListFocus);

  if (banishZone === undefined || banishZone.length === 0) {
    return <div className={styles.banishZone}>Banish</div>;
  }

  const banishZoneDisplay = () => {
    const isPlayerPronoun = isPlayer ? 'Your' : "Opponent's";
    const zoneTitle = `${isPlayerPronoun} Banish Zone`;

    // Check if this zone is already open
    if (cardListFocus?.active && cardListFocus?.name === zoneTitle) {
      // Close it
      dispatch(clearCardListFocus());
    } else {
      // Open it
      dispatch(
        setCardListFocus({
          cardList: banishZone,
          name: zoneTitle
        })
      );
    }
  };

  const cardToDisplay = { ...banishZone[0], borderColor: '' };

  // Count only face-up cards (overlay !== 'disabled')
  const faceUpCount = banishZone.filter(card => card.overlay !== 'disabled').length;

  return (
    <div className={styles.banishZone} onClick={banishZoneDisplay}>
      <CardDisplay
        card={cardToDisplay}
        isPlayer={isPlayer}
        num={showCount ? faceUpCount : undefined}
        preventUseOnClick
      />
    </div>
  );
});

export default BanishZone;

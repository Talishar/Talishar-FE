import React from 'react';
import { RootState } from 'app/Store';
import Displayrow from 'interface/Displayrow';
import { setCardListFocus } from 'features/game/GameSlice';
import CardDisplay from '../../elements/cardDisplay/CardDisplay';
import styles from './GraveyardZone.module.css';
import { useAppDispatch, useAppSelector } from 'app/Hooks';

export const GraveyardZone = React.memo((prop: Displayrow) => {
  const { isPlayer } = prop;
  const dispatch = useAppDispatch();

  const graveyardZone = useAppSelector((state: RootState) =>
    isPlayer ? state.game.playerOne.Graveyard : state.game.playerTwo.Graveyard
  );

  if (graveyardZone === undefined || graveyardZone.length === 0) {
    return <div className={styles.graveyardZone}>Graveyard</div>;
  }

  const showCount = true;

  const graveyardZoneDisplay = () => {
    const isPlayerPronoun = isPlayer ? 'Your' : "Opponent's";
    dispatch(
      setCardListFocus({
        cardList: graveyardZone,
        name: `${isPlayerPronoun} Graveyard`
      })
    );
  };

  const cardToDisplay = { ...graveyardZone[0], borderColor: '' };

  return (
    <div className={styles.graveyardZone} onClick={graveyardZoneDisplay}>
      <CardDisplay
        card={cardToDisplay}
        isPlayer={isPlayer}
        num={showCount ? graveyardZone.length : undefined}
        preventUseOnClick
      />
    </div>
  );
});

export default GraveyardZone;

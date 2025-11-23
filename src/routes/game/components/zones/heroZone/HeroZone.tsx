import React, { useEffect, useRef } from 'react';
import { useAppSelector, useAppDispatch } from 'app/Hooks';
import { RootState } from 'app/Store';
import Displayrow from 'interface/Displayrow';
import CardDisplay from '../../elements/cardDisplay/CardDisplay';
import DamagePopup from '../../elements/damagePopup/DamagePopup';
import HealingPopup from '../../elements/healingPopup/HealingPopup';
import { removeDamagePopup, addDamagePopup, addHealingPopup, removeHealingPopup } from 'features/game/GameSlice';
import styles from './HeroZone.module.css';

export const HeroZone = React.memo((prop: Displayrow) => {
  const { isPlayer } = prop;
  const dispatch = useAppDispatch();
  const previousHealthRef = useRef<number | undefined>();

  const cardToDisplay = useAppSelector((state: RootState) =>
    isPlayer ? state.game.playerOne.Hero : state.game.playerTwo.Hero
  );

  // Use the same logic as HealthDisplay/TurnWidget - isPlayer determines the health
  const health = useAppSelector((state: RootState) =>
    isPlayer ? state.game.playerOne.Health : state.game.playerTwo.Health
  );

  const damagePopups = useAppSelector((state: RootState) => {
    const popups = isPlayer
      ? state.game.damagePopups?.playerOne
      : state.game.damagePopups?.playerTwo;
    return Array.isArray(popups) ? popups : [];
  });

  const healingPopups = useAppSelector((state: RootState) => {
    const popups = isPlayer
      ? state.game.healingPopups?.playerOne
      : state.game.healingPopups?.playerTwo;
    return Array.isArray(popups) ? popups : [];
  });

  // Track health changes and spawn damage/healing popups
  useEffect(() => {
    if (previousHealthRef.current !== undefined && health !== undefined) {
      const healthDifference = previousHealthRef.current - health;
      if (healthDifference > 0) {
        dispatch(
          addDamagePopup({
            isPlayer,
            amount: healthDifference
          })
        );
      } else if (healthDifference < 0) {
        dispatch(
          addHealingPopup({
            isPlayer,
            amount: Math.abs(healthDifference)
          })
        );
      }
    }
    previousHealthRef.current = health;
  }, [health, dispatch, isPlayer]);

  const handleDamagePopupComplete = (id: string) => {
    dispatch(removeDamagePopup({ isPlayer, id }));
  };

  const handleHealingPopupComplete = (id: string) => {
    dispatch(removeHealingPopup({ isPlayer, id }));
  };

  return (
    <div className={styles.heroZone}>
      <CardDisplay card={cardToDisplay} />
      {damagePopups.map((popup) => (
        <DamagePopup
          key={popup.id}
          id={popup.id}
          amount={popup.amount}
          onComplete={handleDamagePopupComplete}
        />
      ))}
      {healingPopups.map((popup) => (
        <HealingPopup
          key={popup.id}
          id={popup.id}
          amount={popup.amount}
          onComplete={handleHealingPopupComplete}
        />
      ))}
    </div>
  );
});

export default HeroZone;

import React from 'react';
import classNames from 'classnames';
import { useAppSelector } from 'app/Hooks';
import { RootState } from 'app/Store';
import Displayrow from 'interface/Displayrow';
import CardDisplay from '../../elements/cardDisplay/CardDisplay';
import { Card } from 'features/Card';
import styles from './ArsenalZone.module.css';
import { useTranslation } from 'react-i18next';
import DestroyAnimation from '../../elements/destroyAnimation/DestroyAnimation';
import { useZonePlayerID } from '../../elements/destroyAnimation/useEquipDestroy';

const EXTRA_ARSENAL_ZONE_CARDS = new Set(['new_horizon']);

function ArsenalZone(prop: Displayrow) {
  const { isPlayer } = prop;
  const { t } = useTranslation();

  const arsenalCards = useAppSelector((state: RootState) => {
    return isPlayer
      ? state.game.playerOne.Arsenal
      : state.game.playerTwo.Arsenal;
  });

  const hasExtraZone = useAppSelector((state: RootState) => {
    const player = isPlayer ? state.game.playerOne : state.game.playerTwo;
    return [
      player.HeadEq,
      player.ChestEq,
      player.ArmsEq,
      player.LegsEq,
      player.WeaponLEq,
      player.WeaponREq
    ].some(
      (card) =>
        !!card &&
        !card.isBroken &&
        EXTRA_ARSENAL_ZONE_CARDS.has(card.cardNumber)
    );
  });

  const arsenalFlipP1Card = useAppSelector(
    (state: RootState) => state.game.arsenalFlipP1Card
  );
  const arsenalFlipP2Card = useAppSelector(
    (state: RootState) => state.game.arsenalFlipP2Card
  );
  const arsenalFlipTrigger = useAppSelector(
    (state: RootState) => state.game.arsenalFlipTrigger
  );
  const arsenalDestroyP1Card = useAppSelector(
    (state: RootState) => state.game.arsenalDestroyP1Card
  );
  const arsenalDestroyP2Card = useAppSelector(
    (state: RootState) => state.game.arsenalDestroyP2Card
  );
  const arsenalDestroyTrigger = useAppSelector(
    (state: RootState) => state.game.arsenalDestroyTrigger
  );

  const currentPlayerID = useZonePlayerID(isPlayer);
  const flipCard =
    currentPlayerID === 1 ? arsenalFlipP1Card : arsenalFlipP2Card;
  const showFlip = !!flipCard;
  const destroyCard =
    currentPlayerID === 1 ? arsenalDestroyP1Card : arsenalDestroyP2Card;

  const cards: Card[] =
    arsenalCards === undefined ||
    arsenalCards.length === 0 ||
    arsenalCards[0].cardNumber === ''
      ? []
      : arsenalCards;

  const renderCard = (card: Card, index: number) => {
    // Check if this card is currently animating
    const isAnimatingThisCard = showFlip && card.cardNumber === flipCard;

    return (
      <div key={index} className={styles.cardWrapper}>
        {/* Hide the actual card while animation is playing */}
        {!isAnimatingThisCard && (
          <CardDisplay card={card} isPlayer={isPlayer} />
        )}
        {/* Show animation overlay while animating */}
        {isAnimatingThisCard && (
          <div
            key={`arsenalFlipAnimation-${arsenalFlipTrigger}`}
            className={styles.arsenalFlipCard}
          >
            <CardDisplay card={{ cardNumber: flipCard }} isPlayer={isPlayer} />
          </div>
        )}
      </div>
    );
  };

  const destroySlot = destroyCard && (
    <div className={styles.arsenalDestroySlot}>
      <DestroyAnimation
        key={`arsenalDestroyAnim-${arsenalDestroyTrigger}`}
        cardNumber={destroyCard}
        isPlayer={isPlayer}
      />
    </div>
  );

  if (hasExtraZone) {
    const slots = [cards.slice(0, 1), cards.slice(1)];
    return (
      <div className={classNames(styles.arsenalContainer, styles.splitArsenal)}>
        {slots.map((slotCards, slot) => (
          <div key={slot} className={styles.arsenalZone}>
            {slotCards.length === 0
              ? t('ZONES.ARSENAL')
              : slotCards.map((card, i) => renderCard(card, slot + i))}
            {slot === 0 && destroySlot}
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className={styles.arsenalContainer}>
      <div className={styles.arsenalZone}>
        {cards.length === 0 ? t('ZONES.ARSENAL') : cards.map(renderCard)}
        {destroySlot}
      </div>
    </div>
  );
}

export default React.memo(ArsenalZone);

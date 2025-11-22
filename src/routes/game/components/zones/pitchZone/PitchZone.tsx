import React from 'react';
import { RootState } from 'app/Store';
import Displayrow from 'interface/Displayrow';
import CardDisplay from '../../elements/cardDisplay/CardDisplay';
import { setCardListFocus, clearCardListFocus } from 'features/game/GameSlice';
import styles from './PitchZone.module.css';
import PitchDisplay from '../../elements/pitchDisplay/PitchDisplay';
import { useAppDispatch, useAppSelector } from 'app/Hooks';
import { motion, AnimatePresence } from 'framer-motion';

export default function PitchZone(prop: Displayrow) {
  const { isPlayer } = prop;
  const { DisplayRow } = prop;
  const dispatch = useAppDispatch();

  const pitchZone = useAppSelector((state: RootState) =>
    isPlayer ? state.game.playerOne.Pitch : state.game.playerTwo.Pitch
  );

  const cardListFocus = useAppSelector((state: RootState) => state.game.cardListFocus);

  let pitchAmount = useAppSelector((state: RootState) =>
    isPlayer
      ? state.game.playerOne.PitchRemaining
      : state.game.playerTwo.PitchRemaining
  );
  const numericPitch = Number(pitchAmount);

  if (
    (pitchZone === undefined ||
    pitchZone.length === 0 ||
    pitchZone[0].cardNumber === 'blankZone') &&
    numericPitch === 0
  ) {
    return (
      <>
        <div className={styles.pitchZone}>
          Pitch
        </div>
      </>
    );
  }

  const pitchZoneDisplay = () => {
    const isPlayerPronoun = isPlayer ? 'Your' : "Opponent's";
    const zoneTitle = `${isPlayerPronoun} Pitch`;

    // Check if this zone is already open
    if (cardListFocus?.active && cardListFocus?.name === zoneTitle) {
      // Close it
      dispatch(clearCardListFocus());
    } else {
      // Open it
      dispatch(
        setCardListFocus({
          cardList: pitchZone,
          name: zoneTitle
        })
      );
    }
  };

  const pitchOrder = pitchZone ? [...pitchZone].reverse() : [];
  const numInPitch = pitchZone ? pitchZone.length : 0;
  const cardToDisplay = numInPitch > 0 ? { ...pitchZone![numInPitch - 1], borderColor: '' } : null;

  return (
    <div className={styles.pitchZone} onClick={pitchZoneDisplay}>
      <AnimatePresence>
        {pitchOrder.slice(0, 4).map((card, ix) => {
          return (
            <motion.div
              style={{ top: `-${1.5 * ix}em`, zIndex: `-${ix + 1}` }}
              className={styles.pitchCard}
              initial={{ y: `${1.5 * ix}em` }}
              animate={{ y: 0 }}
              transition={{ ease: 'easeIn', duration: 0.2 }}
              exit={{ opacity: 0 }}
              key={`${card.cardNumber}-${ix}`}
              data-testid='pitch-motion-div'
            >
              <CardDisplay card={card} preventUseOnClick />
            </motion.div>
          );
        })}
      </AnimatePresence>
      <PitchDisplay isPlayer={isPlayer} DisplayRow={DisplayRow} />
    </div>
  );
}

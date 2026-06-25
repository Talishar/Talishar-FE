import React from 'react';
import { RootState } from 'app/Store';
import Displayrow from 'interface/Displayrow';
import CardDisplay from '../../elements/cardDisplay/CardDisplay';
import { setCardListFocus, clearCardListFocus } from 'features/game/GameSlice';
import styles from './PitchZone.module.css';
import PitchDisplay from '../../elements/pitchDisplay/PitchDisplay';
import { useAppDispatch, useAppSelector } from 'app/Hooks';
import { motion, AnimatePresence } from 'framer-motion';

const PITCH_ANIMATE = { y: 0 };
const PITCH_TRANSITION = { ease: 'easeIn', duration: 0.2 };
const PITCH_EXIT = { opacity: 0 };

const PITCH_CARD_STYLES: React.CSSProperties[] = [
  { top: '0em',    zIndex: '-1' },
  { top: '-1.5em', zIndex: '-2' },
  { top: '-3em',   zIndex: '-3' },
  { top: '-4.5em', zIndex: '-4' },
];
const PITCH_CARD_INITIALS = [
  { y: '0em' },
  { y: '1.5em' },
  { y: '3em' },
  { y: '4.5em' },
];

export default function PitchZone(prop: Displayrow) {
  const { isPlayer } = prop;
  const { DisplayRow } = prop;
  const dispatch = useAppDispatch();

  const pitchZone = useAppSelector((state: RootState) =>
    isPlayer ? state.game.playerOne.Pitch : state.game.playerTwo.Pitch
  );

  const cardListFocus = useAppSelector(
    (state: RootState) => state.game.cardListFocus
  );

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
        <div className={styles.pitchZone}>Pitch</div>
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

  return (
    <div className={styles.pitchZone} onClick={pitchZoneDisplay}>
      <AnimatePresence>
        {pitchOrder.slice(0, 4).map((card, ix) => {
          return (
            <motion.div
              style={PITCH_CARD_STYLES[ix]}
              className={styles.pitchCard}
              initial={PITCH_CARD_INITIALS[ix]}
              animate={PITCH_ANIMATE}
              transition={PITCH_TRANSITION}
              exit={PITCH_EXIT}
              key={`${card.cardNumber}-${ix}`}
              data-testid="pitch-motion-div"
            >
              <CardDisplay card={card} preventUseOnClick isPlayer={isPlayer} />
            </motion.div>
          );
        })}
      </AnimatePresence>
      <PitchDisplay isPlayer={isPlayer} DisplayRow={DisplayRow} />
    </div>
  );
}

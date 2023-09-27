import React from 'react';
import { RootState } from 'app/Store';
import Displayrow from 'interface/Displayrow';
import CardDisplay from '../../elements/cardDisplay/CardDisplay';
import { setCardListFocus, submitButton } from 'features/game/GameSlice';
import styles from './PitchZone.module.css';
import PitchDisplay from '../../elements/pitchDisplay/PitchDisplay';
import { useAppDispatch, useAppSelector } from 'app/Hooks';
import { motion, AnimatePresence } from 'framer-motion';
import useSetting from 'hooks/useSetting';
import { MANUAL_MODE } from 'features/options/constants';
import { PROCESS_INPUT } from 'appConstants';
import { AiOutlineMinus, AiOutlinePlus } from 'react-icons/ai';

export default function PitchZone(prop: Displayrow) {
  const { isPlayer } = prop;
  const { DisplayRow } = prop;
  const dispatch = useAppDispatch();
  const isManualMode = useSetting({ settingName: MANUAL_MODE })?.value === '1';

  const pitchZone = useAppSelector((state: RootState) =>
    isPlayer ? state.game.playerOne.Pitch : state.game.playerTwo.Pitch
  );

  if (
    pitchZone === undefined ||
    pitchZone.length === 0 ||
    pitchZone[0].cardNumber === 'blankZone'
  ) {
    return (
      <>
        <div className={styles.pitchZone}>
          <PitchDisplay isPlayer={isPlayer} DisplayRow={DisplayRow} />
          {isManualMode && <ManualMode isPlayer={isPlayer} />}
        </div>
      </>
    );
  }

  const pitchZoneDisplay = () => {
    const isPlayerPronoun = isPlayer ? 'Your' : "Your Opponent's";
    dispatch(
      setCardListFocus({
        cardList: pitchZone,
        name: `${isPlayerPronoun} Pitch Zone`
      })
    );
  };

  const pitchOrder = [...pitchZone].reverse();
  const numInPitch = pitchZone.length;
  const cardToDisplay = { ...pitchZone[numInPitch - 1], borderColor: '' };

  return (
    <div className={styles.pitchZone} onClick={pitchZoneDisplay}>
      <AnimatePresence>
        {pitchOrder.map((card, ix) => {
          return (
            <motion.div
              style={{ top: `-${2 * ix}em`, zIndex: `-${ix + 1}` }}
              className={styles.pitchCard}
              initial={{ y: `${2 * ix}em` }}
              animate={{ y: 0 }}
              transition={{ ease: 'easeIn', duration: 0.2 }}
              exit={{ opacity: 0 }}
              key={`${card.cardNumber}-${ix}`}
            >
              <CardDisplay card={card} num={ix} preventUseOnClick />
            </motion.div>
          );
        })}
      </AnimatePresence>
      <PitchDisplay isPlayer={isPlayer} DisplayRow={DisplayRow} />
      {isManualMode && <ManualMode isPlayer={isPlayer} />}
    </div>
  );
}

const ManualMode = ({ isPlayer }: { isPlayer: Boolean }) => {
  const dispatch = useAppDispatch();
  const onAddResourceClick = (
    e: React.MouseEvent<HTMLButtonElement, MouseEvent>
  ) => {
    e.preventDefault();
    e.stopPropagation();
    dispatch(
      submitButton({
        button: {
          mode: isPlayer
            ? PROCESS_INPUT.ADD_RESOURCE_TO_POOL_SELF
            : PROCESS_INPUT.ADD_RESOURCE_TO_POOL_OPPONENT
        }
      })
    );
  };
  const onSubtractResourceClick = (
    e: React.MouseEvent<HTMLButtonElement, MouseEvent>
  ) => {
    e.preventDefault();
    e.stopPropagation();
    dispatch(
      submitButton({
        button: {
          mode: isPlayer
            ? PROCESS_INPUT.REMOVE_RESOURCE_FROM_POOL_SELF
            : PROCESS_INPUT.REMOVE_RESOURCE_FROM_POOL_OPPONENT
        }
      })
    );
  };
  return (
    <div className={styles.manualMode}>
      <button className={styles.drawButton} onClick={onAddResourceClick}>
        <AiOutlinePlus />
      </button>
      <button className={styles.drawButton} onClick={onSubtractResourceClick}>
        <AiOutlineMinus />
      </button>
    </div>
  );
};

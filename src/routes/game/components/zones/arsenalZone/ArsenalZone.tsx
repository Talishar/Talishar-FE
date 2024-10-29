import React from 'react';
import { useAppDispatch, useAppSelector } from 'app/Hooks';
import { RootState } from 'app/Store';
import Displayrow from 'interface/Displayrow';
import CardDisplay from '../../elements/cardDisplay/CardDisplay';
import { Card } from 'features/Card';
import styles from './ArsenalZone.module.css';
import {
  getGameInfo,
  submitButton
} from '../../../../../features/game/GameSlice';
import Button from '../../../../../features/Button';
import { AnimatePresence, motion } from 'framer-motion';
import useWindowDimensions from '../../../../../hooks/useWindowDimensions';
import { PROCESS_INPUT } from 'appConstants';
import { AiOutlineMinus, AiOutlinePlus } from 'react-icons/ai';
import useSetting from 'hooks/useSetting';
import { MANUAL_MODE } from 'features/options/constants';

export default function ArsenalZone(prop: Displayrow) {
  const { isPlayer } = prop;

  const isSpectator = useAppSelector((state: RootState) => {
    return state.game.gameInfo.playerID === 3;
  });

  const isManualMode = useSetting({ settingName: MANUAL_MODE })?.value === '1';

  const arsenalCards = useAppSelector((state: RootState) => {
    return isPlayer
      ? state.game.playerOne.Arsenal
      : state.game.playerTwo.Arsenal;
  });

  const [width, height] = useWindowDimensions();
  const isPortrait = height > width;

  if (
    arsenalCards === undefined ||
    arsenalCards.length === 0 ||
    arsenalCards[0].cardNumber === ''
  ) {
    return (
      <div className={styles.arsenalContainer}>
        <div className={styles.arsenalZone}>Arsenal</div>
        {!isPortrait && <ArsenalPrompt />}
      </div>
    );
  }

  return (
    <div className={styles.arsenalContainer}>
      <div className={styles.arsenalZone}>
        {arsenalCards.map((card: Card, index) => {
          // if it doesn't belong to us we don't need to know if it's faceup or facedown.
          const cardCopy = { ...card };
          return (
            <CardDisplay card={cardCopy} key={index} isPlayer={isPlayer} />
          );
        })}
      </div>
      {isManualMode && <ManualMode />}
      <ArsenalPrompt />
    </div>
  );
}

const ArsenalPrompt = () => {
  const playerPrompt = useAppSelector(
    (state: RootState) => state.game.playerPrompt
  );
  const turnPhase = useAppSelector(
    (state: RootState) => state.game.turnPhase?.turnPhase
  );
  const gameInfo = useAppSelector(getGameInfo);

  const oldCombatChain = useAppSelector((state: RootState) => state.game.oldCombatChain) ?? [];
  const activeCombatChain = useAppSelector((state: RootState) => state.game.activeChainLink);
  const showCombatChain = oldCombatChain?.length > 0 || (activeCombatChain?.attackingCard && activeCombatChain?.attackingCard?.cardNumber !== 'blank');

  const dispatch = useAppDispatch();

  const clickButton = (button: Button) => {
    dispatch(submitButton({ button: button }));
  };

  const showPrompt =
    (gameInfo.playerID !== 3 && turnPhase === 'ARS') ||
    turnPhase === 'CHOOSEHAND' ||
    turnPhase === 'MAYCHOOSEHAND' ||
    playerPrompt?.helpText?.includes('Opponent is inactive');

  const buttons = playerPrompt?.buttons?.map((button, ix) => {
    return (
      <div
        className={styles.buttonDiv}
        onClick={() => {
          clickButton(button);
        }}
        key={ix.toString()}
      >
        {button.caption}
      </div>
    );
  });

  return (
    <AnimatePresence>
      {showPrompt && !showCombatChain && (
        <motion.div
          className={styles.playerPrompt}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <div className={styles.content}>
            <div
              dangerouslySetInnerHTML={{ __html: playerPrompt?.helpText ?? '' }}
            ></div>
          </div>
          {buttons}
        </motion.div>
      )}
    </AnimatePresence>
  );
};

const ManualMode = () => {
  const dispatch = useAppDispatch();
  const onRemoveArsenalClick = (
    e: React.MouseEvent<HTMLButtonElement, MouseEvent>
  ) => {
    e.preventDefault();
    e.stopPropagation();
    dispatch(
      submitButton({
        button: {
          mode: PROCESS_INPUT.REMOVE_ARSENAL_FROM_SELF
        }
      })
    );
  };
  return (
    <div className={styles.manualMode}>
      <button className={styles.drawButton} onClick={onRemoveArsenalClick}>
        Remove Arsenal
      </button>
    </div>
  );
};

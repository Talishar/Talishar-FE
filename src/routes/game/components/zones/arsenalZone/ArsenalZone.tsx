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
import { parseHtmlToReactElements } from 'utils/ParseEscapedString';

export default function ArsenalZone(prop: Displayrow) {
  const { isPlayer } = prop;

  const isSpectator = useAppSelector((state: RootState) => {
    return state.game.gameInfo.playerID === 3;
  });

  const arsenalCards = useAppSelector((state: RootState) => {
    return isPlayer
      ? state.game.playerOne.Arsenal
      : state.game.playerTwo.Arsenal;
  });

  const playerID = useAppSelector((state: RootState) => state.game.gameInfo.playerID);
  const otherPlayerID = useAppSelector((state: RootState) => state.game.gameInfo.playerID === 1 ? 2 : 1);
  const arsenalFlipP1Card = useAppSelector((state: RootState) => state.game.arsenalFlipP1Card);
  const arsenalFlipP2Card = useAppSelector((state: RootState) => state.game.arsenalFlipP2Card);
  const arsenalFlipTrigger = useAppSelector((state: RootState) => state.game.arsenalFlipTrigger);

  const currentPlayerID = isPlayer ? playerID : otherPlayerID;
  const flipCard = currentPlayerID === 1 ? arsenalFlipP1Card : arsenalFlipP2Card;
  const showFlip = !!flipCard;

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
          // Check if this card is currently animating
          const isAnimatingThisCard = showFlip && card.cardNumber === flipCard;
          
          return (
            <div key={index} className={styles.cardWrapper}>
              {/* Hide the actual card while animation is playing */}
              {!isAnimatingThisCard && (
                <CardDisplay card={cardCopy} isPlayer={isPlayer} />
              )}
              {/* Show animation overlay while animating */}
              {isAnimatingThisCard && (
                <div 
                  key={`arsenalFlipAnimation-${arsenalFlipTrigger}`}
                  className={styles.arsenalFlipCard}
                >
                  <CardDisplay
                    card={{ cardNumber: flipCard }}
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>
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
    turnPhase === 'MAYCHOOSEHANDHEAVE'
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
            <div>
              {parseHtmlToReactElements(playerPrompt?.helpText ?? '')}
            </div>
          </div>
          {buttons}
        </motion.div>
      )}
    </AnimatePresence>
  );
};

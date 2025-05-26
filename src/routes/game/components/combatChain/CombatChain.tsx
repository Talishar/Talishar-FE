import React from 'react';
import styles from './CombatChain.module.css';
import ChainLinks from '../elements/chainLinks/ChainLinks';
import CurrentAttack from '../elements/currentAttack/CurrentAttack';
import Reactions from '../elements/reactions/Reactions';
import { useAppDispatch, useAppSelector } from '../../../../app/Hooks';
import { RootState } from 'app/Store';
import { motion, AnimatePresence } from 'framer-motion';
import { BsArrowUpSquareFill, BsArrowDownSquareFill } from 'react-icons/bs';
import Button from '../../../../features/Button';
import { submitButton } from '../../../../features/game/GameSlice';
import useWindowDimensions from '../../../../hooks/useWindowDimensions';

export default function CombatChain() {
  const oldCombatChain =
    useAppSelector((state: RootState) => state.game.oldCombatChain) ?? [];
  const activeCombatChain = useAppSelector(
    (state: RootState) => state.game.activeChainLink
  );
  const [canSkipBlock] = React.useState(false);
  const [canSkipBlockAndDef] = React.useState(false);
  const [position, setPosition] = React.useState('default');

  const handleChangePositionClick = (newPosition: 'up' | 'down') => {
    if (newPosition === 'up') {
      if (position === 'down') {
        setPosition('default');
      } else {
        setPosition('up');
      }
    } else if (newPosition === 'down') {
      if (position === 'up') {
        setPosition('default');
      } else {
        setPosition('down');
      }
    }
  };

  const [width, height] = useWindowDimensions();
  const isPortrait = height > width;

  const showCombatChain =
    oldCombatChain?.length > 0 ||
    (activeCombatChain?.attackingCard &&
      activeCombatChain?.attackingCard?.cardNumber !== 'blank');
  return (
    <AnimatePresence>
      {showCombatChain && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={
            position === 'up'
              ? { opacity: 1, x: 0, y: '-30dvh' }
              : position === 'down'
              ? { opacity: 1, x: 0, y: '20dvh' }
              : position === 'default'
              ? { opacity: 1, x: 0, y: '-10dvh' }
              : { opacity: 1, x: 0, y: '-10dvh' }
          }
          transition={{ type: 'tween' }}
          exit={{ opacity: 0 }}
          className={styles.combatChain}
        >
          <CurrentAttack />
          <div className={styles.chainCentre}>
            <ChainLinks />
            <Reactions />
          </div>
          <div className={styles.grabbyHandle}>
                <div className={styles.grabbyHandleButtonContainer}>
              {(position !== 'up') && (
                <div
                  className={styles.grabbyHandleButton}
                  onClick={() => handleChangePositionClick('up')}
                >
                  <BsArrowUpSquareFill />
                </div>
              )}
            </div>
                <div className={styles.grabbyHandleButtonContainer}>
              {(position !== 'down') && (
                <div
                  className={styles.grabbyHandleButton}
                  onClick={() => handleChangePositionClick('down')}
                >
                  <BsArrowDownSquareFill />
                </div>
              )}
            </div>
          </div>
          {canSkipBlock ? <div className={styles.icon}></div> : <div></div>}
          {canSkipBlockAndDef ? (
            <div className={styles.icon}></div>
          ) : (
            <div></div>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}

const PlayerPrompt = () => {
  const playerPrompt = useAppSelector(
    (state: RootState) => state.game.playerPrompt
  );

  const dispatch = useAppDispatch();

  const clickButton = (button: Button) => {
    dispatch(submitButton({ button: button }));
  };

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
      <motion.div
        className={styles.playerPrompt}
        initial={{ opacity: '0' }}
        animate={{ opacity: '1' }}
        exit={{ opacity: '0' }}
        key={`${playerPrompt?.helpText?.substring(0, 10)}`}
      >
        <div className={styles.content}>
          <div
            dangerouslySetInnerHTML={{ __html: playerPrompt?.helpText ?? '' }}
          ></div>
        </div>
        {buttons}
      </motion.div>
    </AnimatePresence>
  );
};

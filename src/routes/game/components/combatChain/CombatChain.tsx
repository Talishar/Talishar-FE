import React from 'react';
import styles from './CombatChain.module.css';
import ChainLinks from '../elements/chainLinks/ChainLinks';
import CurrentAttack from '../elements/currentAttack/CurrentAttack';
import Reactions from '../elements/reactions/Reactions';
import { useCookies } from 'react-cookie';
import { useAppSelector } from '../../../../app/Hooks';
import { RootState } from 'app/Store';
import { motion, AnimatePresence } from 'framer-motion';
import { BsArrowUpSquareFill, BsArrowDownSquareFill } from 'react-icons/bs';

export default function CombatChain() {
  const oldCombatChain =
    useAppSelector((state: RootState) => state.game.oldCombatChain) ?? [];
  const activeCombatChain = useAppSelector(
    (state: RootState) => state.game.activeChainLink
  );
  const [isUp, setIsUp] = React.useState(false);
  const [canSkipBlock, setCanSkipBlock] = React.useState(false);
  const [canSkipBlockAndDef, setCanSkipBlockAndDef] = React.useState(false);
  const [cookies] = useCookies(['experimental']);

  const handleChangePositionClick = () => {
    setIsUp(!isUp);
  };

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
            isUp
              ? { opacity: 1, x: 0, y: '-30dvh' }
              : { opacity: 1, x: 0, y: 0 }
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
            {isUp ? (
              <div className={styles.icon} onClick={handleChangePositionClick}>
                <BsArrowDownSquareFill />
              </div>
            ) : (
              <div className={styles.icon} onClick={handleChangePositionClick}>
                <BsArrowUpSquareFill />
              </div>
            )}
            {canSkipBlock ? <div className={styles.icon}></div> : <div></div>}
            {canSkipBlockAndDef ? (
              <div className={styles.icon}></div>
            ) : (
              <div></div>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

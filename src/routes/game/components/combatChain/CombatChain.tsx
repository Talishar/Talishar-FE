import React from 'react';
import styles from './CombatChain.module.css';
import ChainLinks from '../elements/chainLinks/ChainLinks';
import CurrentAttack from '../elements/currentAttack/CurrentAttack';
import Reactions from '../elements/reactions/Reactions';
import { useCookies } from 'react-cookie';
import { useAppSelector } from '../../../../app/Hooks';
import { RootState } from 'app/Store';
import { motion, AnimatePresence } from 'framer-motion';

export default function CombatChain() {
  const oldCombatChain =
    useAppSelector((state: RootState) => state.game.oldCombatChain) ?? [];
  const activeCombatChain = useAppSelector(
    (state: RootState) => state.game.activeChainLink
  );
  const [cookies] = useCookies(['experimental']);

  const showCombatChain =
    oldCombatChain?.length > 0 ||
    (activeCombatChain?.attackingCard &&
      activeCombatChain?.attackingCard?.cardNumber !== 'blank');
  return (
    <AnimatePresence>
      {showCombatChain && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className={styles.combatChain}
          drag="y"
          dragConstraints={{ top: -300, bottom: 300 }}
        >
          <div className={styles.grabbyHandle}></div>
          <CurrentAttack />
          <div className={styles.chainCentre}>
            <ChainLinks />
            <Reactions />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

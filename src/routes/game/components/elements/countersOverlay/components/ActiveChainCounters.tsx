import React from 'react';
import CombatChainLink from "features/CombatChainLink"
import styles from '../CountersOverlay.module.css';
import { GiCycle, GiElectric, GiShield, GiZigzagLeaf } from 'react-icons/gi';
import { BiBullseye } from 'react-icons/bi';
type Props = {
  activeCombatChain?: CombatChainLink
}
export const ActiveCardCounterOverlay = (props: Props) => {
  const {
    activeCombatChain
  } = props;

  if(!activeCombatChain){ return null};
  return (
    <>
      {activeCombatChain.goAgain ? (
        <div className={styles.icon} data-tooltip="Go Again">
          <GiCycle />
        </div>
      ) : null}
      {activeCombatChain.dominate ? (
        <div className={styles.icon} data-tooltip="Dominate">
          <BiBullseye />
        </div>
      ) : null}
      {activeCombatChain.overpower ? (
        <div className={styles.icon} data-tooltip="Overpower">
          <GiElectric />
        </div>
      ) : null}
      {activeCombatChain.fused ? (
        <div className={styles.icon} data-tooltip="Fused">
          <GiZigzagLeaf />
        </div>
      ) : null}
      {activeCombatChain.damagePrevention ? (
        <div
          className={styles.icon}
          data-tooltip={`${activeCombatChain.damagePrevention} Damage Prevention`}
        >
          <GiShield />
          {activeCombatChain.damagePrevention}
        </div>
      ) : null}
    </>
  )
}
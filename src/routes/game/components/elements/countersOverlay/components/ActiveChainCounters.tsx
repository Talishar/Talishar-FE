import React from 'react';
import CombatChainLink from 'features/CombatChainLink';
import styles from '../CountersOverlay.module.css';
import {
  GiCycle,
  GiStomp,
  GiShieldReflect,
  GiShoulderArmor,
  GiZigzagLeaf,
  GiTwoCoins,
  GiGhost,
  GiMuscleFat 
} from 'react-icons/gi';
type Props = {
  activeCombatChain?: CombatChainLink;
};
export const ActiveCardCounterOverlay = (props: Props) => {
  const { activeCombatChain } = props;

  if (!activeCombatChain) {
    return null;
  }
  return (
    <>
      {activeCombatChain.goAgain && (
        <div className={styles.icon} data-tooltip="Go Again">
          <GiCycle />
        </div>
      )}
      {activeCombatChain.dominate && (
        <div className={styles.icon} data-tooltip="Dominate">
          <GiMuscleFat />
        </div>
      )}
      {activeCombatChain.overpower && (
        <div className={styles.icon} data-tooltip="Overpower">
          <GiStomp />
        </div>
      )}
      {activeCombatChain.wager && (
        <div className={styles.icon} data-tooltip="Wager">
          <GiTwoCoins />
        </div>
      )}
      {activeCombatChain.phantasm && (
        <div className={styles.icon} data-tooltip="Phantasm">
          <GiGhost />
        </div>
      )}
      {activeCombatChain.fusion && (
        <div className={styles.icon} data-tooltip="Fused">
          <GiZigzagLeaf />
        </div>
      )}
      {!!activeCombatChain.damagePrevention && (
        <div
          className={styles.icon}
          data-tooltip={`${activeCombatChain.damagePrevention} Damage Prevention`}
        >
          <GiShieldReflect />
          <div 
            className={styles.iconText}
          >
          {activeCombatChain.damagePrevention}
          </div>
        </div>
      )}
      {activeCombatChain.numRequiredEquipBlock && (
        <div
          className={styles.icon}
          data-tooltip={`Chain link must be defended with at least ${activeCombatChain.numRequiredEquipBlock} equipment`}
        >
          <GiShoulderArmor />
          {activeCombatChain.numRequiredEquipBlock}
        </div>
      )}
    </>
  );
};

import React from 'react';
import CombatChainLink from 'features/CombatChainLink';
import styles from '../CountersOverlay.module.css';
import {
  GiCycle,
  GiStomp,
  GiShieldReflect,
  GiShoulderArmor,
  GiZigzagLeaf,
  GiCash,
  GiGhost,
  GiMuscleFat,
  GiStoneTower,
  GiSpearfishing,
  GiNinjaStar
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
          <GiCash />
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
      {activeCombatChain.piercing && (
        <div className={styles.icon} data-tooltip="Piercing">
          <GiSpearfishing />
        </div>
      )}
      {activeCombatChain.tower && (
        <div className={styles.icon} data-tooltip="Tower Active">
          <GiStoneTower />
        </div>
      )}
      {activeCombatChain.combo && (
        <div className={styles.icon} data-tooltip="Combo Active">
          <GiNinjaStar />
        </div>
      )}
      {!!activeCombatChain.damagePrevention && (
        <div
          className={styles.icon}
          data-tooltip={`${activeCombatChain.damagePrevention} Damage Prevention`}
        >
          <GiShieldReflect />
          <div className={styles.iconTextCombatChain}>
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
          <div className={styles.iconText}>
            {activeCombatChain.numRequiredEquipBlock}
          </div>
        </div>
      )}
    </>
  );
};

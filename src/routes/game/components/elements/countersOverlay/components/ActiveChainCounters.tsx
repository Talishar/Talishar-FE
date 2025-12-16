import React from 'react';
import CombatChainLink from 'features/CombatChainLink';
import styles from '../CountersOverlay.module.css';
import { TooltipWrapper } from './TooltipWrapper';
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
  GiNinjaStar,
  GiWaterSplash,
  GiArmorPunch,
  GiGuitar
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
        <TooltipWrapper className={styles.icon} tooltip="Go Again">
          <GiCycle />
        </TooltipWrapper>
      )}
      {activeCombatChain.dominate && (
        <TooltipWrapper className={styles.icon} tooltip="Dominate">
          <GiMuscleFat />
        </TooltipWrapper>
      )}
      {activeCombatChain.overpower && (
        <TooltipWrapper className={styles.icon} tooltip="Overpower">
          <GiStomp />
        </TooltipWrapper>
      )}
      {activeCombatChain.confidence && (
        <TooltipWrapper className={styles.icon} tooltip="Confidence">
          <GiGuitar />
        </TooltipWrapper>
      )}
      {activeCombatChain.activeOnHits && (
        <TooltipWrapper className={styles.icon} tooltip="Active On Hit">
          <GiArmorPunch />
        </TooltipWrapper>
      )}
      {activeCombatChain.wager && (
        <TooltipWrapper className={styles.icon} tooltip="Wager">
          <GiCash />
        </TooltipWrapper>
      )}
      {activeCombatChain.phantasm && (
        <TooltipWrapper className={styles.icon} tooltip="Phantasm">
          <GiGhost />
        </TooltipWrapper>
      )}
      {activeCombatChain.fusion && (
        <TooltipWrapper className={styles.icon} tooltip="Fused">
          <GiZigzagLeaf />
        </TooltipWrapper>
      )}
      {activeCombatChain.piercing && (
        <TooltipWrapper className={styles.icon} tooltip="Piercing">
          <GiSpearfishing />
        </TooltipWrapper>
      )}
      {activeCombatChain.tower && (
        <TooltipWrapper className={styles.icon} tooltip="Tower Active">
          <GiStoneTower />
        </TooltipWrapper>
      )}
      {activeCombatChain.combo && (
        <TooltipWrapper className={styles.icon} tooltip="Combo Active">
          <GiNinjaStar />
        </TooltipWrapper>
      )}
      {activeCombatChain.highTide && (
        <TooltipWrapper className={styles.icon} tooltip="High Tide Active">
          <GiWaterSplash  />
        </TooltipWrapper>
      )}
      {!!activeCombatChain.damagePrevention && (
        <TooltipWrapper
          className={styles.icon}
          tooltip={`${activeCombatChain.damagePrevention} Damage Prevention`}
        >
          <GiShieldReflect />
          <div className={styles.iconTextCombatChain}>
            {activeCombatChain.damagePrevention}
          </div>
        </TooltipWrapper>
      )}
      {activeCombatChain.numRequiredEquipBlock && (
        <TooltipWrapper
          className={styles.icon}
          tooltip={`Chain link must be defended with at least ${activeCombatChain.numRequiredEquipBlock} equipment`}
        >
          <GiShoulderArmor />
          <div className={styles.iconText}>
            {activeCombatChain.numRequiredEquipBlock}
          </div>
        </TooltipWrapper>
      )}
    </>
  );
};

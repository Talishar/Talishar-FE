import React from 'react';
import CombatChainLink from 'features/CombatChainLink';
import styles from '../CountersOverlay.module.css';
import { TooltipWrapper } from './TooltipWrapper';
import { KeywordPopover } from '../../keywordPopover';
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
        <KeywordPopover id="go-again"><span className={styles.icon}>
          <GiCycle />
        </span></KeywordPopover>
      )}
      {activeCombatChain.dominate && (
        <KeywordPopover id="dominate"><span className={styles.icon}>
          <GiMuscleFat />
        </span></KeywordPopover>
      )}
      {activeCombatChain.overpower && (
        <KeywordPopover id="overpower"><span className={styles.icon}>
          <GiStomp />
        </span></KeywordPopover>
      )}
      {activeCombatChain.confidence && (
        <KeywordPopover id="confidence"><span className={styles.icon}>
          <GiGuitar />
        </span></KeywordPopover>
      )}
      {activeCombatChain.activeOnHits && (
        <KeywordPopover id="on-hit"><span className={styles.icon}>
          <GiArmorPunch />
        </span></KeywordPopover>
      )}
      {activeCombatChain.wager && (
        <KeywordPopover id="wager"><span className={styles.icon}>
          <GiCash />
        </span></KeywordPopover>
      )}
      {activeCombatChain.phantasm && (
        <KeywordPopover id="phantasm"><span className={styles.icon}>
          <GiGhost />
        </span></KeywordPopover>
      )}
      {activeCombatChain.fusion && (
        <KeywordPopover id="fusion"><span className={styles.icon}>
          <GiZigzagLeaf />
        </span></KeywordPopover>
      )}
      {activeCombatChain.piercing && (
        <KeywordPopover id="piercing"><span className={styles.icon}>
          <GiSpearfishing />
        </span></KeywordPopover>
      )}
      {activeCombatChain.tower && (
        <KeywordPopover id="tower"><span className={styles.icon}>
          <GiStoneTower />
        </span></KeywordPopover>
      )}
      {activeCombatChain.combo && (
        <KeywordPopover id="combo"><span className={styles.icon}>
          <GiNinjaStar />
        </span></KeywordPopover>
      )}
      {activeCombatChain.highTide && (
        <KeywordPopover id="high-tide"><span className={styles.icon}>
          <GiWaterSplash />
        </span></KeywordPopover>
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

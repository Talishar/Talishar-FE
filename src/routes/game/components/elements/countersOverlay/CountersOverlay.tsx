import React from 'react';
import { Card } from 'features/Card';
import styles from './CountersOverlay.module.css';
import GemSlider from '../gemSlider/GemSlider';
import { ActiveCardCounterOverlay } from './components/ActiveChainCounters';
import CombatChainLink from 'features/CombatChainLink';
import { ContinuousCounters } from './components/ContinuousCounters';
import { TooltipWrapper } from 'components/Tooltip/TooltipWrapper';
import { GiCycle, GiDialPadlock } from 'react-icons/gi';
import { formatRestriction } from 'data/keywords';
import { KeywordPopover } from '../keywordPopover';

const INCLUDED_COUNTERS = new Set([
  'defense',
  'steam',
  'life',
  'attack',
  'energy',
  'haunt',
  'verse',
  'doom',
  'lesson',
  'rust',
  'flow',
  'frost',
  'balance',
  'bind',
  'stain',
  'storm',
  'gold',
  'suspense',
  'sand',
  'lightning',
  'amp',
  'aim',
  'wateryGrave',
  'counters'
]);

export interface CountersProp extends Partial<Card> {
  num?: number;
  numDescription?: string;
  activeCombatChain?: CombatChainLink;
  excludeFancyCounters?: boolean;
  gemStackIDs?: string[];
}

export const CountersOverlay = React.memo(
  ({
    countersMap,
    label,
    gem,
    cardNumber,
    actionDataOverride,
    num,
    zone,
    activeCombatChain,
    goAgain,
    controller,
    restriction,
    excludeFancyCounters,
    gemStackIDs
  }: CountersProp) => {
    let numTotal = num ?? 0;
    if (countersMap && !excludeFancyCounters) {
      for (const counter in countersMap) {
        if (!INCLUDED_COUNTERS.has(counter)) {
          numTotal += Number(countersMap[counter]);
        }
      }
    }

    return (
      <div className={styles.countersCover}>
        {countersMap && (!excludeFancyCounters || countersMap?.amp) && (
          <ContinuousCounters
            countersMap={countersMap}
            excludeFancyCounters={excludeFancyCounters}
          />
        )}
        {activeCombatChain && (
          <ActiveCardCounterOverlay activeCombatChain={activeCombatChain} />
        )}
        {goAgain && (
          <KeywordPopover id="go-again">
            <span className={styles.icon}>
              <GiCycle />
            </span>
          </KeywordPopover>
        )}
        {!!restriction && (
          <TooltipWrapper
            className={styles.icon}
            tooltip={formatRestriction(restriction) || 'Restricted'}
          >
            <GiDialPadlock />
          </TooltipWrapper>
        )}
        {!!numTotal && (
          <div className={styles.number}>
            <div className={styles.text}>{numTotal}</div>
          </div>
        )}
        {label !== undefined && label !== '' && (
          <div className={styles.label}>{label}</div>
        )}
        {gem !== 'none' && (
          <GemSlider
            gem={gem}
            cardNumber={cardNumber}
            cardID={actionDataOverride}
            cardIDs={gemStackIDs}
            zone={zone}
            controller={controller}
          />
        )}
      </div>
    );
  }
);

CountersOverlay.displayName = 'CountersOverlay';
export default CountersOverlay;

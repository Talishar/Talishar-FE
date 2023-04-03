import React, { useRef } from 'react';
import { Card } from 'features/Card';
import styles from './CountersOverlay.module.css';
import GemSlider from '../gemSlider/GemSlider';
import classNames from 'classnames';
import { ActiveCardCounterOverlay } from './components/ActiveChainCounters';
import CombatChainLink from 'features/CombatChainLink';
import { ContinuousCounters } from './components/ContinuousCounters';

export interface CountersProp extends Card {
  num?: number;
  numDescription?: string;
  activeCombatChain?: CombatChainLink;
}

export const CountersOverlay = ({
  countersMap,
  label,
  gem,
  actionDataOverride,
  num,
  numDescription,
  facing,
  zone,
  activeCombatChain
}: CountersProp) => {
  const includedCounters = [
    'defence',
    'steam',
    'life',
    'attack',
    'energy',
    'aim'
  ];

  let numTotal = num ?? 0;
  let numDescriptionFinal = numDescription ?? '';

  for (const counter in countersMap) {
    if (!includedCounters.includes(counter)) {
      numTotal += Number(countersMap[counter]);
      numDescriptionFinal = counter;
    }
  }

  return (
    <div className={styles.countersCover}>
      {countersMap && <ContinuousCounters countersMap={countersMap} />}
      {activeCombatChain && <ActiveCardCounterOverlay activeCombatChain={activeCombatChain} />}
      {!!numTotal && (
        <div
          className={styles.number}
          title={`${numTotal} ${numDescriptionFinal} counter(s)`}
        >
          <div className={styles.text}>{numTotal}</div>
        </div>
      )}
      {label !== undefined && label !== '' && (
        <div className={styles.label}>{label}</div>
      )}
      {facing && (
        <div
          className={classNames(
            {
              [styles.facingUp]: facing === 'UP',
              [styles.facingDown]: facing === 'DOWN' || facing === 'DOWNALL'
            },
            styles.facing
          )}
          // data-tooltip={`facing ${facing.toLowerCase()}`}
          title={`Card is face ${facing.toLowerCase()}`}
        ></div>
      )}
      {gem !== 'none' && (
        <GemSlider gem={gem} cardID={actionDataOverride} zone={zone} />
      )}
    </div>
  );
};

export default CountersOverlay;

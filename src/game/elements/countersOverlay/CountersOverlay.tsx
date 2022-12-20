import React, { useRef } from 'react';
import { Card } from '../../../features/Card';
import styles from './CountersOverlay.module.css';
import GemSlider from '../gemSlider/GemSlider';

export interface CountersProp extends Card {
  num?: number;
  numDescription?: string;
}

export const CountersOverlay = ({
  countersMap,
  label,
  gem,
  actionDataOverride,
  num,
  numDescription
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
    <div className={styles.floatCover}>
      {!!Number(countersMap?.defence) && (
        <div
          className={styles.defCounter}
          title={`${countersMap?.defence} defence counter(s)`}
        >
          <div>{countersMap?.defence}</div>
        </div>
      )}
      {!!Number(countersMap?.steam) && (
        <div
          className={styles.steamCounter}
          title={`${countersMap?.steam} steam counter(s)`}
        >
          <div>{countersMap?.steam}</div>
        </div>
      )}
      {!!Number(countersMap?.life) && (
        <div
          className={styles.lifeCounter}
          title={`${countersMap?.life} life counter(s)`}
        >
          <div>{countersMap?.life}</div>
        </div>
      )}
      {!!Number(countersMap?.attack) && (
        <div
          className={styles.attackCounter}
          title={`${countersMap?.attack} attack counter(s)`}
        >
          <div>{countersMap?.attack}</div>
        </div>
      )}
      {!!Number(countersMap?.energy) && (
        <div
          className={styles.number}
          title={`${countersMap?.energy} energy counter(s)`}
        >
          <div className={styles.text}>{countersMap?.energy}</div>
        </div>
      )}
      {!!Number(countersMap?.aim) && (
        <div className={styles.aimCounter} title={`aim counter`}></div>
      )}
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
      {gem !== 'none' && <GemSlider gem={gem} cardID={actionDataOverride} />}
    </div>
  );
};

export default CountersOverlay;

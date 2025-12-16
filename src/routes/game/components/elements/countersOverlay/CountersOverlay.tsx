import { Card } from 'features/Card';
import styles from './CountersOverlay.module.css';
import GemSlider from '../gemSlider/GemSlider';
import { ActiveCardCounterOverlay } from './components/ActiveChainCounters';
import CombatChainLink from 'features/CombatChainLink';
import { ContinuousCounters } from './components/ContinuousCounters';
import { TooltipWrapper } from './components/TooltipWrapper';
import { GiDialPadlock } from 'react-icons/gi';

export interface CountersProp extends Card {
  num?: number;
  numDescription?: string;
  activeCombatChain?: CombatChainLink;
  excludeFancyCounters?: boolean;
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
  activeCombatChain,
  controller,
  restriction,
  excludeFancyCounters
}: CountersProp) => {
  const includedCounters = [
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
    'gold',
    'suspense',
    'sand',
    'lightning',
    'amp',
    'aim',
    'wateryGrave'
  ];

  let numTotal = num ?? 0;
  let numDescriptionFinal = numDescription ?? '';

  if (countersMap && !excludeFancyCounters) {
    for (const counter in countersMap) {
      if (!includedCounters.includes(counter)) {
        numTotal += Number(countersMap[counter]);
        numDescriptionFinal = counter;
      }
    }
  }

  return (
    <div className={styles.countersCover}>
      {countersMap && (!excludeFancyCounters || countersMap?.amp) && <ContinuousCounters countersMap={countersMap} excludeFancyCounters={excludeFancyCounters} />}
      {activeCombatChain && (
        <ActiveCardCounterOverlay activeCombatChain={activeCombatChain} />
      )}
      {!!restriction && (
        <TooltipWrapper 
          className={styles.icon} 
          tooltip="Restricted"
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
          cardID={actionDataOverride}
          zone={zone}
          controller={controller}
        />
      )}
    </div>
  );
};

export default CountersOverlay;

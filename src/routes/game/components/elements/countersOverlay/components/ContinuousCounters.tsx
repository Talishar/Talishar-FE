import classNames from 'classnames';
import styles from '../CountersOverlay.module.css';

type Props = {
  countersMap: { [key: string]: number };
};

const includedCounters = [
  'defence',
  'steam',
  'life',
  'attack',
  'energy',
  'aim'
];

const toTooltipString = (type: string, value: number) =>
  `${value > 1 ? value : ''} ${type} counter${value > 1 ? 's' : ''}`;
export const ContinuousCounters = (props: Props) => {
  const { countersMap } = props;

  return (
    <>
      {!!Number(countersMap?.defence) && (
        <div
          className={styles.defCounter}
          data-tooltip={toTooltipString('Defense', countersMap?.defence)}
        >
          <div>{countersMap?.defence}</div>
        </div>
      )}
      {!!Number(countersMap?.steam) && (
        <div
          className={styles.steamCounter}
          data-tooltip={toTooltipString('Steam', countersMap?.steam)}
        >
          <div>{countersMap?.steam}</div>
        </div>
      )}
      {!!Number(countersMap?.attack) && (
        <div
          className={styles.attackCounter}
          data-tooltip={toTooltipString('Attack', countersMap?.attack)}
        >
          <div>{countersMap?.attack}</div>
        </div>
      )}
      {!!Number(countersMap?.life) && (
        <div
          className={styles.lifeCounter}
          data-tooltip={toTooltipString('Life', countersMap?.life)}
        >
          <div>{countersMap?.life}</div>
        </div>
      )}
      {!!Number(countersMap?.energy) && (
        <div
          className={styles.number}
          data-tooltip={toTooltipString('Energy', countersMap?.energy)}
        >
          <div className={styles.text}>{countersMap?.energy}</div>
        </div>
      )}
      {!!Number(countersMap?.aim) && (
        <div
          className={classNames(styles.aimCounter, styles.icon)}
          data-tooltip={toTooltipString('Aim', countersMap?.aim)}
        />
      )}
    </>
  );
};

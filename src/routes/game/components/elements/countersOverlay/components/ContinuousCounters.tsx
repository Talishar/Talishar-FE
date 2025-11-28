import classNames from 'classnames';
import styles from '../CountersOverlay.module.css';
import { GiLightningArc } from "react-icons/gi";
import { GiBlood } from "react-icons/gi";

type Props = {
  countersMap: { [key: string]: number };
};

const includedCounters = [
  'defence',
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
  'lightning',
  'amp',
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
      {!!Number(countersMap?.attack) && (
        <div
          className={styles.powerCounter}
          title={`${countersMap?.attack} attack counter(s)`}
        >
          <div>{countersMap?.attack}</div>
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
      {!!Number(countersMap?.energy) && (
        <div
          className={styles.energyCounter}
          title={`${countersMap?.energy} energy counter(s)`}
        >
          <div>{countersMap?.energy}</div>
        </div>
      )}
      {!!Number(countersMap?.haunt) && (
        <div
          className={styles.hauntCounter}
          title={`${countersMap?.haunt} haunt counter(s)`}
        >
          <div>{countersMap?.haunt}</div>
        </div>
      )}
      {!!Number(countersMap?.verse) && (
        <div
          className={styles.verseCounter}
          title={`${countersMap?.verse} verse counter(s)`}
        >
          <div>{countersMap?.verse}</div>
        </div>
      )}
      {!!Number(countersMap?.doom) && (
        <div
          className={styles.doomCounter}
          title={`${countersMap?.doom} doom counter(s)`}
        >
          <div>{countersMap?.doom}</div>
        </div>
      )}
      {!!Number(countersMap?.lesson) && (
        <div
          className={styles.lessonCounter}
          title={`${countersMap?.lesson} lesson counter(s)`}
        >
          <div>{countersMap?.lesson}</div>
        </div>
      )}
      {!!Number(countersMap?.rust) && (
        <div
          className={styles.rustCounter}
          title={`${countersMap?.rust} rust counter(s)`}
        >
          <div>{countersMap?.rust}</div>
        </div>
      )}
      {!!Number(countersMap?.flow) && (
        <div
          className={styles.flowCounter}
          title={`${countersMap?.flow} flow counter(s)`}
        >
          <div>{countersMap?.flow}</div>
        </div>
      )}
      {!!Number(countersMap?.frost) && (
        <div
          className={styles.frostCounter}
          title={`${countersMap?.frost} frost counter(s)`}
        >
          <div>{countersMap?.frost}</div>
        </div>
      )}
      {!!Number(countersMap?.balance) && (
        <div
          className={styles.balanceCounter}
          title={`${countersMap?.balance} balance counter(s)`}
        >
          <div>{countersMap?.balance}</div>
        </div>
      )}
      {!!Number(countersMap?.bind) && (
        <div
          className={styles.bindCounter}
          title={`${countersMap?.bind} bind counter(s)`}
        >
          <div>{countersMap?.bind}</div>
        </div>
      )}
      {!!Number(countersMap?.stain) && (
        <div
          className={styles.stainCounter}
          title={`${countersMap?.stain} stain counter(s)`}
        >
          <div>{countersMap?.stain}</div>
        </div>
      )}
      {!!Number(countersMap?.gold) && (
        <div
          className={styles.goldCounter}
          title={`${countersMap?.gold} gold counter(s)`}
        >
          <div>{countersMap?.gold}</div>
        </div>
      )}
      {!!Number(countersMap?.suspense) && (
        <div
          className={styles.suspenseCounter}
          title={`${countersMap?.suspense} suspense counter(s)`}
        >
          <div>{countersMap?.suspense}</div>
        </div>
      )}
      {!!Number(countersMap?.lightning) && (
        <div
          className={styles.icon}
          title={`${countersMap?.lightning} lightning card(s) played`}
        >
          <div className={styles.iconText}>
            {countersMap?.lightning}
          </div>
          <GiLightningArc />
        </div>
      )}
      {!!Number(countersMap?.amp) && (
        <div
          className={styles.iconEffects}
          title={`${countersMap?.amp} Arcane Bonus`}
        >
          <div className={styles.iconTextEffect}>
            {countersMap?.amp}
          </div>
          <GiLightningArc />
        </div>
      )}
      {!!Number(countersMap?.aim) && (
        <div
          className={classNames(styles.aimCounter, styles.icon)}
          data-tooltip="Aim counter(s)"
          title={`aim counter`}
        />
      )}
    </>
  );
};

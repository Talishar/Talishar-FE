import classNames from 'classnames';
import styles from '../CountersOverlay.module.css';
import { TooltipWrapper } from './TooltipWrapper';
import { GiLightningArc } from "react-icons/gi";
import { GiTombstone } from "react-icons/gi";
import { TbTargetArrow } from "react-icons/tb";

type Props = {
  countersMap: { [key: string]: number };
  excludeFancyCounters?: boolean;
};

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

const toTooltipString = (type: string, value: number) =>
  `${value > 1 ? value : ''} ${type} counter${value > 1 ? 's' : ''}`;
export const ContinuousCounters = (props: Props) => {
  const { countersMap, excludeFancyCounters } = props;

  // Only return null if excluding fancy counters and there's no amp counter
  if (excludeFancyCounters && !countersMap?.amp) {
    return null;
  }

  return (
    <>
      {!!Number(countersMap?.defense) && (
        <TooltipWrapper
          className={styles.defCounter}
          tooltip={`${countersMap?.defense} defense(s)`}
        >
          <div>{countersMap?.defense}</div>
        </TooltipWrapper>
      )}
      {!!Number(countersMap?.steam) && (
        <TooltipWrapper
          className={styles.steamCounter}
          tooltip={`${countersMap?.steam} steam counter(s)`}
        >
          <div>{countersMap?.steam}</div>
        </TooltipWrapper>
      )}
      {!!Number(countersMap?.attack) && (
        <TooltipWrapper
          className={styles.powerCounter}
          tooltip={`${countersMap?.attack} power(s)`}
        >
          <div>{countersMap?.attack}</div>
        </TooltipWrapper>
      )}
      {!!Number(countersMap?.life) && (
        <TooltipWrapper
          className={styles.lifeCounter}
          tooltip={`${countersMap?.life} life(s)`}
        >
          <div>{countersMap?.life}</div>
        </TooltipWrapper>
      )}
      {!!Number(countersMap?.energy) && (
        <TooltipWrapper
          className={styles.energyCounter}
          tooltip={`${countersMap?.energy} energy counter(s)`}
        >
          <div>{countersMap?.energy}</div>
        </TooltipWrapper>
      )}
      {!!Number(countersMap?.haunt) && (
        <TooltipWrapper
          className={styles.hauntCounter}
          tooltip={`${countersMap?.haunt} haunt counter(s)`}
        >
          <div>{countersMap?.haunt}</div>
        </TooltipWrapper>
      )}
      {!!Number(countersMap?.verse) && (
        <TooltipWrapper
          className={styles.verseCounter}
          tooltip={`${countersMap?.verse} verse counter(s)`}
        >
          <div>{countersMap?.verse}</div>
        </TooltipWrapper>
      )}
      {!!Number(countersMap?.doom) && (
        <TooltipWrapper
          className={styles.doomCounter}
          tooltip={`${countersMap?.doom} doom counter(s)`}
        >
          <div>{countersMap?.doom}</div>
        </TooltipWrapper>
      )}
      {!!Number(countersMap?.lesson) && (
        <TooltipWrapper
          className={styles.lessonCounter}
          tooltip={`${countersMap?.lesson} lesson counter(s)`}
        >
          <div>{countersMap?.lesson}</div>
        </TooltipWrapper>
      )}
      {!!Number(countersMap?.rust) && (
        <TooltipWrapper
          className={styles.rustCounter}
          tooltip={`${countersMap?.rust} rust counter(s)`}
        >
          <div>{countersMap?.rust}</div>
        </TooltipWrapper>
      )}
      {!!Number(countersMap?.flow) && (
        <TooltipWrapper
          className={styles.flowCounter}
          tooltip={`${countersMap?.flow} flow counter(s)`}
        >
          <div>{countersMap?.flow}</div>
        </TooltipWrapper>
      )}
      {!!Number(countersMap?.frost) && (
        <TooltipWrapper
          className={styles.frostCounter}
          tooltip={`${countersMap?.frost} frost counter(s)`}
        >
          <div>{countersMap?.frost}</div>
        </TooltipWrapper>
      )}
      {!!Number(countersMap?.balance) && (
        <TooltipWrapper
          className={styles.balanceCounter}
          tooltip={`${countersMap?.balance} balance counter(s)`}
        >
          <div>{countersMap?.balance}</div>
        </TooltipWrapper>
      )}
      {!!Number(countersMap?.bind) && (
        <TooltipWrapper
          className={styles.bindCounter}
          tooltip={`${countersMap?.bind} bind counter(s)`}
        >
          <div>{countersMap?.bind}</div>
        </TooltipWrapper>
      )}
      {!!Number(countersMap?.stain) && (
        <TooltipWrapper
          className={styles.stainCounter}
          tooltip={`${countersMap?.stain} stain counter(s)`}
        >
          <div>{countersMap?.stain}</div>
        </TooltipWrapper>
      )}
      {!!Number(countersMap?.gold) && (
        <TooltipWrapper
          className={styles.goldCounter}
          tooltip={`${countersMap?.gold} gold counter(s)`}
        >
          <div>{countersMap?.gold}</div>
        </TooltipWrapper>
      )}
      {!!Number(countersMap?.suspense) && (
        <TooltipWrapper
          className={styles.suspenseCounter}
          tooltip={`${countersMap?.suspense} suspense counter(s)`}
        >
          <div>{countersMap?.suspense}</div>
        </TooltipWrapper>
      )}
      {!!Number(countersMap?.sand) && (
        <TooltipWrapper
          className={styles.sandCounter}
          tooltip={`${countersMap?.sand} sand counter(s)`}
        >
          <div>{countersMap?.sand}</div>
        </TooltipWrapper>
      )}
      {!!Number(countersMap?.lightning) && (
        <TooltipWrapper
          className={styles.icon}
          tooltip={`${countersMap?.lightning} lightning card(s) played`}
        >
          <div className={styles.iconText}>
            {countersMap?.lightning}
          </div>
          <GiLightningArc />
        </TooltipWrapper>
      )}
      {!!Number(countersMap?.amp) && (
        <TooltipWrapper
          className={styles.icon}
          tooltip={`${countersMap?.amp} Arcane Bonus`}
        >
          <div className={styles.iconText}>
            {countersMap?.amp}
          </div>
          <GiLightningArc />
        </TooltipWrapper>
      )}
      {!!Number(countersMap?.aim) && (
        <TooltipWrapper
          className={styles.icon}
          tooltip="Aim counter(s)"
        >
          <TbTargetArrow />
        </TooltipWrapper>
      )}
      {!!Number(countersMap?.wateryGrave) && (
        <TooltipWrapper
          className={styles.wateryGraveIcon}
          tooltip="Watery Grave"
        >
          <GiTombstone />
        </TooltipWrapper>
      )}    
      </>
  );
};

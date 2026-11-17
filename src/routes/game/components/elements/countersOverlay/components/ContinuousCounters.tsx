import styles from '../CountersOverlay.module.css';
import { useTranslation } from 'react-i18next';
import { TooltipWrapper } from 'components/Tooltip/TooltipWrapper';
import { GiLightningArc } from 'react-icons/gi';
import { GiTombstone } from 'react-icons/gi';
import { TbTargetArrow } from 'react-icons/tb';

type Props = {
  countersMap: { [key: string]: number };
  excludeFancyCounters?: boolean;
};

export const ContinuousCounters = (props: Props) => {
  const { countersMap, excludeFancyCounters } = props;
  const { t } = useTranslation();

  // Only return null if excluding fancy counters and there's no amp counter
  if (excludeFancyCounters && !countersMap?.amp) {
    return null;
  }

  return (
    <>
      {!!Number(countersMap?.defense) && (
        <TooltipWrapper
          className={styles.defCounter}
          tooltip={t('COUNTERS.DEFENSE', { count: countersMap?.defense })}
        >
          <div>{countersMap?.defense}</div>
        </TooltipWrapper>
      )}
      {!!Number(countersMap?.steam) && (
        <TooltipWrapper
          className={styles.steamCounter}
          tooltip={t('COUNTERS.STEAM', { count: countersMap?.steam })}
        >
          <div>{countersMap?.steam}</div>
        </TooltipWrapper>
      )}
      {!!Number(countersMap?.attack) && (
        <TooltipWrapper
          className={styles.powerCounter}
          tooltip={t('COUNTERS.ATTACK', { count: countersMap?.attack })}
        >
          <div>{countersMap?.attack}</div>
        </TooltipWrapper>
      )}
      {!!Number(countersMap?.life) && (
        <TooltipWrapper
          className={styles.lifeCounter}
          tooltip={t('COUNTERS.LIFE', { count: countersMap?.life })}
        >
          <div>{countersMap?.life}</div>
        </TooltipWrapper>
      )}
      {!!Number(countersMap?.energy) && (
        <TooltipWrapper
          className={styles.energyCounter}
          tooltip={t('COUNTERS.ENERGY', { count: countersMap?.energy })}
        >
          <div>{countersMap?.energy}</div>
        </TooltipWrapper>
      )}
      {!!Number(countersMap?.haunt) && (
        <TooltipWrapper
          className={styles.hauntCounter}
          tooltip={t('COUNTERS.HAUNT', { count: countersMap?.haunt })}
        >
          <div>{countersMap?.haunt}</div>
        </TooltipWrapper>
      )}
      {!!Number(countersMap?.verse) && (
        <TooltipWrapper
          className={styles.verseCounter}
          tooltip={t('COUNTERS.VERSE', { count: countersMap?.verse })}
        >
          <div>{countersMap?.verse}</div>
        </TooltipWrapper>
      )}
      {!!Number(countersMap?.doom) && (
        <TooltipWrapper
          className={styles.doomCounter}
          tooltip={t('COUNTERS.DOOM', { count: countersMap?.doom })}
        >
          <div>{countersMap?.doom}</div>
        </TooltipWrapper>
      )}
      {!!Number(countersMap?.lesson) && (
        <TooltipWrapper
          className={styles.lessonCounter}
          tooltip={t('COUNTERS.LESSON', { count: countersMap?.lesson })}
        >
          <div>{countersMap?.lesson}</div>
        </TooltipWrapper>
      )}
      {!!Number(countersMap?.rust) && (
        <TooltipWrapper
          className={styles.rustCounter}
          tooltip={t('COUNTERS.RUST', { count: countersMap?.rust })}
        >
          <div>{countersMap?.rust}</div>
        </TooltipWrapper>
      )}
      {!!Number(countersMap?.flow) && (
        <TooltipWrapper
          className={styles.flowCounter}
          tooltip={t('COUNTERS.FLOW', { count: countersMap?.flow })}
        >
          <div>{countersMap?.flow}</div>
        </TooltipWrapper>
      )}
      {!!Number(countersMap?.frost) && (
        <TooltipWrapper
          className={styles.frostCounter}
          tooltip={t('COUNTERS.FROST', { count: countersMap?.frost })}
        >
          <div>{countersMap?.frost}</div>
        </TooltipWrapper>
      )}
      {!!Number(countersMap?.balance) && (
        <TooltipWrapper
          className={styles.balanceCounter}
          tooltip={t('COUNTERS.BALANCE', { count: countersMap?.balance })}
        >
          <div>{countersMap?.balance}</div>
        </TooltipWrapper>
      )}
      {!!Number(countersMap?.bind) && (
        <TooltipWrapper
          className={styles.bindCounter}
          tooltip={t('COUNTERS.BIND', { count: countersMap?.bind })}
        >
          <div>{countersMap?.bind}</div>
        </TooltipWrapper>
      )}
      {!!Number(countersMap?.stain) && (
        <TooltipWrapper
          className={styles.stainCounter}
          tooltip={t('COUNTERS.STAIN', { count: countersMap?.stain })}
        >
          <div>{countersMap?.stain}</div>
        </TooltipWrapper>
      )}
      {!!Number(countersMap?.storm) && (
        <TooltipWrapper
          className={styles.stormCounter}
          tooltip={t('COUNTERS.STORM', { count: countersMap?.storm })}
        >
          <div>{countersMap?.storm}</div>
        </TooltipWrapper>
      )}
      {!!Number(countersMap?.gold) && (
        <TooltipWrapper
          className={styles.goldCounter}
          tooltip={t('COUNTERS.GOLD', { count: countersMap?.gold })}
        >
          <div>{countersMap?.gold}</div>
        </TooltipWrapper>
      )}
      {!!Number(countersMap?.suspense) && (
        <TooltipWrapper
          className={styles.suspenseCounter}
          tooltip={t('COUNTERS.SUSPENSE', { count: countersMap?.suspense })}
        >
          <div>{countersMap?.suspense}</div>
        </TooltipWrapper>
      )}
      {!!Number(countersMap?.sand) && (
        <TooltipWrapper
          className={styles.sandCounter}
          tooltip={t('COUNTERS.SAND', { count: countersMap?.sand })}
        >
          <div>{countersMap?.sand}</div>
        </TooltipWrapper>
      )}
      {!!Number(countersMap?.lightning) && (
        <TooltipWrapper
          className={styles.icon}
          tooltip={t('COUNTERS.LIGHTNING', { count: countersMap?.lightning })}
        >
          <div className={styles.iconText}>{countersMap?.lightning}</div>
          <GiLightningArc />
        </TooltipWrapper>
      )}
      {!!Number(countersMap?.amp) && (
        <TooltipWrapper
          className={styles.icon}
          tooltip={t('COUNTERS.AMP', { count: countersMap?.amp })}
        >
          <div className={styles.iconText}>{countersMap?.amp}</div>
          <GiLightningArc />
        </TooltipWrapper>
      )}
      {!!Number(countersMap?.aim) && (
        <TooltipWrapper
          className={styles.icon}
          tooltip={t('COUNTERS.AIM', { count: countersMap?.aim })}
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
      {!!Number(countersMap?.counters) && (
        <div className={styles.enduranceCounter}>
          <div>{countersMap?.counters}</div>
        </div>
      )}
    </>
  );
};

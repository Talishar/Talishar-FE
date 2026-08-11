import React from 'react';
import { useTranslation } from 'react-i18next';
import { HEROES_OF_RATHE } from 'routes/index/components/filter/constants';
import { generateCroppedImageUrl } from 'utils/cropImages';
import MasteryFrame from './MasteryFrame';
import { progressStart, ROMAN_LEVELS } from './mastery';
import styles from './MasteryProgressCard.module.css';

interface Props {
  heroId: string;
  games: number;
  level: number;
  nextThreshold: number | null;
  gamesToNext: number | null;
  unlocked?: boolean;
  compact?: boolean;
  showPortrait?: boolean;
}

const MasteryProgressCard = ({
  heroId,
  games,
  level,
  nextThreshold,
  gamesToNext,
  unlocked,
  compact,
  showPortrait
}: Props) => {
  const { t } = useTranslation();
  const heroName =
    HEROES_OF_RATHE.find((hero) => hero.value === heroId)?.label ?? heroId;
  const heroImage = generateCroppedImageUrl(heroId);
  const start = progressStart(level);
  const percent =
    nextThreshold === null
      ? 100
      : Math.min(100, ((games - start) / (nextThreshold - start)) * 100);
  const remaining =
    gamesToNext === 1
      ? t('MASTERY.ONE_MORE_GAME', {
          mastery:
            level === 0
              ? t('MASTERY.TITLE')
              : t('MASTERY.LEVEL', { level: ROMAN_LEVELS[level + 1] })
        })
      : gamesToNext !== null
      ? t('MASTERY.GAMES_UNTIL_MASTERY', {
          level: ROMAN_LEVELS[level + 1]
        })
      : t('MASTERY.HIGHEST_REACHED');

  return (
    <aside
      className={`${styles.card} ${unlocked ? styles.unlocked : ''} ${
        compact ? styles.compact : ''
      } ${showPortrait ? styles.withPortrait : ''}`}
    >
      {showPortrait && (
        <MasteryFrame level={level} className={styles.portraitFrame}>
          <img src={heroImage} alt={heroName} className={styles.portrait} />
        </MasteryFrame>
      )}
      <div className={styles.content}>
        {unlocked && (
          <span className={styles.unlockLabel}>{t('MASTERY.UNLOCKED')}</span>
        )}
        <strong>
          {t('MASTERY.HERO_TITLE', {
            hero: heroName,
            mastery:
              level > 0
                ? t('MASTERY.LEVEL', { level: ROMAN_LEVELS[level] })
                : t('MASTERY.TITLE')
          })}
        </strong>
        {unlocked && (
          <b>
            {t('MASTERY.UNLOCKED_SUMMARY', {
              level: ROMAN_LEVELS[level],
              count: games
            })}
          </b>
        )}
        <div className={styles.track}>
          <i style={{ width: `${percent}%` }} />
        </div>
        <small>
          {nextThreshold !== null
            ? t('MASTERY.CARD_PROGRESS', {
                games,
                threshold: nextThreshold,
                remaining
              })
            : t('MASTERY.CARD_MAXIMUM', {
                count: games,
                formattedCount: games.toLocaleString(),
                remaining
              })}
        </small>
      </div>
    </aside>
  );
};

export default MasteryProgressCard;

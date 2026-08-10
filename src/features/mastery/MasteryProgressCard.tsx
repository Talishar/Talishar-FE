import React from 'react';
import { HEROES_OF_RATHE } from 'routes/index/components/filter/constants';
import { masteryTitle, progressStart, ROMAN_LEVELS } from './mastery';
import styles from './MasteryProgressCard.module.css';

interface Props {
  heroId: string;
  games: number;
  level: number;
  nextThreshold: number | null;
  gamesToNext: number | null;
  unlocked?: boolean;
  compact?: boolean;
}

const MasteryProgressCard = ({ heroId, games, level, nextThreshold, gamesToNext, unlocked, compact }: Props) => {
  const heroName = HEROES_OF_RATHE.find((hero) => hero.value === heroId)?.label ?? heroId;
  const start = progressStart(level);
  const percent = nextThreshold === null ? 100 : Math.min(100, ((games - start) / (nextThreshold - start)) * 100);
  const remaining = gamesToNext === 1
    ? `One more game to unlock ${level === 0 ? 'Hero Mastery' : `Mastery ${ROMAN_LEVELS[level + 1]}`}`
    : gamesToNext !== null
    ? `${gamesToNext} games until Mastery ${ROMAN_LEVELS[level + 1]}`
    : 'Highest mastery reached';

  return (
    <aside className={`${styles.card} ${unlocked ? styles.unlocked : ''} ${compact ? styles.compact : ''}`}>
      {unlocked && <span className={styles.unlockLabel}>✦ HERO MASTERY UNLOCKED</span>}
      <strong>{heroName} - {masteryTitle(level)}</strong>
      {unlocked && <b>Mastery {ROMAN_LEVELS[level]} - {games} games played</b>}
      <div className={styles.track}><i style={{ width: `${percent}%` }} /></div>
      <small>{nextThreshold !== null ? `${games} / ${nextThreshold} - ${remaining}` : `${games.toLocaleString()} games played - ${remaining}`}</small>
    </aside>
  );
};

export default MasteryProgressCard;

import React from 'react';
import classNames from 'classnames';
import { ornamentTier } from './mastery';
import './masteryPalette.css';
import styles from './MasteryPlate.module.css';

interface Props {
  level: number;
  /** `inside` keeps every ornament within the box; `outside` lets gems
   *  straddle the edge the way the round portrait frame does. */
  variant?: 'inside' | 'outside';
  /** `compact` thins the whole frame for boxes only a couple of lines tall. */
  size?: 'compact';
  className?: string;
}

interface Ornament {
  key: string;
  type: 'gem' | 'gemSmall' | 'blade' | 'stud';
  edge: 'top' | 'bottom' | 'left' | 'right';
  pos: string;
  from: number;
}

// Same order of unlocks as the round frame, walked around a rectangle.
const ORNAMENTS: Ornament[] = [
  { key: 'gemBottom', type: 'gem', edge: 'bottom', pos: '50%', from: 1 },
  {
    key: 'gemBottomLeft',
    type: 'gemSmall',
    edge: 'bottom',
    pos: '30%',
    from: 2
  },
  {
    key: 'gemBottomRight',
    type: 'gemSmall',
    edge: 'bottom',
    pos: '70%',
    from: 2
  },
  { key: 'bladeLeft', type: 'blade', edge: 'left', pos: '50%', from: 3 },
  { key: 'bladeRight', type: 'blade', edge: 'right', pos: '50%', from: 3 },
  { key: 'gemTop', type: 'gem', edge: 'top', pos: '50%', from: 4 },
  { key: 'gemTopLeft', type: 'gemSmall', edge: 'top', pos: '30%', from: 5 },
  { key: 'gemTopRight', type: 'gemSmall', edge: 'top', pos: '70%', from: 5 },
  { key: 'studBottomLeft', type: 'stud', edge: 'bottom', pos: '14%', from: 7 },
  { key: 'studBottomRight', type: 'stud', edge: 'bottom', pos: '86%', from: 7 },
  { key: 'studTopLeft', type: 'stud', edge: 'top', pos: '14%', from: 7 },
  { key: 'studTopRight', type: 'stud', edge: 'top', pos: '86%', from: 7 }
];

const EDGES = {
  top: 'edgeTop',
  bottom: 'edgeBottom',
  left: 'edgeLeft',
  right: 'edgeRight'
} as const;

const MasteryPlate = ({
  level,
  variant = 'outside',
  size,
  className
}: Props) => {
  if (level < 1) return null;
  const tier = ornamentTier(level);
  return (
    <span
      className={classNames(
        styles.plate,
        styles[`mastery_${level}`],
        variant === 'inside' && styles.inside,
        size === 'compact' && styles.compact,
        className
      )}
      data-mastery-level={level}
      aria-hidden="true"
    >
      <span className={styles.bezel} />
      <span className={styles.halo} />
      <span className={styles.lip} />
      {tier >= 6 && <span className={styles.ring} />}
      {tier >= 6 && <span className={styles.crest} />}
      {ORNAMENTS.filter((ornament) => tier >= ornament.from).map((ornament) => (
        <span
          key={ornament.key}
          className={classNames(
            styles.orn,
            styles[ornament.type],
            styles[EDGES[ornament.edge]]
          )}
          style={{ '--orn-pos': ornament.pos } as React.CSSProperties}
        />
      ))}
    </span>
  );
};

export default MasteryPlate;

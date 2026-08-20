import React from 'react';
import classNames from 'classnames';
import { ornamentTier } from './mastery';
import styles from './MasteryBorder.module.css';

interface Props {
  level: number;
  className?: string;
}

interface Ornament {
  key: string;
  type: 'gem' | 'gemSmall' | 'blade';
  edge: 'top' | 'left' | 'right';
  pos: string;
  from: number;
}

const ORNAMENTS: Ornament[] = [
  { key: 'top', type: 'gem', edge: 'top', pos: '50%', from: 1 },
  { key: 'topLeft', type: 'gemSmall', edge: 'top', pos: '27%', from: 2 },
  { key: 'topRight', type: 'gemSmall', edge: 'top', pos: '73%', from: 2 },
  { key: 'left', type: 'blade', edge: 'left', pos: '50%', from: 3 },
  { key: 'right', type: 'blade', edge: 'right', pos: '50%', from: 3 }
];

const CORNERS = [
  { key: 'cornerTL', from: 4 },
  { key: 'cornerTR', from: 4 },
  { key: 'cornerBL', from: 5 },
  { key: 'cornerBR', from: 5 }
] as const;

const EDGES = {
  top: 'edgeTop',
  left: 'edgeLeft',
  right: 'edgeRight'
} as const;

const MasteryBorder = ({ level, className }: Props) => {
  const tier = ornamentTier(level);
  if (tier < 1) return null;
  return (
    <span
      className={classNames(
        styles.layer,
        tier >= 8 && styles.crested,
        className
      )}
      aria-hidden="true"
    >
      {tier >= 6 && <span className={styles.inlay} />}
      {CORNERS.filter((corner) => tier >= corner.from).map((corner) => (
        <span
          key={corner.key}
          className={classNames(styles.corner, styles[corner.key])}
        >
          {tier >= 7 && <span className={styles.cornerGem} />}
        </span>
      ))}
      {tier >= 8 && <span className={styles.crest} />}
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

export default MasteryBorder;

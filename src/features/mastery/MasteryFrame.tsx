import React from 'react';
import classNames from 'classnames';
import { ornamentTier } from './mastery';
import styles from './MasteryFrame.module.css';

interface Props {
  level: number;
  children: React.ReactNode;
  className?: string;
  title?: string;
}

interface Ornament {
  key: string;
  type: 'gem' | 'gemSmall' | 'blade' | 'stud';
  angle: number;
  from: number;
}

const ORNAMENTS: Ornament[] = [
  { key: 'gemBottom', type: 'gem', angle: 0, from: 1 },
  { key: 'gemBottomLeft', type: 'gemSmall', angle: -38, from: 2 },
  { key: 'gemBottomRight', type: 'gemSmall', angle: 38, from: 2 },
  { key: 'bladeLeft', type: 'blade', angle: -90, from: 3 },
  { key: 'bladeRight', type: 'blade', angle: 90, from: 3 },
  { key: 'gemTop', type: 'gem', angle: 180, from: 4 },
  { key: 'gemTopLeft', type: 'gemSmall', angle: -142, from: 5 },
  { key: 'gemTopRight', type: 'gemSmall', angle: 142, from: 5 },
  { key: 'studBottomLeft', type: 'stud', angle: -64, from: 7 },
  { key: 'studBottomRight', type: 'stud', angle: 64, from: 7 },
  { key: 'studTopLeft', type: 'stud', angle: -116, from: 7 },
  { key: 'studTopRight', type: 'stud', angle: 116, from: 7 }
];

const MasteryFrame = ({ level, children, className, title }: Props) => {
  const tier = ornamentTier(level);
  return (
    <div
      className={classNames(styles.frame, styles[`mastery_${level}`], className)}
      data-mastery-level={level}
      title={title}
    >
      {children}
      {tier > 0 && (
        <span className={styles.ornaments} aria-hidden="true">
          {tier >= 6 && <span className={styles.ring} />}
          {tier >= 8 && <span className={styles.crest} />}
          {ORNAMENTS.filter((ornament) => tier >= ornament.from).map(
            (ornament) => (
              <span
                key={ornament.key}
                className={classNames(styles.orn, styles[ornament.type])}
                style={
                  { '--orn-angle': `${ornament.angle}deg` } as React.CSSProperties
                }
              />
            )
          )}
        </span>
      )}
    </div>
  );
};

export default MasteryFrame;

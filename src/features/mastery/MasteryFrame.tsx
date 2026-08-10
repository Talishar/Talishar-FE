import React from 'react';
import classNames from 'classnames';
import styles from './MasteryFrame.module.css';

interface Props {
  level: number;
  children: React.ReactNode;
  className?: string;
  title?: string;
}

const MasteryFrame = ({ level, children, className, title }: Props) => (
  <div
    className={classNames(styles.frame, styles[`mastery_${level}`], className)}
    data-mastery-level={level}
    title={title}
  >
    {children}
    {level > 0 && <span className={styles.gem} aria-hidden="true" />}
  </div>
);

export default MasteryFrame;

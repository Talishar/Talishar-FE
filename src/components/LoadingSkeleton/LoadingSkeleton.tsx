import React from 'react';
import styles from './LoadingSkeleton.module.css';

interface Props {
  label: string;
  rows?: number;
}

const LoadingSkeleton = ({ label, rows = 4 }: Props) => (
  <div className={styles.skeleton} role="status" aria-label={label}>
    {Array.from({ length: rows }, (_, index) => (
      <div className={styles.row} key={index} aria-hidden="true">
        <span className={styles.image} />
        <span className={styles.lines}>
          <span />
          <span />
        </span>
      </div>
    ))}
  </div>
);

export default LoadingSkeleton;

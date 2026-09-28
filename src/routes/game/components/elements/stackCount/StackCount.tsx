import React from 'react';
import classNames from 'classnames';
import styles from './StackCount.module.css';

interface StackCountProps {
  count: number;
  className?: string;
  title?: string;
}

export const StackCount = ({ count, className, title }: StackCountProps) => (
  <div className={classNames(styles.stackCount, className)} title={title}>
    x {count}
  </div>
);

export default StackCount;

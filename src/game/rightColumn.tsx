import React from 'react';
import styles from './rightColumn.module.css';

export function RightColumn() {
  return (
    <div className={styles.rightColumn}>
      <div>Menu and icons</div>
      <div>Turn Number</div>
      <div>Last Card</div>
      <div>
        WHOSE TURN IS IT?
        <div>Including special feature PASS and NEXT TURN</div>
      </div>
      <div>THE CHAT BOX huzzah</div>
    </div>
  );
}

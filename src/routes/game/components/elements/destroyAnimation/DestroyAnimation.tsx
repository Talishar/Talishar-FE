import React from 'react';
import CardDisplay from '../cardDisplay/CardDisplay';
import styles from './DestroyAnimation.module.css';

export const DESTROY_ANIMATION_DURATION = 1600;

interface DestroyAnimationProps {
  cardNumber: string;
  isPlayer: boolean;
}

export const DestroyAnimation = React.memo(
  ({ cardNumber, isPlayer }: DestroyAnimationProps) => {
    return (
      <div className={styles.destroyContainer}>
        <div className={styles.topPiece}>
          <CardDisplay card={{ cardNumber }} isPlayer={isPlayer} />
        </div>
        <div className={styles.bottomPiece}>
          <CardDisplay card={{ cardNumber }} isPlayer={isPlayer} />
        </div>
      </div>
    );
  }
);

export default DestroyAnimation;

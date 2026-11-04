import React from 'react';
import CardDisplay from '../cardDisplay/CardDisplay';
import styles from './DestroyAnimation.module.css';
import { useReducedMotionSetting } from 'features/settings/accessibility';

export const DESTROY_ANIMATION_DURATION = 1600;

interface DestroyAnimationProps {
  cardNumber: string;
  isPlayer: boolean;
}

export const DestroyAnimation = React.memo(
  ({ cardNumber, isPlayer }: DestroyAnimationProps) => {
    const reducedMotion = useReducedMotionSetting();
    if (reducedMotion) return null;
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

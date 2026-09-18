import React, { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import classNames from 'classnames';
import styles from './FloatingPopup.module.css';

export type FloatingPopupVariant = 'damage' | 'healing' | 'actionPoint';

export interface FloatingPopupProps {
  id: string;
  amount: number;
  variant: FloatingPopupVariant;
  onComplete: (id: string) => void;
}

const VARIANTS: Record<
  FloatingPopupVariant,
  { anchor: string; text: string; sign: string }
> = {
  damage: { anchor: styles.anchorTop, text: styles.damageText, sign: '–' },
  healing: { anchor: styles.anchorTop, text: styles.healingText, sign: '+' },
  actionPoint: {
    anchor: styles.anchorAbove,
    text: styles.actionPointText,
    sign: '+'
  }
};

export const FloatingPopup: React.FC<FloatingPopupProps> = ({
  id,
  amount,
  variant,
  onComplete
}) => {
  const onCompleteRef = useRef(onComplete);
  onCompleteRef.current = onComplete;

  useEffect(() => {
    const timer = setTimeout(() => {
      onCompleteRef.current(id);
    }, 1500);

    return () => clearTimeout(timer);
  }, [id]); // onComplete excluded: always read from ref

  const { anchor, text, sign } = VARIANTS[variant];

  return (
    <motion.div
      className={classNames(styles.floatingPopup, anchor)}
      initial={{ opacity: 1, y: 0 }}
      animate={{ opacity: 0, y: -60 }}
      transition={{
        duration: 1.5,
        ease: 'easeOut',
        opacity: { duration: 0.5, delay: 1 }
      }}
    >
      <span className={classNames(styles.text, text)}>
        {sign}
        {amount}
      </span>
    </motion.div>
  );
};

export default FloatingPopup;

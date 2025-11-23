import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import styles from './HealingPopup.module.css';

export interface HealingPopupProps {
  id: string;
  amount: number;
  onComplete: (id: string) => void;
}

export const HealingPopup: React.FC<HealingPopupProps> = ({
  id,
  amount,
  onComplete
}) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onComplete(id);
    }, 1500);

    return () => clearTimeout(timer);
  }, [id, onComplete]);

  return (
    <motion.div
      className={styles.healingPopup}
      initial={{ opacity: 1, y: 0 }}
      animate={{ opacity: 0, y: -60 }}
      transition={{
        duration: 1.5,
        ease: 'easeOut',
        opacity: { duration: 0.5, delay: 1 }
      }}
    >
      <span className={styles.healingText}>+{amount}</span>
    </motion.div>
  );
};

export default HealingPopup;

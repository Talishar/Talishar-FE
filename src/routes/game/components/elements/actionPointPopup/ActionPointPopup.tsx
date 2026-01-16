import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import styles from './ActionPointPopup.module.css';

export interface ActionPointPopupProps {
  id: string;
  amount: number;
  onComplete: (id: string) => void;
}

export const ActionPointPopup: React.FC<ActionPointPopupProps> = ({
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
      className={styles.actionPointPopup}
      initial={{ opacity: 1, y: 0 }}
      animate={{ opacity: 0, y: -60 }}
      transition={{
        duration: 1.5,
        ease: 'easeOut',
        opacity: { duration: 0.5, delay: 1 }
      }}
    >
      <span className={styles.actionPointText}>+{amount}</span>
    </motion.div>
  );
};

export default ActionPointPopup;

import React, { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import styles from './DamagePopup.module.css';

export interface DamagePopupProps {
  id: string;
  amount: number;
  onComplete: (id: string) => void;
}

export const DamagePopup: React.FC<DamagePopupProps> = ({
  id,
  amount,
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

  return (
    <motion.div
      className={styles.damagePopup}
      initial={{ opacity: 1, y: 0 }}
      animate={{ opacity: 0, y: -60 }}
      transition={{
        duration: 1.5,
        ease: 'easeOut',
        opacity: { duration: 0.5, delay: 1 }
      }}
    >
      <span className={styles.damageText}>–{amount}</span>
    </motion.div>
  );
};

export default DamagePopup;

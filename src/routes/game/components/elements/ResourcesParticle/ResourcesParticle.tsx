import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import styles from './ResourcesParticle.module.css';

interface ResourcesParticleProps {
  isChiCard: boolean;
  onAnimationComplete: () => void;
}

export default function ResourcesParticle({ isChiCard, onAnimationComplete }: ResourcesParticleProps) {
  const [startPosition] = useState({
    x: Math.random() * 60 - 30, // Random horizontal offset from center
    y: -50 // Start above the pitch zone
  });

  const particleClass = isChiCard ? styles.chiParticle : styles.ResourcesParticle;

  return (
    <motion.div
      className={`${styles.particle} ${particleClass}`}
      initial={{
        x: startPosition.x,
        y: startPosition.y,
        opacity: 1,
        scale: 0.7
      }}
      animate={{
        x: 0, // Move toward center (pitch overlay)
        y: 0,
        opacity: 0,
        scale: 0.5
      }}
      transition={{
        duration: 0.7,
        ease: 'easeIn'
      }}
      onAnimationComplete={onAnimationComplete}
      data-testid="energy-particle"
    />
  );
}

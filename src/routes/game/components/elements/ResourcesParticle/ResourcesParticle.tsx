import React, { useState } from 'react';
import { motion } from 'framer-motion';
import styles from './ResourcesParticle.module.css';

export type PitchColor = 'red' | 'yellow' | 'blue';

interface ResourcesParticleProps {
  pitchColor: PitchColor;
  onAnimationComplete: () => void;
}

export default function ResourcesParticle({
  pitchColor,
  onAnimationComplete
}: ResourcesParticleProps) {
  const [startPosition] = useState({
    x: Math.random() * 90 - 45,
    y: -85
  });

  const particleClass = {
    red: styles.redParticle,
    yellow: styles.yellowParticle,
    blue: styles.blueParticle
  }[pitchColor];

  return (
    <motion.div
      className={`${styles.particle} ${particleClass}`}
      initial={{
        x: startPosition.x,
        y: startPosition.y,
        opacity: 0,
        scale: 0.65
      }}
      animate={{
        x: 0,
        y: 0,
        opacity: [0, 1, 0],
        scale: [0.65, 1, 0.45]
      }}
      transition={{
        duration: 0.62,
        ease: 'easeIn',
        times: [0, 0.18, 1]
      }}
      onAnimationComplete={onAnimationComplete}
      data-testid="energy-particle"
    />
  );
}

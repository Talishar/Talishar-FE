import React, { useState, useRef } from 'react';
import { useAppSelector } from 'app/Hooks';
import { RootState } from 'app/Store';
import Displayrow from 'interface/Displayrow';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { useCookies } from 'react-cookie';
import ResourcesParticle, { PitchColor } from '../ResourcesParticle/ResourcesParticle';
import styles from './PitchDisplay.module.css';

interface Particle {
  id: string;
  pitchColor: PitchColor;
}

const FALLBACK_PITCH_COLOR: PitchColor = 'red';

function getPitchColor(pitchValue: number | undefined, cardNumber: string): PitchColor {
  if (cardNumber.includes('inner_chi')) return 'blue';
  if (pitchValue === 3) return 'blue';
  if (pitchValue === 2) return 'yellow';
  return FALLBACK_PITCH_COLOR;
}

export default function PitchDisplay(prop: Displayrow) {
  const { isPlayer } = prop;
  const [particles, setParticles] = useState<Particle[]>([]);
  const [pulses, setPulses] = useState<Particle[]>([]);
  const [cookies] = useCookies(['disableParticles']);
  const prefersReducedMotion = useReducedMotion();
  const particleCounter = useRef(0);

  let pitchAmount = useAppSelector((state: RootState) =>
    isPlayer
      ? state.game.playerOne.PitchRemaining
      : state.game.playerTwo.PitchRemaining
  );

  const pitchZone = useAppSelector((state: RootState) =>
    isPlayer ? state.game.playerOne.Pitch : state.game.playerTwo.Pitch
  );

  // Detect when a new card is added to pitch and spawn particles
  React.useEffect(() => {
    if (cookies.disableParticles === 'true' || prefersReducedMotion) return;
    if (pitchZone && pitchZone.length > 0) {
      const newestCard = pitchZone[0];
      const pitchColor = getPitchColor(newestCard.pitchValue, newestCard.cardNumber);
      const batch = particleCounter.current++;
      const newParticles: Particle[] = Array.from({ length: 3 }, (_, i) => ({
        id: `${batch}-${i}`,
        pitchColor
      }));
      setParticles((prev) => [...prev, ...newParticles]);
      setPulses((prev) => [...prev, { id: `pulse-${batch}`, pitchColor }]);
    }
  }, [pitchZone?.length, cookies.disableParticles, prefersReducedMotion]);

  const removeParticle = (id: string) => {
    setParticles((prev) => prev.filter((p) => p.id !== id));
  };

  const removePulse = (id: string) => {
    setPulses((prev) => prev.filter((pulse) => pulse.id !== id));
  };

  if (pitchAmount === undefined) {
    pitchAmount = 0;
  }

  return (
    <div className={styles.pitchOverlay}>
      <AnimatePresence>
        {pulses.map((pulse) => (
          <motion.div
            key={pulse.id}
            className={`${styles.pitchPulse} ${styles[`pitchPulse${pulse.pitchColor}`]}`}
            initial={{ opacity: 0.8, scale: 0.45 }}
            animate={{ opacity: 0, scale: 2.5 }}
            transition={{ duration: 0.7, ease: 'easeOut' }}
            onAnimationComplete={() => removePulse(pulse.id)}
          />
        ))}
        {particles.map((particle) => (
          <ResourcesParticle
            key={particle.id}
            pitchColor={particle.pitchColor}
            onAnimationComplete={() => removeParticle(particle.id)}
          />
        ))}
      </AnimatePresence>
      <div className={styles.pitchBackground}>
        <div className={styles.pitchValue}>{pitchAmount}</div>
      </div>
    </div>
  );
}

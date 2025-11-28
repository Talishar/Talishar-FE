import React, { useState } from 'react';
import { useAppSelector } from 'app/Hooks';
import { RootState } from 'app/Store';
import Displayrow from 'interface/Displayrow';
import { AnimatePresence } from 'framer-motion';
import ResourcesParticle from '../ResourcesParticle/ResourcesParticle';
import styles from './PitchDisplay.module.css';

interface Particle {
  id: string;
  isChiCard: boolean;
}

export default function PitchDisplay(prop: Displayrow) {
  const { isPlayer } = prop;
  const [particles, setParticles] = useState<Particle[]>([]);
  const [particleCounter, setParticleCounter] = useState(0);

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
    if (pitchZone && pitchZone.length > 0) {
      const lastCard = pitchZone[pitchZone.length - 1];
      const isChiCard = lastCard.cardNumber.includes('inner_chi');
      console.log('Pitched card:', lastCard.cardNumber, 'isChi:', isChiCard);

      // Spawn 3 particles for the newly pitched card
      for (let i = 0; i < 3; i++) {
        const newParticle: Particle = {
          id: `${particleCounter}-${i}`,
          isChiCard
        };
        setParticles((prev) => [...prev, newParticle]);
      }
      setParticleCounter((prev) => prev + 1);
    }
  }, [pitchZone?.length]);

  const removeParticle = (id: string) => {
    setParticles((prev) => prev.filter((p) => p.id !== id));
  };

  if (pitchAmount === undefined) {
    pitchAmount = 0;
  }

  return (
    <div className={styles.pitchOverlay}>
      <AnimatePresence>
        {particles.map((particle) => (
          <ResourcesParticle
            key={particle.id}
            isChiCard={particle.isChiCard}
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

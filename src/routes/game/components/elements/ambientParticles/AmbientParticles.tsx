import React, { useMemo } from 'react';
import { useCookies } from 'react-cookie';
import styles from './AmbientParticles.module.css';

interface AmbientParticlesProps {
  variant?: 'game' | 'global';
}

interface ParticleConfig {
  left: number; // % across the board
  size: number; // px
  duration: number; // seconds for one full rise
  delay: number; // negative delay so particles are mid-flight on mount
  drift: number; // px of horizontal sway
  maxOpacity: number;
  isSpark: boolean; // occasional brighter ember
}

const PARTICLE_COUNT = 18;

const makeParticles = (): ParticleConfig[] =>
  Array.from({ length: PARTICLE_COUNT }, (_, i) => {
    const isSpark = i % 6 === 0;
    return {
      left: Math.random() * 100,
      size: isSpark ? 3 + Math.random() * 2 : 1.5 + Math.random() * 2,
      duration: 14 + Math.random() * 14,
      delay: -(Math.random() * 28),
      drift: (Math.random() - 0.5) * 80,
      maxOpacity: isSpark ? 0.5 + Math.random() * 0.3 : 0.2 + Math.random() * 0.25,
      isSpark
    };
  });

/**
 * Decorative overlay of slowly rising ember/dust motes so the board feels
 * alive while waiting on the opponent. Purely cosmetic: pointer-events are
 * disabled and animation uses transform/opacity only. Hidden entirely when
 * the user prefers reduced motion (see module CSS).
 */
export const AmbientParticles = ({ variant = 'game' }: AmbientParticlesProps) => {
  const [cookies] = useCookies(['disableParticles']);
  // Randomize once per mount; re-renders keep the same particle field
  const particles = useMemo(makeParticles, []);

  if (cookies.disableParticles === 'true') return null;

  const layerClass = variant === 'global' ? styles.ambientLayerGlobal : styles.ambientLayer;

  return (
    <div className={layerClass} aria-hidden="true">
      {particles.map((p, ix) => (
        <span
          key={ix}
          className={p.isSpark ? styles.spark : styles.mote}
          style={
            {
              left: `${p.left}%`,
              width: `${p.size}px`,
              height: `${p.size}px`,
              '--duration': `${p.duration}s`,
              '--delay': `${p.delay}s`,
              '--drift': `${p.drift}px`,
              '--max-opacity': p.maxOpacity
            } as React.CSSProperties
          }
        />
      ))}
    </div>
  );
};

export default AmbientParticles;

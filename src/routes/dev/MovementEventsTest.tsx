import React, { useState } from 'react';
import { toast } from 'react-hot-toast';
import MovementEventCard, {
  MOVEMENT_TOAST_OPTIONS,
  MovementEventType
} from 'routes/game/components/elements/eventsHandler/MovementEventCard';
import styles from './MovementEventsTest.module.css';

const EVENT_SAMPLES: Array<{
  type: MovementEventType;
  cardNumber: string;
  description: string;
}> = [
  {
    type: 'REVEAL',
    cardNumber: 'ARC160',
    description: 'A cool spotlight and illuminated baseline.'
  },
  {
    type: 'DISCARD',
    cardNumber: 'WTR162',
    description: 'A paper-toned landing shadow with dust accents.'
  },
  {
    type: 'BANISH',
    cardNumber: 'ARC159',
    description: 'A restrained violet portal glow.'
  },
  {
    type: 'SOUL',
    cardNumber: 'MON063',
    description: 'A warm glow and gentle sunburst.'
  }
];

export default function MovementEventsTest() {
  const [showAsOpponent, setShowAsOpponent] = useState(false);

  const showToast = (type: MovementEventType, cardNumber: string) => {
    toast(
      (instance) => (
        <MovementEventCard
          type={type}
          cardNumber={cardNumber}
          isPlayer={!showAsOpponent}
          onDismiss={() => toast.dismiss(instance.id)}
        />
      ),
      MOVEMENT_TOAST_OPTIONS
    );
  };

  return (
    <main className={styles.page}>
      <header className={styles.header}>
        <div>
          <p className={styles.eyebrow}>Development preview</p>
          <h1>Movement event personalities</h1>
          <p>
            Preview the scoped styles below or trigger the exact toast used in
            a game. This route is available only in development builds.
          </p>
        </div>
        <div className={styles.controls}>
          <label>
            <input
              type="checkbox"
              role="switch"
              checked={showAsOpponent}
              onChange={(event) => setShowAsOpponent(event.target.checked)}
            />
            Show as opponent card
          </label>
        </div>
      </header>

      <section className={styles.grid} aria-label="Movement event previews">
        {EVENT_SAMPLES.map((sample) => (
          <article className={styles.preview} key={sample.type}>
            <div className={styles.previewStage}>
              <MovementEventCard
                type={sample.type}
                cardNumber={sample.cardNumber}
                isPlayer={!showAsOpponent}
              />
            </div>
            <p>{sample.description}</p>
            <button
              type="button"
              onClick={() => showToast(sample.type, sample.cardNumber)}
            >
              Show {sample.type.toLowerCase()} toast
            </button>
          </article>
        ))}
      </section>
    </main>
  );
}

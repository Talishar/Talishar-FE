import React from 'react';
import { useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { shallowEqual } from 'react-redux';
import { useAppDispatch, useAppSelector } from '../../../app/Hooks';
import { RootState } from '../../../app/Store';
import CardDisplay from '../cardDisplay/CardDisplay';
import CardImage from '../cardImage/CardImage';
import styles from './EventsHandler.module.css';

export const EventsHandler = React.memo(() => {
  const events = useAppSelector(
    (state: RootState) => state.game.events,
    shallowEqual
  );

  useEffect(() => {
    if (events) {
      for (const event of events) {
        switch (event.eventType) {
          case 'ROLL':
            toast(`Die rolled, result: ${event.eventValue}`);
            continue;
          case 'REVEAL':
            toast((t) => (
              <div className={styles.card}>
                Card Revealed
                <CardDisplay
                  card={{ cardNumber: event.eventValue ?? '' }}
                  makeMeBigger
                />
              </div>
            ));
            continue;
          case 'DISCARD':
            toast((t) => (
              <div className={styles.card}>
                Card Discarded
                <CardDisplay
                  card={{ cardNumber: event.eventValue ?? '' }}
                  makeMeBigger
                />
              </div>
            ));
            continue;
          case 'BANISH':
            toast((t) => (
              <div className={styles.card}>
                Card Banished
                <CardDisplay
                  card={{ cardNumber: event.eventValue ?? '' }}
                  makeMeBigger
                />
              </div>
            ));
            continue;
          default:
            continue;
        }
      }
    }
  }, [events]);

  return null;
});

EventsHandler.displayName = 'EventsHandler';
export default EventsHandler;

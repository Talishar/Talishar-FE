import React from 'react';
import { useEffect } from 'react';
import { toast } from 'react-hot-toast';
import {
  GiAngelOutfit,
  GiDiceSixFacesFive,
  GiDiceSixFacesFour,
  GiDiceSixFacesOne,
  GiDiceSixFacesSix,
  GiDiceSixFacesThree,
  GiDiceSixFacesTwo
} from 'react-icons/gi';
import { shallowEqual } from 'react-redux';
import { useAppDispatch, useAppSelector } from 'app/Hooks';
import { RootState } from 'app/Store';
import CardDisplay from '../cardDisplay/CardDisplay';
import CardImage from '../cardImage/CardImage';
import styles from './EventsHandler.module.css';
import { setupListeners } from '@reduxjs/toolkit/dist/query';
import { ReactNode } from 'react';

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
            toast((t) => (
              <div className={styles.card}>
                Die rolled, result:
                <div className={styles.die}>{dieRoll(event.eventValue)}</div>
              </div>
            ));
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
          case 'SOUL':
            toast((t) => (
              <div className={styles.card}>
                Into Soul <GiAngelOutfit />
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

const dieRoll = (rolled: string | undefined) => {
  let fragment = <p>{rolled}</p>;
  fragment = rolled === '1' ? <GiDiceSixFacesOne /> : fragment;
  fragment = rolled === '2' ? <GiDiceSixFacesTwo /> : fragment;
  fragment = rolled === '3' ? <GiDiceSixFacesThree /> : fragment;
  fragment = rolled === '4' ? <GiDiceSixFacesFour /> : fragment;
  fragment = rolled === '5' ? <GiDiceSixFacesFive /> : fragment;
  fragment = rolled === '6' ? <GiDiceSixFacesSix /> : fragment;
  return <>{fragment}</>;
};

EventsHandler.displayName = 'EventsHandler';
export default EventsHandler;

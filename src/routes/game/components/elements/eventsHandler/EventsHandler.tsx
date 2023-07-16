import { useAppDispatch, useAppSelector } from 'app/Hooks';
import { RootState } from 'app/Store';
import { PROCESS_INPUT } from 'appConstants';
import { getGameInfo, submitButton } from 'features/game/GameSlice';
import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
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
import CardDisplay from '../cardDisplay/CardDisplay';
import styles from './EventsHandler.module.css';

export const EventsHandler = React.memo(() => {
  const events = useAppSelector(
    (state: RootState) => state.game.events,
    shallowEqual
  );

  const [showModal, setShowModal] = useState(false);
  const [modal, setModal] = useState('');
  const { playerID } = useAppSelector(getGameInfo, shallowEqual);
  const dispatch = useAppDispatch();

  const clickYes = (e: any) => {
    e.preventDefault();
    setShowModal(false);
    dispatch(submitButton({ button: { mode: PROCESS_INPUT.ENABLE_CHAT } }));
  };

  const clickNo = (e: any) => {
    e.preventDefault();
    setShowModal(false);
  };

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
          case 'REQUESTCHAT':
            if (parseInt(event.eventValue ?? '0') !== playerID) {
              setShowModal(true);
              setModal('Do you want to enable chat?');
            }
            continue;
          default:
            continue;
        }
      }
    }
  }, [events]);

  if (showModal)
    return (
      <>
        {createPortal(
          <dialog open className={styles.modal}>
            <article>
              <header>{modal}</header>
              <button onClick={clickYes}>YES</button>
              <button onClick={clickNo}>NO</button>
            </article>
          </dialog>,
          document.body
        )}
      </>
    );
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

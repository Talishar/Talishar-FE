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

  enum ModalType {
    RequestChat = 0,
    RequestUndo = 1,
    RequestThisTurnUndo = 2,
    RequestLastTurnUndo = 3
  }

  const [showModal, setShowModal] = useState(false);
  const [modal, setModal] = useState('');
  const [modalType, setModalType] = useState(ModalType.RequestChat);
  const { playerID } = useAppSelector(getGameInfo, shallowEqual);
  const dispatch = useAppDispatch();

  const clickYes = (e: any) => {
    e.preventDefault();
    setShowModal(false);
    if (modalType == ModalType.RequestUndo)
      dispatch(submitButton({ button: { mode: PROCESS_INPUT.CONFIRM_UNDO } }));
    else if (modalType == ModalType.RequestThisTurnUndo)
      dispatch(
        submitButton({ button: { mode: PROCESS_INPUT.CONFIRM_THIS_TURN_UNDO } })
      );
    else if (modalType == ModalType.RequestLastTurnUndo)
      dispatch(
        submitButton({ button: { mode: PROCESS_INPUT.CONFIRM_LAST_TURN_UNDO } })
      );
    else
      dispatch(submitButton({ button: { mode: PROCESS_INPUT.ENABLE_CHAT } }));
  };

  const clickNo = (e: any) => {
    e.preventDefault();
    setShowModal(false);
    if (
      modalType == ModalType.RequestUndo ||
      modalType == ModalType.RequestThisTurnUndo ||
      modalType == ModalType.RequestLastTurnUndo
    )
      dispatch(submitButton({ button: { mode: PROCESS_INPUT.DECLINE_UNDO } }));
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
            if (parseInt(event.eventValue ?? '0') !== playerID && playerID !== 3) {
              setShowModal(true);
              setModalType(ModalType.RequestChat);
              setModal('Do you want to enable chat?');
            }
            continue;
          case 'REQUESTUNDO':
            if (parseInt(event.eventValue ?? '0') !== playerID && playerID !== 3) {
              setShowModal(true);
              setModalType(ModalType.RequestUndo);
              setModal(
                'Do you want to allow the opponent to undo the last action?'
              );
            }
            continue;
          case 'REQUESTTHISTURNUNDO':
            if (parseInt(event.eventValue ?? '0') !== playerID && playerID !== 3) {
              setShowModal(true);
              setModalType(ModalType.RequestThisTurnUndo);
              setModal('Do you want to allow the opponent to undo this turn?');
            }
            continue;
          case 'REQUESTLASTTURNUNDO':
            if (parseInt(event.eventValue ?? '0') !== playerID) {
              setShowModal(true);
              setModalType(ModalType.RequestLastTurnUndo);
              setModal(
                'Do you want to allow the opponent to revert to last turn?'
              );
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

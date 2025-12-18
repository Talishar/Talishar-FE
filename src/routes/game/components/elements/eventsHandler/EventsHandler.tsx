import { useAppDispatch, useAppSelector } from 'app/Hooks';
import { RootState } from 'app/Store';
import { PROCESS_INPUT } from 'appConstants';
import { getGameInfo, submitButton } from 'features/game/GameSlice';
import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { toast } from 'react-hot-toast';
import {
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
import { setShuffling, setAddBotDeck } from 'features/game/GameSlice';

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
      dispatch(
        submitButton({ button: { mode: PROCESS_INPUT.DECLINE_UNDO } })
      );
    else
      dispatch(
        submitButton({ button: { mode: PROCESS_INPUT.DECLINE_CHAT } })
    );
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
            ), { duration: 5000 });
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
            ), { duration: 5000 });
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
            ), { duration: 5000 });
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
            ), { duration: 5000 });
            continue;
          case 'SOUL':
            toast((t) => (
              <div className={styles.card}>
                Into Soul
                <CardDisplay
                  card={{ cardNumber: event.eventValue ?? '' }}
                  makeMeBigger
                />
              </div>
            ), { duration: 5000 });
            continue;
          case 'REQUESTCHAT':
            if (
              parseInt(event.eventValue ?? '0') !== playerID &&
              playerID !== 3
            ) {
              setShowModal(true);
              setModalType(ModalType.RequestChat);
              setModal('Do you want to enable chat?');
            }
            continue;
          case 'REQUESTUNDO':
            if (
              parseInt(event.eventValue ?? '0') !== playerID &&
              playerID !== 3
            ) {
              setShowModal(true);
              setModalType(ModalType.RequestUndo);
              setModal(
                'Do you want to allow the opponent to undo their last action?'
              );
            }
            continue;
          case 'REQUESTTHISTURNUNDO':
            if (
              parseInt(event.eventValue ?? '0') !== playerID &&
              playerID !== 3
            ) {
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
          case 'UNDODENIEDNOTICE':
            if (parseInt(event.eventValue ?? '0') === playerID) {
              toast.error('Your undo requests have been declined too many times. No more undo requests allowed this turn.', { duration: 5000 });
            }
            continue;
          case "SHUFFLE":
            const PlayerShuffling = event.eventValue !== undefined ? parseInt(event.eventValue) : null;

            dispatch(setShuffling({ playerId: PlayerShuffling, isShuffling: true }));
            requestAnimationFrame(() => {
              setTimeout(() => {
                dispatch(setShuffling({ playerId: null, isShuffling: false }));
              }, 1000);
            });
            continue;
          case "ADDBOTDECK":
            const PlayerAddingCard = event.eventValue !== undefined ? parseInt(event.eventValue.split(',')[0]) : null;
            const CardToAdd = event.eventValue !== undefined ? event.eventValue.split(',')[1] : '';
            dispatch(setAddBotDeck({ playerId: PlayerAddingCard, cardNumber: CardToAdd }));
            requestAnimationFrame(() => {
              setTimeout(() => {
                dispatch(setAddBotDeck({ playerId: null, cardNumber: '' }));
              }, 1000);
            });
            continue;
          default:
            continue;
        }
      }
    }
  }, [events, dispatch, playerID]);

  if (showModal)
    return (
      <>
        {createPortal(
          <dialog open className={styles.modal}>
            <article className={styles.container}>
              <header>{modal}</header>
              <button onClick={clickYes}>Yes</button>
              <button onClick={clickNo}>No</button>
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

import { useAppDispatch, useAppSelector } from 'app/Hooks';
import { RootState } from 'app/Store';
import { PROCESS_INPUT } from 'appConstants';
import { getGameInfo, submitButton } from 'features/game/GameSlice';
import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { toast } from 'react-hot-toast';
import useSound from 'use-sound';
import { getSettingsEntity } from 'features/options/optionsSlice';
import shuffleSound from 'sounds/shuffle.m4a';
import prioritySound from 'sounds/prioritySound.wav';
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
import {
  setShuffling,
  setAddBotDeck,
  setClashReveal,
  setArsenalFlip,
  setArsenalDestroy
} from 'features/game/GameSlice';

enum ModalType {
  RequestChat = 0,
  RequestUndo = 1,
  RequestThisTurnUndo = 2,
  RequestLastTurnUndo = 3,
  RequestChainLinkUndo = 4
}

export const EventsHandler = React.memo(() => {
  const events = useAppSelector(
    (state: RootState) => state.game.events,
    shallowEqual
  );
  const lastProcessedEventsRef = React.useRef<typeof events>(undefined);

  const [showModal, setShowModal] = useState(false);
  const [modal, setModal] = useState('');
  const [modalType, setModalType] = useState(ModalType.RequestChat);
  const { playerID } = useAppSelector(getGameInfo, shallowEqual);
  const hasPriority = useAppSelector((state: RootState) => state.game.hasPriority);
  const settingsData = useAppSelector(getSettingsEntity);
  const isMuted = settingsData['MuteSound']?.value === '1';
  const [playShuffleSound] = useSound(shuffleSound, { volume: 0.5 });
  const [playPrioritySound] = useSound(prioritySound);
  const dispatch = useAppDispatch();

  const isUndoModal = (type: ModalType) =>
    type === ModalType.RequestUndo ||
    type === ModalType.RequestThisTurnUndo ||
    type === ModalType.RequestLastTurnUndo ||
    type === ModalType.RequestChainLinkUndo;

  useEffect(() => {
    const link = document.getElementById('favicon') as HTMLLinkElement;
    if (showModal && isUndoModal(modalType)) {
      if (!isMuted) playPrioritySound();
      if (link) link.href = '/images/priorityGreen.ico';
    } else if (!showModal && link) {
      // Restore favicon to whatever PassTurnDisplay would show
      link.href = hasPriority && playerID !== 3
        ? '/images/priorityGreen.ico'
        : '/images/priorityGrey.ico';
    }
  }, [showModal, modalType, isMuted, playPrioritySound, hasPriority, playerID]);

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
    else if (modalType == ModalType.RequestChainLinkUndo)
      dispatch(
        submitButton({ button: { mode: PROCESS_INPUT.CONFIRM_CHAIN_LINK_UNDO } })
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
      modalType == ModalType.RequestLastTurnUndo ||
      modalType == ModalType.RequestChainLinkUndo
    )
      dispatch(submitButton({ button: { mode: PROCESS_INPUT.DECLINE_UNDO } }));
    else
      dispatch(submitButton({ button: { mode: PROCESS_INPUT.DECLINE_CHAT } }));
  };

  useEffect(() => {
    if (events && events !== lastProcessedEventsRef.current) {
      lastProcessedEventsRef.current = events;
      const CLASH_DISPLAY_DURATION = 7600;
      const CLASH_FIRST_DURATION = 3600;

      // Group CLASH events into rounds due to Trounce double clash and similar effects
      const clashRounds: Array<Array<{ playerId: number; cardNumber: string }>> = [];
      {
        let currentRound: Array<{ playerId: number; cardNumber: string }> = [];
        const seenPlayers = new Set<number>();
        for (const event of events) {
          if (event.eventType !== 'CLASH') continue;
          const [pid, card] = (event.eventValue ?? '').split(':');
          const playerId = parseInt(pid);
          if (seenPlayers.has(playerId)) {
            clashRounds.push(currentRound);
            currentRound = [];
            seenPlayers.clear();
          }
          currentRound.push({ playerId, cardNumber: card });
          seenPlayers.add(playerId);
        }
        if (currentRound.length > 0) clashRounds.push(currentRound);
      }

      const hasMultipleRounds = clashRounds.length > 1;
      let cumulativeDelay = 0;
      clashRounds.forEach((round, roundIndex) => {
        const isLastRound = roundIndex === clashRounds.length - 1;
        const displayDuration =
          hasMultipleRounds && !isLastRound ? CLASH_FIRST_DURATION : CLASH_DISPLAY_DURATION;
        const startDelay = cumulativeDelay;
        cumulativeDelay += displayDuration;
        setTimeout(() => {
          round.forEach(({ playerId, cardNumber }) => {
            dispatch(setClashReveal({ playerId, cardNumber }));
          });
          if (isLastRound) {
            setTimeout(() => {
              dispatch(setClashReveal({ playerId: null, cardNumber: '' }));
            }, displayDuration);
          }
        }, startDelay);
      });

      for (const event of events) {
        switch (event.eventType) {
          case 'ROLL':
            toast(
              (t) => (
                <div className={styles.card}>
                  Die rolled, result:
                  <div className={styles.die}>{dieRoll(event.eventValue)}</div>
                </div>
              ),
              { duration: 5000 }
            );
            continue;
          case 'REVEAL': {
            const revealValue = event.eventValue ?? '';
            const colonIndex = revealValue.indexOf(':');
            const revealPlayerID = colonIndex !== -1 ? parseInt(revealValue.slice(0, colonIndex)) : null;
            const revealCardNumber = colonIndex !== -1 ? revealValue.slice(colonIndex + 1) : revealValue;
            const revealIsPlayer = revealPlayerID !== null ? revealPlayerID === playerID : undefined;
            toast(
              (t) => (
                <div className={styles.card}>
                  Card Revealed
                  <CardDisplay
                    card={{ cardNumber: revealCardNumber }}
                    makeMeBigger
                    isPlayer={revealIsPlayer}
                  />
                </div>
              ),
              { duration: 5000 }
            );
            continue;
          }
          case 'CLASH':
            continue;
          case 'TURNARSENALFACEUP': {
            const arsenalValue = event.eventValue ?? '';
            const [arsenalPlayerID, arsenalCardNumber] =
              arsenalValue.split(':');
            dispatch(
              setArsenalFlip({
                playerId: parseInt(arsenalPlayerID),
                cardNumber: arsenalCardNumber
              })
            );
            requestAnimationFrame(() => {
              setTimeout(() => {
                dispatch(setArsenalFlip({ playerId: null, cardNumber: '' }));
              }, 300);
            });
            continue;
          }
          case 'ARSENALDESTROY': {
            const destroyValue = event.eventValue ?? '';
            const [destroyPlayerID, destroyCardNumber] = destroyValue.split(':');
            dispatch(
              setArsenalDestroy({
                playerId: parseInt(destroyPlayerID),
                cardNumber: destroyCardNumber
              })
            );
            requestAnimationFrame(() => {
              setTimeout(() => {
                dispatch(setArsenalDestroy({ playerId: null, cardNumber: '' }));
              }, 1000);
            });
            continue;
          }
          case 'DISCARD':
            toast(
              (t) => (
                <div className={styles.card}>
                  Card Discarded
                  <CardDisplay
                    card={{ cardNumber: event.eventValue ?? '' }}
                    makeMeBigger
                  />
                </div>
              ),
              { duration: 5000 }
            );
            continue;
          case 'BANISH':
            toast(
              (t) => (
                <div className={styles.card}>
                  Card Banished
                  <CardDisplay
                    card={{ cardNumber: event.eventValue ?? '' }}
                    makeMeBigger
                  />
                </div>
              ),
              { duration: 5000 }
            );
            continue;
          case 'SOUL':
            toast(
              (t) => (
                <div className={styles.card}>
                  Into Soul
                  <CardDisplay
                    card={{ cardNumber: event.eventValue ?? '' }}
                    makeMeBigger
                  />
                </div>
              ),
              { duration: 5000 }
            );
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
          case 'REQUESTCHAINLINKUNDO':
            if (
              parseInt(event.eventValue ?? '0') !== playerID &&
              playerID !== 3
            ) {
              setShowModal(true);
              setModalType(ModalType.RequestChainLinkUndo);
              setModal(
                'Do you want to allow the opponent to revert to the start of the chain link?'
              );
            }
            continue;
          case 'UNDODENIEDNOTICE':
            if (parseInt(event.eventValue ?? '0') === playerID) {
              toast.error(
                'Your undo requests have been declined too many times. No more undo requests allowed this turn.',
                { duration: 5000 }
              );
            }
            continue;
          case 'SHUFFLE':
            const PlayerShuffling =
              event.eventValue !== undefined
                ? parseInt(event.eventValue)
                : null;

            if (!isMuted) {
              playShuffleSound();
            }
            dispatch(
              setShuffling({ playerId: PlayerShuffling, isShuffling: true })
            );
            requestAnimationFrame(() => {
              setTimeout(() => {
                dispatch(setShuffling({ playerId: null, isShuffling: false }));
              }, 1000);
            });
            continue;
          case 'ADDBOTDECK':
            const PlayerAddingCard =
              event.eventValue !== undefined
                ? parseInt(event.eventValue.split(',')[0])
                : null;
            const CardToAdd =
              event.eventValue !== undefined
                ? event.eventValue.split(',')[1]
                : '';
            dispatch(
              setAddBotDeck({
                playerId: PlayerAddingCard,
                cardNumber: CardToAdd
              })
            );
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
  }, [events, dispatch, playerID, isMuted, playShuffleSound]);

  if (showModal)
    return (
      <>
        {createPortal(
          <dialog open className={styles.modal}>
            <div className={styles.container}>
              <div className={styles.dialogHeader}>{modal}</div>
              <div className={styles.dialogFooter}>
                <button onClick={clickYes}>Yes</button>
                <button onClick={clickNo}>No</button>
              </div>
            </div>
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

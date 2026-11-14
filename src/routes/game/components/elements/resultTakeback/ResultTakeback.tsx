import { useEffect, useRef, useState } from 'react';
import { shallowEqual } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { toast } from 'react-hot-toast';
import { useAppDispatch, useAppSelector } from 'app/Hooks';
import { PROCESS_INPUT } from 'appConstants';
import { getGameInfo, submitButton } from 'features/game/GameSlice';
import useGameSound from 'hooks/useGameSound';
import prioritySound from 'sounds/prioritySound.wav';
import styles from './ResultTakeback.module.css';

const TICK_MS = 500;

const SCOPE_LABEL_KEYS: Record<string, string> = {
  chainlink: 'END_GAME.TAKEBACK_SCOPE_CHAIN_LINK',
  turn: 'END_GAME.TAKEBACK_SCOPE_TURN',
  lastturn: 'END_GAME.TAKEBACK_SCOPE_LAST_TURN'
};

const formatClock = (ms: number) => {
  const seconds = Math.max(0, Math.ceil(ms / 1000));
  return `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, '0')}`;
};

export default function ResultTakeback() {
  const dispatch = useAppDispatch();
  const { t } = useTranslation();
  const pending = useAppSelector(
    (state) => state.game.resultPending,
    shallowEqual
  );
  const serverTimeOffset = useAppSelector(
    (state) => state.game.serverTimeOffset ?? 0
  );
  const { playerID } = useAppSelector(getGameInfo, shallowEqual);
  const [now, setNow] = useState(() => Date.now());
  const [awaitingServer, setAwaitingServer] = useState(false);
  const sentResultKeyRef = useRef('');
  const myRequestWasOpenRef = useRef(false);
  const [playPrioritySound, isPrioritySoundOff] = useGameSound(
    prioritySound,
    'priority'
  );

  const isPlayer = playerID === 1 || playerID === 2;
  const hasPending = !!pending;
  const serverNow = now + serverTimeOffset;
  const requestOpen =
    !!pending && pending.requestedBy > 0 && pending.requestDeadline > serverNow;
  const myRequestOpen = requestOpen && pending?.requestedBy === playerID;
  const opponentRequestOpen = requestOpen && pending?.requestedBy !== playerID;
  const requestRemainingMs = pending ? pending.requestDeadline - serverNow : 0;
  const dueAt = pending
    ? Math.max(pending.deadline, requestOpen ? pending.requestDeadline : 0)
    : 0;

  useEffect(() => {
    if (!hasPending) return;
    setNow(Date.now());
    const interval = setInterval(() => setNow(Date.now()), TICK_MS);
    return () => clearInterval(interval);
  }, [hasPending]);

  useEffect(() => {
    setAwaitingServer(false);
  }, [pending?.requestedBy, pending?.requestDeadline, pending?.declines]);

  useEffect(() => {
    if (!pending || !isPlayer || serverNow < dueAt) return;
    const key = `${pending.deadline}:${pending.requestDeadline}`;
    if (sentResultKeyRef.current === key) return;
    sentResultKeyRef.current = key;
    dispatch(
      submitButton({ button: { mode: PROCESS_INPUT.SEND_HELD_RESULT } })
    );
  }, [pending, isPlayer, serverNow, dueAt, dispatch]);

  const opponentRequestKey = opponentRequestOpen
    ? pending?.requestDeadline ?? 0
    : 0;
  useEffect(() => {
    if (opponentRequestKey && !isPrioritySoundOff) playPrioritySound();
  }, [opponentRequestKey, isPrioritySoundOff, playPrioritySound]);

  useEffect(() => {
    if (myRequestOpen) {
      myRequestWasOpenRef.current = true;
      return;
    }
    if (!myRequestWasOpenRef.current) return;
    myRequestWasOpenRef.current = false;
    if (!pending) return;
    toast(
      pending.requestedBy === 0
        ? t('END_GAME.TAKEBACK_DECLINED')
        : t('END_GAME.TAKEBACK_NO_ANSWER'),
      { duration: 5000 }
    );
  }, [myRequestOpen, pending, t]);

  if (!pending || !isPlayer) return null;

  const answerTakeback = (accept: boolean) => {
    setAwaitingServer(true);
    dispatch(
      submitButton({
        button: {
          mode: accept
            ? PROCESS_INPUT.ACCEPT_TAKEBACK
            : PROCESS_INPUT.DECLINE_TAKEBACK
        }
      })
    );
  };

  if (opponentRequestOpen) {
    const pointKey = SCOPE_LABEL_KEYS[pending.requestScope];
    return (
      <div className={styles.panel} role="alertdialog" aria-live="assertive">
        <div className={styles.text}>
          <span className={styles.heading}>
            {pointKey
              ? t('END_GAME.TAKEBACK_OPPONENT_ASKS_POINT', {
                  point: t(pointKey)
                })
              : t('END_GAME.TAKEBACK_OPPONENT_ASKS_ACTION')}
          </span>
          <span className={styles.detail}>
            {t('END_GAME.TAKEBACK_OPPONENT_ASKS_DETAIL')}
          </span>
        </div>
        <div className={styles.actions}>
          <button
            type="button"
            className={styles.button}
            onClick={() => answerTakeback(true)}
            disabled={awaitingServer}
          >
            {t('END_GAME.TAKEBACK_ACCEPT')}
          </button>
          <button
            type="button"
            className={styles.button}
            onClick={() => answerTakeback(false)}
            disabled={awaitingServer}
          >
            {t('END_GAME.TAKEBACK_DECLINE', {
              time: formatClock(requestRemainingMs)
            })}
          </button>
        </div>
      </div>
    );
  }

  if (myRequestOpen) {
    return (
      <div className={styles.panel} aria-live="polite">
        <div className={styles.text}>
          <span className={styles.heading}>
            {t('END_GAME.TAKEBACK_WAITING', {
              time: formatClock(requestRemainingMs)
            })}
          </span>
          <span className={styles.detail}>
            {t('END_GAME.TAKEBACK_WAITING_DETAIL')}
          </span>
        </div>
      </div>
    );
  }

  return null;
}

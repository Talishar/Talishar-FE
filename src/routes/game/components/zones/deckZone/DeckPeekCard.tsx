import React, { useEffect, useRef, useState } from 'react';
import classNames from 'classnames';
import { shallowEqual } from 'react-redux';
import { FaEye } from 'react-icons/fa';
import { useAppDispatch, useAppSelector } from 'app/Hooks';
import { RootState } from 'app/Store';
import { setDeckPeek } from 'features/game/GameSlice';
import CardDisplay from '../../elements/cardDisplay/CardDisplay';
import styles from './DeckZone.module.css';

const PEEK_DURATION = 10000;

const selectActionSignature = (state: RootState) => [
  state.game.gameDynamicInfo.turnNo,
  state.game.gameDynamicInfo.lastPlayed,
  state.game.hasPriority,
  state.game.priorityPlayer,
  state.game.playerPrompt,
  state.game.playerInputPopUp,
  state.game.playerOne.DeckSize,
  state.game.playerTwo.DeckSize
];

interface DeckPeekCardProps {
  isPlayer: boolean;
  style?: React.CSSProperties;
  showCountersOnHover?: boolean;
}

export default function DeckPeekCard({
  isPlayer,
  style,
  showCountersOnHover
}: DeckPeekCardProps) {
  const dispatch = useAppDispatch();
  const peekCard = useAppSelector((state: RootState) =>
    state.game.deckPeekIsPlayer === isPlayer ? state.game.deckPeekCard : ''
  );
  const peekTrigger = useAppSelector(
    (state: RootState) => state.game.deckPeekTrigger
  );
  const actionSignature = useAppSelector(selectActionSignature, shallowEqual);
  const signatureAtPeek = useRef<unknown[] | null>(null);
  const [isClosing, setIsClosing] = useState(false);
  const [timerDone, setTimerDone] = useState(false);
  const [actionTaken, setActionTaken] = useState(false);

  useEffect(() => {
    if (!peekCard) return;
    signatureAtPeek.current = actionSignature;
    setIsClosing(false);
    setTimerDone(false);
    setActionTaken(false);
    const timer = setTimeout(() => setTimerDone(true), PEEK_DURATION);
    return () => clearTimeout(timer);
  }, [peekTrigger]);

  useEffect(() => {
    if (
      peekCard &&
      signatureAtPeek.current &&
      !shallowEqual(signatureAtPeek.current, actionSignature)
    ) {
      setActionTaken(true);
    }
  }, [actionSignature, peekCard]);

  useEffect(() => {
    if (timerDone && actionTaken) setIsClosing(true);
  }, [timerDone, actionTaken]);

  if (!peekCard) return null;

  const dismiss = (event: React.MouseEvent) => {
    event.stopPropagation();
    setIsClosing(true);
  };

  const onAnimationEnd = (event: React.AnimationEvent<HTMLDivElement>) => {
    if (event.target !== event.currentTarget || !isClosing) return;
    signatureAtPeek.current = null;
    dispatch(setDeckPeek({ cardNumber: '' }));
  };

  return (
    <div
      key={`deckPeek-${peekTrigger}`}
      className={classNames(
        styles.deckPeekCard,
        isClosing && styles.deckPeekCardClosing
      )}
      style={style}
      onClick={dismiss}
      onAnimationEnd={onAnimationEnd}
      title={`Top of ${
        isPlayer ? 'your' : "your opponent's"
      } deck. Only you can see this.`}
    >
      <CardDisplay
        card={{ cardNumber: peekCard }}
        showCountersOnHover={showCountersOnHover}
        isPlayer={isPlayer}
      />
      <div className={styles.deckPeekBadge} aria-hidden="true">
        <FaEye />
      </div>
    </div>
  );
}

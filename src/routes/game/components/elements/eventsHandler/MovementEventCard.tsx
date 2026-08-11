import React from 'react';
import classNames from 'classnames';
import { FaEye, FaFireAlt, FaLayerGroup, FaSun } from 'react-icons/fa';
import { ToastOptions } from 'react-hot-toast';
import CardDisplay from '../cardDisplay/CardDisplay';
import styles from './EventsHandler.module.css';

export type MovementEventType = 'REVEAL' | 'DISCARD' | 'BANISH' | 'SOUL';

export const MOVEMENT_TOAST_OPTIONS = {
  duration: 5000,
  style: {
    minWidth: 0,
    width: 'fit-content',
    padding: '0.25rem'
  }
} satisfies ToastOptions;

const EVENT_PRESENTATION = {
  REVEAL: {
    label: 'Card Revealed',
    className: styles.revealEvent,
    Icon: FaEye
  },
  DISCARD: {
    label: 'Card Discarded',
    className: styles.discardEvent,
    Icon: FaLayerGroup
  },
  BANISH: {
    label: 'Card Banished',
    className: styles.banishEvent,
    Icon: FaFireAlt
  },
  SOUL: {
    label: 'Into Soul',
    className: styles.soulEvent,
    Icon: FaSun
  }
} satisfies Record<
  MovementEventType,
  {
    label: string;
    className: string;
    Icon: React.ComponentType<{ 'aria-hidden'?: boolean }>;
  }
>;

interface MovementEventCardProps {
  type: MovementEventType;
  cardNumber: string;
  isPlayer?: boolean;
  onDismiss?: () => void;
}

export default function MovementEventCard({
  type,
  cardNumber,
  isPlayer,
  onDismiss
}: MovementEventCardProps) {
  const presentation = EVENT_PRESENTATION[type];
  const { Icon } = presentation;

  const dismissOnKeyboard = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (!onDismiss || (event.key !== 'Enter' && event.key !== ' ')) return;
    event.preventDefault();
    onDismiss();
  };

  return (
    <div
      className={classNames(
        styles.card,
        styles.movementEvent,
        presentation.className
      )}
      onClick={onDismiss}
      onKeyDown={dismissOnKeyboard}
      role={onDismiss ? 'button' : undefined}
      tabIndex={onDismiss ? 0 : undefined}
      title={onDismiss ? 'Click to dismiss' : undefined}
    >
      <div className={styles.movementEventHeading}>
        <Icon aria-hidden={true} />
        <span>{presentation.label}</span>
      </div>
      <div className={styles.movementEventStage}>
        <div className={styles.movementEventAura} aria-hidden="true" />
        <div className={styles.movementEventCard}>
          <CardDisplay card={{ cardNumber }} makeMeBigger isPlayer={isPlayer} />
        </div>
      </div>
    </div>
  );
}

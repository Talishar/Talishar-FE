import React from 'react';
import classNames from 'classnames';
import { FaEye, FaFireAlt, FaLayerGroup, FaSun } from 'react-icons/fa';
import { ToastOptions } from 'react-hot-toast';
import CardDisplay from '../cardDisplay/CardDisplay';
import styles from './EventsHandler.module.css';
import { useTranslation } from 'react-i18next';

export type MovementEventType =
  | 'REVEAL'
  | 'DISCARD'
  | 'BANISH'
  | 'SOUL';

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
    labelKey: 'MOVEMENT_EVENT.REVEALED',
    className: styles.revealEvent,
    Icon: FaEye
  },
  DISCARD: {
    labelKey: 'MOVEMENT_EVENT.DISCARDED',
    className: styles.discardEvent,
    Icon: FaLayerGroup
  },
  BANISH: {
    labelKey: 'MOVEMENT_EVENT.BANISHED',
    className: styles.banishEvent,
    Icon: FaFireAlt
  },
  SOUL: {
    labelKey: 'MOVEMENT_EVENT.INTO_SOUL',
    className: styles.soulEvent,
    Icon: FaSun
  }
} satisfies Record<
  MovementEventType,
  {
    labelKey: string;
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
  const { t } = useTranslation();
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
      title={onDismiss ? t('MOVEMENT_EVENT.CLICK_TO_DISMISS') : undefined}
    >
      <div className={styles.movementEventHeading}>
        <Icon aria-hidden={true} />
        <span>{t(presentation.labelKey)}</span>
      </div>
      <div className={styles.movementEventStage}>
        <div className={styles.movementEventAura} aria-hidden="true" />
        <div className={styles.movementEventCard}>
          <CardDisplay
            card={{ cardNumber }}
            containerClassName={styles.movementEventCardDisplay}
            makeMeBigger
            isPlayer={isPlayer}
          />
        </div>
      </div>
    </div>
  );
}

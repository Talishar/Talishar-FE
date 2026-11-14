import { ReactNode } from 'react';
import classNames from 'classnames';
import { useTranslation } from 'react-i18next';
import {
  FaExclamationCircle,
  FaExclamationTriangle,
  FaInfoCircle
} from 'react-icons/fa';
import { ServerError, ServerErrorCard } from 'utils/serverError';
import styles from './Notice.module.css';

export type NoticeTone = 'error' | 'warning' | 'info';

const ICONS = {
  error: FaExclamationCircle,
  warning: FaExclamationTriangle,
  info: FaInfoCircle
};

interface NoticeProps {
  tone: NoticeTone;
  title: ReactNode;
  children?: ReactNode;
  className?: string;
  id?: string;
}

const Notice = ({ tone, title, children, className, id }: NoticeProps) => {
  const Icon = ICONS[tone];
  return (
    <div
      id={id}
      className={classNames(styles.notice, styles[tone], className)}
      role={tone === 'error' ? 'alert' : 'status'}
    >
      <Icon className={styles.icon} aria-hidden="true" />
      <p className={styles.title}>{title}</p>
      {children && <div className={styles.detail}>{children}</div>}
    </div>
  );
};

const PITCH_KEYS: Record<number, string> = {
  1: 'NOTICE.PITCH_RED',
  2: 'NOTICE.PITCH_YELLOW',
  3: 'NOTICE.PITCH_BLUE'
};

export const NoticeCardList = ({ cards }: { cards: ServerErrorCard[] }) => {
  const { t } = useTranslation();
  return (
    <ul className={styles.cards}>
      {cards.map((card) => (
        <li key={card.id} className={styles.card}>
          {PITCH_KEYS[card.pitch] && (
            <span
              className={classNames(styles.pip, styles[`pitch${card.pitch}`])}
              role="img"
              aria-label={t(PITCH_KEYS[card.pitch])}
              title={t(PITCH_KEYS[card.pitch])}
            />
          )}
          {card.name}
        </li>
      ))}
    </ul>
  );
};

export const ServerErrorNotice = ({
  error,
  className
}: {
  error: ServerError;
  className?: string;
}) => (
  <Notice tone="error" title={error.title} className={className}>
    {error.cards && error.cards.length > 0 && (
      <NoticeCardList cards={error.cards} />
    )}
  </Notice>
);

export default Notice;

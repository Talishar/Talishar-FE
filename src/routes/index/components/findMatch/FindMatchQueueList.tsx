import { ReactNode, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { FaTimes } from 'react-icons/fa';
import { formatDisplayName } from 'utils/heroLegality';
import {
  FindMatchQueueEntry,
  FindMatchQueueStatus
} from './useFindMatchQueues';
import styles from './FindMatchQueueList.module.css';

interface Props {
  queues: FindMatchQueueEntry[];
  statuses: Record<string, FindMatchQueueStatus>;
  startedAt: number | null;
  onLeave: (id: string) => void;
  onLeaveAll: () => void;
  footer?: ReactNode;
}

const formatElapsed = (ms: number) => {
  const seconds = Math.max(0, Math.floor(ms / 1000));
  return `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, '0')}`;
};

const FindMatchQueueList = ({
  queues,
  statuses,
  startedAt,
  onLeave,
  onLeaveAll,
  footer
}: Props) => {
  const { t } = useTranslation();
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    if (startedAt === null) return;
    setNow(Date.now());
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, [startedAt]);

  if (queues.length === 0) return null;

  return (
    <div
      className={styles.queues}
      role="group"
      aria-label={t('FIND_MATCH.QUEUES')}
    >
      <div className={styles.header}>
        <span className={styles.heading} aria-live="polite">
          {t('FIND_MATCH.SEARCHING_FOR', {
            time: formatElapsed(now - (startedAt ?? now))
          })}
        </span>
        {queues.length > 1 && (
          <button type="button" className={styles.cancel} onClick={onLeaveAll}>
            {t('FIND_MATCH.LEAVE_ALL')}
          </button>
        )}
      </div>
      <ul className={styles.list}>
        {queues.map((queue) => {
          const format = formatDisplayName(t, queue.format);
          return (
            <li key={queue.id} className={styles.row}>
              {queue.heroImage ? (
                <img
                  className={styles.hero}
                  src={queue.heroImage}
                  alt=""
                  aria-hidden="true"
                />
              ) : (
                <span className={styles.hero} aria-hidden="true" />
              )}
              <span className={styles.text}>
                <span className={styles.format}>{format}</span>
                <span className={styles.deck}>{queue.deckLabel}</span>
              </span>
              <span className={styles.status}>
                {statuses[queue.id] === 'hosting'
                  ? t('FIND_MATCH.QUEUE_HOSTING')
                  : t('FIND_MATCH.QUEUE_SEARCHING')}
              </span>
              <button
                type="button"
                className={styles.remove}
                onClick={() => onLeave(queue.id)}
                aria-label={t('FIND_MATCH.LEAVE_QUEUE', { format })}
                data-compact-tooltip={t('FIND_MATCH.LEAVE_QUEUE', { format })}
              >
                <FaTimes aria-hidden="true" />
              </button>
            </li>
          );
        })}
      </ul>
      {footer && <div className={styles.footer}>{footer}</div>}
    </div>
  );
};

export default FindMatchQueueList;

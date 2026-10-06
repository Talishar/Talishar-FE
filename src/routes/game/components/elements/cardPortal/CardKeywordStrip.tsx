import React from 'react';
import classNames from 'classnames';
import { getKeywordEntry, normalizeKeyword } from 'data/keywords';
import { useCardKeywords } from 'utils/cardKeywords';
import styles from './CardPortal.module.css';
import { useTranslation } from 'react-i18next';
import { useCookieString } from 'utils/cookieStore';
import { DISABLE_FANNED_HAND_COOKIE } from 'routes/game/components/zones/playerHand/fanLayout';

const CANONICAL_LABEL_IDS = new Set([
  'specialization',
  'fusion',
  'essence',
  'channel',
  'bond',
  'flow'
]);

export default function CardKeywordStrip({
  cardNumber
}: {
  cardNumber?: string;
}) {
  const { t } = useTranslation();
  const keywordLabels = useCardKeywords(cardNumber);
  const fitToContent = useCookieString(DISABLE_FANNED_HAND_COOKIE) !== 'true';
  const entries = keywordLabels?.flatMap((label) => {
    const id = normalizeKeyword(label);
    const entry = id ? getKeywordEntry(id) : undefined;
    return entry ? [{ entry, label }] : [];
  });
  if (!entries?.length) return null;
  const visible = entries.slice(0, 4);
  return (
    <div
      className={classNames(styles.keywordStrip, {
        [styles.keywordStripFit]: fitToContent
      })}
      aria-label={t('CARD_KEYWORD_STRIP.TITLE')}
    >
      {visible.map(({ entry, label }) => (
        <div className={styles.keywordLine} key={`${entry.id}-${label}`}>
          <span className={styles.keywordPill}>
            {entry.parameterized || CANONICAL_LABEL_IDS.has(entry.id)
              ? entry.name
              : label}
          </span>
          <span className={styles.keywordDescription}>{entry.short}</span>
        </div>
      ))}
      {entries.length > visible.length && (
        <div className={styles.keywordMore}>
          {t('CARD_KEYWORD_STRIP.MORE', {
            count: entries.length - visible.length
          })}
        </div>
      )}
    </div>
  );
}

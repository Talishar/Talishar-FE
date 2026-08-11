import { getKeywordEntry } from 'data/keywords';
import { useCardKeywords } from 'utils/cardKeywords';
import styles from './CardPortal.module.css';
import { useTranslation } from 'react-i18next';

export default function CardKeywordStrip({
  cardNumber
}: {
  cardNumber?: string;
}) {
  const { t } = useTranslation();
  const keywordIds = useCardKeywords(cardNumber);
  const entries = keywordIds?.map(getKeywordEntry).filter(Boolean);
  if (!entries?.length) return null;
  const visible = entries.slice(0, 4);
  return (
    <div
      className={styles.keywordStrip}
      aria-label={t('CARD_KEYWORD_STRIP.TITLE')}
    >
      {visible.map((entry) => (
        <div className={styles.keywordLine} key={entry!.id}>
          <span className={styles.keywordPill}>{entry!.name}</span>
          <span>{entry!.short}</span>
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

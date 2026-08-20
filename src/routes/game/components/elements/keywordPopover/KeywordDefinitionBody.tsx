import { CrRule, KeywordEntry } from 'data/keywords';
import { CR_TEXT } from 'data/keywords/generated/crText';
import styles from './KeywordPopover.module.css';
import { useTranslation } from 'react-i18next';

const CR_BASE = 'https://rules.fabtcg.com/en/cr/08-keywords/';

export default function KeywordDefinitionBody({
  entry
}: {
  entry: KeywordEntry;
}) {
  const { t } = useTranslation();
  const rule: CrRule | null = CR_TEXT[entry.id] ?? null;
  const rulesUrl =
    entry.crOverrideUrl ??
    (rule?.anchor ? `${CR_BASE}#${rule.anchor}` : undefined);
  return (
    <>
      <div className={styles.heading}>
        <strong>{entry.name}</strong>
        <span className={styles.badge}>{entry.category}</span>
      </div>
      <p className={styles.short}>{entry.short}</p>
      <br />
      {rulesUrl ? (
        <a
          className={styles.rulesLink}
          href={rulesUrl}
          target="_blank"
          rel="noreferrer"
        >
          {t('KEYWORD.VIEW_CR')}
        </a>
      ) : null}
    </>
  );
}

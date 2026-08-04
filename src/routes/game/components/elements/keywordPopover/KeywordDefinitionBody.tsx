import { useEffect, useState } from 'react';
import { CrRule, KeywordEntry } from 'data/keywords';
import styles from './KeywordPopover.module.css';
import { useTranslation } from 'react-i18next';

const CR_BASE = 'https://rules.fabtcg.com/en/cr/08-keywords/';

export default function KeywordDefinitionBody({
  entry
}: {
  entry: KeywordEntry;
}) {
  const { t } = useTranslation();
  const [rule, setRule] = useState<CrRule | null | undefined>();
  const [expanded, setExpanded] = useState(false);
  useEffect(() => {
    let active = true;
    import('data/keywords/generated/crText').then((module) => {
      if (active) setRule(module.CR_TEXT[entry.id] ?? null);
    });
    return () => {
      active = false;
    };
  }, [entry.id]);
  const showDetails = async () => {
    setExpanded(true);
    if (rule !== undefined) return;
    const module = await import('data/keywords/generated/crText');
    setRule(module.CR_TEXT[entry.id] ?? null);
  };
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
      ) : rule === undefined ? (
        <span className={styles.rulesLink}>{t('KEYWORD.LOADING_LINK')}</span>
      ) : null}
    </>
  );
}

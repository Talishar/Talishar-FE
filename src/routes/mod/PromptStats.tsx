import React, { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useGetPromptStatsQuery } from 'features/api/apiSlice';
import { PromptStat, PromptStatsRange } from 'interface/API/ModPageAPI';
import { CARD_SQUARES_PATH, getCollectionCardImagePath } from 'utils';
import { useLanguageSelector } from 'hooks/useLanguageSelector';
import styles from './PromptStats.module.css';

const RANGES: PromptStatsRange[] = [1, 7, 30, 90];
const CANDIDATE_MIN_COUNT = 20;
const CANDIDATE_TOP_SHARE = 0.95;
const CANDIDATE_OPTION_SHARE = 0.5;
const INLINE_ANSWERS = 3;

type SortKey =
  | 'count'
  | 'topShare'
  | 'identicalShare'
  | 'forcedShare'
  | 'avgMs';

interface PromptRow extends PromptStat {
  topShare: number;
  identicalShare: number;
  forcedShare: number;
  reasons: string[];
}

const percent = (value: number) => `${Math.round(value * 100)}%`;
const formatAnswer = (answer: string) => answer.replace(/_/g, ' ');
const formatSeconds = (ms: number) =>
  `${(ms / 1000).toFixed(ms < 10000 ? 1 : 0)}s`;

const toRow = (prompt: PromptStat): PromptRow => {
  const count = Math.max(prompt.count, 1);
  const topShare = (prompt.answers[0]?.count ?? 0) / count;
  const identicalShare = prompt.identical / count;
  const forcedShare = prompt.forced / count;
  const reasons: string[] = [];
  if (prompt.count >= CANDIDATE_MIN_COUNT) {
    if (
      topShare >= CANDIDATE_TOP_SHARE &&
      prompt.answers[0]?.answer !== 'CHOSE'
    )
      reasons.push('SAME_ANSWER');
    if (identicalShare >= CANDIDATE_OPTION_SHARE) reasons.push('IDENTICAL');
    if (forcedShare >= CANDIDATE_OPTION_SHARE) reasons.push('FORCED');
  }
  return { ...prompt, topShare, identicalShare, forcedShare, reasons };
};

const CardCell = ({ row }: { row: PromptRow }) => {
  const { t } = useTranslation();
  const { getLanguage } = useLanguageSelector();
  const [imageFailed, setImageFailed] = useState(false);
  const hasCard = row.context !== '-';
  return (
    <div className={styles.cardCell}>
      {hasCard && !imageFailed ? (
        <img
          className={styles.thumb}
          src={getCollectionCardImagePath({
            path: CARD_SQUARES_PATH,
            locale: getLanguage(),
            cardNumber: row.context
          })}
          alt=""
          loading="lazy"
          onError={() => setImageFailed(true)}
        />
      ) : (
        <span className={styles.thumbPlaceholder} aria-hidden="true" />
      )}
      <div className={styles.cardText}>
        <span className={styles.cardName}>
          {hasCard ? row.contextName : t('MOD_PAGE.PROMPTS_NO_CARD')}
        </span>
        {hasCard && <code className={styles.cardId}>{row.context}</code>}
      </div>
    </div>
  );
};

const AnswersCell = ({ row }: { row: PromptRow }) => {
  const count = Math.max(row.count, 1);
  const summary = row.answers
    .map((entry) => `${formatAnswer(entry.answer)}: ${entry.count}`)
    .join('\n');
  const hidden = row.answers.length - INLINE_ANSWERS;
  return (
    <div className={styles.answers} title={summary}>
      <div className={styles.answerBar} aria-hidden="true">
        {row.answers.map((entry, index) => (
          <span
            key={entry.answer}
            className={styles.answerSegment}
            style={{
              width: `${(entry.count / count) * 100}%`,
              opacity: Math.max(0.85 - index * 0.25, 0.2)
            }}
          />
        ))}
      </div>
      <div className={styles.answerList}>
        {row.answers.slice(0, INLINE_ANSWERS).map((entry) => (
          <span key={entry.answer} className={styles.answerItem}>
            {formatAnswer(entry.answer)}{' '}
            <span className={styles.muted}>{percent(entry.count / count)}</span>
          </span>
        ))}
        {hidden > 0 && <span className={styles.muted}>+{hidden}</span>}
      </div>
    </div>
  );
};

const PromptStats: React.FC = () => {
  const { t } = useTranslation();
  const [range, setRange] = useState<PromptStatsRange>(7);
  const [query, setQuery] = useState('');
  const [phase, setPhase] = useState('');
  const [candidatesOnly, setCandidatesOnly] = useState(false);
  const [sortKey, setSortKey] = useState<SortKey>('count');
  const [sortDescending, setSortDescending] = useState(true);

  const { data, isFetching, isError } = useGetPromptStatsQuery(range);

  const rows = useMemo(() => (data?.prompts ?? []).map(toRow), [data]);

  const phases = useMemo(
    () => Array.from(new Set(rows.map((row) => row.phase))).sort(),
    [rows]
  );

  const visibleRows = useMemo(() => {
    const needle = query.trim().toLowerCase();
    const filtered = rows.filter((row) => {
      if (phase && row.phase !== phase) return false;
      if (candidatesOnly && row.reasons.length === 0) return false;
      if (!needle) return true;
      return [
        row.contextName,
        row.context,
        row.phase,
        ...row.answers.map((entry) => formatAnswer(entry.answer))
      ].some((value) => value.toLowerCase().includes(needle));
    });
    const direction = sortDescending ? -1 : 1;
    return [...filtered].sort(
      (a, b) => (a[sortKey] - b[sortKey]) * direction || b.count - a.count
    );
  }, [rows, query, phase, candidatesOnly, sortKey, sortDescending]);

  const candidateCount = rows.filter((row) => row.reasons.length > 0).length;

  const handleSort = (key: SortKey) => {
    if (key === sortKey) setSortDescending((value) => !value);
    else {
      setSortKey(key);
      setSortDescending(true);
    }
  };

  const reasonLabels: Record<string, string> = {
    SAME_ANSWER: t('MOD_PAGE.PROMPTS_REASON_SAME_ANSWER'),
    IDENTICAL: t('MOD_PAGE.PROMPTS_REASON_IDENTICAL'),
    FORCED: t('MOD_PAGE.PROMPTS_REASON_FORCED')
  };

  const sortHeader = (id: SortKey, label: string, numeric = true) => (
    <th
      scope="col"
      className={numeric ? styles.numeric : undefined}
      aria-sort={
        sortKey === id ? (sortDescending ? 'descending' : 'ascending') : 'none'
      }
    >
      <button
        type="button"
        className={styles.sortButton}
        onClick={() => handleSort(id)}
      >
        {label}
        <span className={styles.sortIndicator} aria-hidden="true">
          {sortKey === id ? (sortDescending ? '▼' : '▲') : ''}
        </span>
      </button>
    </th>
  );

  return (
    <section className={styles.panel}>
      <div className={styles.header}>
        <div>
          <h2 className={styles.title}>{t('MOD_PAGE.PROMPTS_TITLE')}</h2>
          <p className={styles.description}>
            {t('MOD_PAGE.PROMPTS_DESCRIPTION')}
          </p>
        </div>
        <div
          className={styles.segmented}
          role="group"
          aria-label={t('MOD_PAGE.PROMPTS_RANGE')}
        >
          {RANGES.map((days) => (
            <button
              key={days}
              type="button"
              aria-pressed={range === days}
              className={
                range === days
                  ? `${styles.segment} ${styles.segmentActive}`
                  : styles.segment
              }
              onClick={() => setRange(days)}
            >
              {days === 1
                ? t('MOD_PAGE.PROMPTS_RANGE_TODAY')
                : t('MOD_PAGE.PROMPTS_RANGE_DAYS', { days })}
            </button>
          ))}
        </div>
      </div>

      <div className={styles.controls}>
        <input
          type="search"
          className={styles.search}
          value={query}
          placeholder={t('MOD_PAGE.PROMPTS_SEARCH_PLACEHOLDER')}
          aria-label={t('MOD_PAGE.PROMPTS_SEARCH_PLACEHOLDER')}
          onChange={(event) => setQuery(event.target.value)}
        />
        <select
          className={styles.phaseSelect}
          value={phase}
          aria-label={t('MOD_PAGE.PROMPTS_PHASE_FILTER')}
          onChange={(event) => setPhase(event.target.value)}
        >
          <option value="">{t('MOD_PAGE.PROMPTS_ALL_PHASES')}</option>
          {phases.map((value) => (
            <option key={value} value={value}>
              {value}
            </option>
          ))}
        </select>
        <label className={styles.toggle}>
          <input
            type="checkbox"
            checked={candidatesOnly}
            onChange={(event) => setCandidatesOnly(event.target.checked)}
          />
          {t('MOD_PAGE.PROMPTS_CANDIDATES_ONLY', { total: candidateCount })}
        </label>
      </div>

      {data && !isError && (
        <p className={styles.summary}>
          {t('MOD_PAGE.PROMPTS_SUMMARY', {
            answers: data.totalAnswers.toLocaleString(),
            prompts: rows.length.toLocaleString(),
            since: data.since
          })}
          {isFetching && (
            <span className={styles.muted}> {t('MOD_PAGE.LOADING')}</span>
          )}
        </p>
      )}

      {isError || data?.error ? (
        <p className={styles.empty}>{t('MOD_PAGE.PROMPTS_LOAD_FAILED')}</p>
      ) : !data ? (
        <p className={styles.empty}>{t('MOD_PAGE.LOADING')}</p>
      ) : visibleRows.length === 0 ? (
        <p className={styles.empty}>
          {rows.length === 0
            ? t('MOD_PAGE.PROMPTS_EMPTY')
            : t('MOD_PAGE.PROMPTS_NO_MATCH')}
        </p>
      ) : (
        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th scope="col">{t('MOD_PAGE.PROMPTS_COL_CARD')}</th>
                <th scope="col">{t('MOD_PAGE.PROMPTS_COL_PROMPT')}</th>
                {sortHeader('count', t('MOD_PAGE.PROMPTS_COL_ANSWERED'))}
                {sortHeader(
                  'topShare',
                  t('MOD_PAGE.PROMPTS_COL_ANSWERS'),
                  false
                )}
                {sortHeader(
                  'identicalShare',
                  t('MOD_PAGE.PROMPTS_COL_IDENTICAL')
                )}
                {sortHeader('forcedShare', t('MOD_PAGE.PROMPTS_COL_FORCED'))}
                {sortHeader('avgMs', t('MOD_PAGE.PROMPTS_COL_TIME'))}
              </tr>
            </thead>
            <tbody>
              {visibleRows.map((row) => (
                <tr key={`${row.phase}|${row.context}`}>
                  <td>
                    <CardCell row={row} />
                  </td>
                  <td>
                    <code className={styles.phase}>{row.phase}</code>
                    {row.reasons.length > 0 && (
                      <div className={styles.reasons}>
                        {row.reasons.map((reason) => (
                          <span key={reason} className={styles.reason}>
                            {reasonLabels[reason]}
                          </span>
                        ))}
                      </div>
                    )}
                  </td>
                  <td className={styles.numeric}>
                    {row.count.toLocaleString()}
                  </td>
                  <td>
                    <AnswersCell row={row} />
                  </td>
                  <td className={styles.numeric}>
                    {row.identical > 0 ? percent(row.identicalShare) : '-'}
                  </td>
                  <td className={styles.numeric}>
                    {row.forced > 0 ? percent(row.forcedShare) : '-'}
                  </td>
                  <td className={styles.numeric}>{formatSeconds(row.avgMs)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
};

export default PromptStats;

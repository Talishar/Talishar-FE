import React, { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { PROCESS_INPUT } from 'appConstants';
import { useGetGameHealthReportQuery } from 'features/api/apiSlice';
import {
  GameHealthRange,
  MisclickContext,
  MisclickStat,
  SuspectCardStat
} from 'interface/API/ModPageAPI';
import { CARD_SQUARES_PATH, getCollectionCardImagePath } from 'utils';
import { useLanguageSelector } from 'hooks/useLanguageSelector';
import { SortColumn, SortHeader, useTableSort } from './SortableTable';
import tableStyles from './ModTable.module.css';
import blockStyles from './BlockReports.module.css';
import styles from './GameHealth.module.css';
import { isSessionExpired } from './sessionExpired';

const RANGES: GameHealthRange[] = [1, 7, 30, 90];

type FixKind =
  | 'life'
  | 'ap'
  | 'resources'
  | 'draws'
  | 'cards'
  | 'arsenal'
  | 'bugs';

const FIX_COLUMNS: { kind: FixKind; labelKey: string }[] = [
  { kind: 'life', labelKey: 'MOD_PAGE.HEALTH_COL_LIFE' },
  { kind: 'ap', labelKey: 'MOD_PAGE.HEALTH_COL_AP' },
  { kind: 'resources', labelKey: 'MOD_PAGE.HEALTH_COL_RESOURCES' },
  { kind: 'draws', labelKey: 'MOD_PAGE.HEALTH_COL_DRAWS' },
  { kind: 'cards', labelKey: 'MOD_PAGE.HEALTH_COL_CARDS' },
  { kind: 'arsenal', labelKey: 'MOD_PAGE.HEALTH_COL_ARSENAL' },
  { kind: 'bugs', labelKey: 'MOD_PAGE.HEALTH_COL_BUGS' }
];

const DEFAULT_MIN_INPUTS = 20;
const DEFAULT_MIN_FIX_GAMES = 5;

const PROMPT_MODE_NAMES: [number, string][] = [
  [8, 'Put on top'],
  [11, 'Choose from deck'],
  [12, 'Put on top'],
  [13, 'Put on bottom'],
  [16, 'Choose'],
  [106, 'Use floating resources'],
  [107, 'Submit opt'],
  [109, 'Submit trigger order'],
  [110, 'Submit deck order'],
  [113, 'Prevent runechants'],
  [115, 'No, stop asking']
];

const MODE_NAMES = new Map<number, string>([
  ...Object.entries(PROCESS_INPUT).map(([name, mode]): [number, string] => [
    mode,
    name.charAt(0) + name.slice(1).toLowerCase().replace(/_/g, ' ')
  ]),
  ...PROMPT_MODE_NAMES
]);

type MisclickSortKey =
  | 'inputs'
  | 'undos'
  | 'undoRate'
  | 'fastUndos'
  | 'fastRate'
  | 'prevFastRate'
  | 'avgUndoMs';
type CardSortKey = 'games' | 'fixGames' | 'fixRate' | 'prevFixRate' | FixKind;

const share = (part: number, whole: number) => (whole > 0 ? part / whole : 0);
const percent = (value: number) =>
  value > 0 && value < 0.005 ? '<1%' : `${Math.round(value * 100)}%`;
const seconds = (ms: number) => `${(ms / 1000).toFixed(1)}s`;
const countOrDash = (value: number) =>
  value > 0 ? value.toLocaleString() : '-';

const MISCLICK_COLUMNS: Record<MisclickSortKey, SortColumn<MisclickStat>> = {
  inputs: { value: (row) => row.inputs },
  undos: { value: (row) => row.undos },
  undoRate: { value: (row) => share(row.undos, row.inputs) },
  fastUndos: { value: (row) => row.fastUndos },
  fastRate: { value: (row) => share(row.fastUndos, row.inputs) },
  prevFastRate: {
    value: (row) =>
      row.prevInputs > 0 ? share(row.prevFastUndos, row.prevInputs) : null
  },
  avgUndoMs: { value: (row) => row.avgUndoMs, ascendingFirst: true }
};

const CARD_COLUMNS: Record<CardSortKey, SortColumn<SuspectCardStat>> = {
  games: { value: (row) => row.games },
  fixGames: { value: (row) => row.fixGames },
  fixRate: { value: (row) => share(row.fixGames, row.games) },
  prevFixRate: {
    value: (row) =>
      row.prevGames > 0 ? share(row.prevFixGames, row.prevGames) : null
  },
  life: { value: (row) => row.life },
  ap: { value: (row) => row.ap },
  resources: { value: (row) => row.resources },
  draws: { value: (row) => row.draws },
  cards: { value: (row) => row.cards },
  arsenal: { value: (row) => row.arsenal },
  bugs: { value: (row) => row.bugs }
};

const NO_MISCLICKS: MisclickStat[] = [];
const NO_CARDS: SuspectCardStat[] = [];

const CardCell = ({
  cardID,
  cardName
}: {
  cardID: string;
  cardName: string;
}) => {
  const { getLanguage } = useLanguageSelector();
  const [imageFailed, setImageFailed] = useState(false);
  return (
    <div className={tableStyles.cardCell}>
      {imageFailed ? (
        <span className={tableStyles.thumbPlaceholder} aria-hidden="true" />
      ) : (
        <img
          className={tableStyles.thumb}
          src={getCollectionCardImagePath({
            path: CARD_SQUARES_PATH,
            locale: getLanguage(),
            cardNumber: cardID
          })}
          alt=""
          loading="lazy"
          onError={() => setImageFailed(true)}
        />
      )}
      <div className={tableStyles.cardText}>
        <span className={tableStyles.cardName}>{cardName}</span>
        <code className={styles.cardId}>{cardID}</code>
      </div>
    </div>
  );
};

const GameHealth: React.FC = () => {
  const { t } = useTranslation();
  const [range, setRange] = useState<GameHealthRange>(7);
  const [query, setQuery] = useState('');
  const [showSmall, setShowSmall] = useState(false);
  const { data, isFetching, isError, error } =
    useGetGameHealthReportQuery(range);
  const minInputs = data?.minInputs ?? DEFAULT_MIN_INPUTS;
  const minFixGames = data?.minFixGames ?? DEFAULT_MIN_FIX_GAMES;

  const modeLabel = (mode: number) =>
    MODE_NAMES.get(mode) ?? t('MOD_PAGE.HEALTH_MODE_UNKNOWN', { mode });
  const contextLabel = (context: MisclickContext) =>
    context.context === 'ATTACKTARGET'
      ? t('MOD_PAGE.HEALTH_ATTACK_TARGET')
      : context.contextName;

  const needle = query.trim().toLowerCase();

  const misclickMatches = useMemo(() => {
    const rows = data?.misclicks ?? NO_MISCLICKS;
    if (!needle) return rows;
    return rows.filter((row) =>
      [
        row.phase,
        MODE_NAMES.get(row.mode) ?? String(row.mode),
        ...row.contexts.flatMap((context) => [
          context.context,
          context.contextName
        ])
      ].some((value) => value.toLowerCase().includes(needle))
    );
  }, [data, needle]);

  const cardMatches = useMemo(() => {
    const rows = data?.cards ?? NO_CARDS;
    if (!needle) return rows;
    return rows.filter((row) =>
      [row.cardID, row.cardName].some((value) =>
        value.toLowerCase().includes(needle)
      )
    );
  }, [data, needle]);

  const rankedMisclicks = useMemo(
    () => misclickMatches.filter((row) => row.inputs >= minInputs),
    [misclickMatches, minInputs]
  );
  const rankedCards = useMemo(
    () => cardMatches.filter((row) => row.fixGames >= minFixGames),
    [cardMatches, minFixGames]
  );
  const misclickRows = showSmall ? misclickMatches : rankedMisclicks;
  const cardRows = showSmall ? cardMatches : rankedCards;
  const smallRows =
    misclickMatches.length -
    rankedMisclicks.length +
    cardMatches.length -
    rankedCards.length;

  const misclicks = useTableSort(misclickRows, MISCLICK_COLUMNS);
  const cards = useTableSort(cardRows, CARD_COLUMNS);

  const failed = isError || !!data?.error;
  const status = failed ? (
    <p className={tableStyles.empty}>
      {isSessionExpired(error)
        ? t('MOD_PAGE.SESSION_EXPIRED')
        : t('MOD_PAGE.HEALTH_LOAD_FAILED')}
    </p>
  ) : !data ? (
    <p className={tableStyles.empty}>{t('MOD_PAGE.LOADING')}</p>
  ) : null;

  return (
    <div className={blockStyles.tabStack}>
      <div className={styles.toolbar}>
        <div className={tableStyles.controls}>
          <input
            type="search"
            className={tableStyles.search}
            value={query}
            placeholder={t('MOD_PAGE.HEALTH_SEARCH_PLACEHOLDER')}
            aria-label={t('MOD_PAGE.HEALTH_SEARCH_PLACEHOLDER')}
            onChange={(event) => setQuery(event.target.value)}
          />
          <label className={tableStyles.toggle}>
            <input
              type="checkbox"
              checked={showSmall}
              onChange={(event) => setShowSmall(event.target.checked)}
            />
            {t('MOD_PAGE.HEALTH_SHOW_SMALL', { count: smallRows })}
          </label>
          <div
            className={tableStyles.segmented}
            role="group"
            aria-label={t('MOD_PAGE.HEALTH_RANGE')}
          >
            {RANGES.map((days) => (
              <button
                key={days}
                type="button"
                aria-pressed={range === days}
                className={
                  range === days
                    ? `${tableStyles.segment} ${tableStyles.segmentActive}`
                    : tableStyles.segment
                }
                onClick={() => setRange(days)}
              >
                {days === 1
                  ? t('MOD_PAGE.HEALTH_RANGE_TODAY')
                  : t('MOD_PAGE.HEALTH_RANGE_DAYS', { days })}
              </button>
            ))}
          </div>
        </div>
        {data && !failed && (
          <p className={tableStyles.summary}>
            {t('MOD_PAGE.HEALTH_SUMMARY', {
              games: data.games.toLocaleString(),
              inputs: data.inputs.toLocaleString(),
              undos: data.undos.toLocaleString(),
              fast: data.fastUndos.toLocaleString(),
              since: data.since
            })}
            {data.previousSince && (
              <>
                {' '}
                {t('MOD_PAGE.HEALTH_SUMMARY_PREVIOUS', {
                  since: data.previousSince
                })}
              </>
            )}
            {isFetching && (
              <span className={tableStyles.muted}>
                {' '}
                {t('MOD_PAGE.LOADING')}
              </span>
            )}
          </p>
        )}
      </div>

      <section className={tableStyles.panel}>
        <div className={tableStyles.header}>
          <div>
            <h2 className={tableStyles.title}>
              {t('MOD_PAGE.HEALTH_MISCLICKS_TITLE')}
            </h2>
            <p className={tableStyles.description}>
              {t('MOD_PAGE.HEALTH_MISCLICKS_DESCRIPTION')}
            </p>
          </div>
        </div>

        {status ??
          (misclicks.sortedRows.length === 0 ? (
            <p className={tableStyles.empty}>
              {!data?.misclicks.length
                ? t('MOD_PAGE.HEALTH_MISCLICKS_EMPTY')
                : misclickMatches.length
                ? t('MOD_PAGE.HEALTH_ALL_SMALL')
                : t('MOD_PAGE.HEALTH_NO_MATCH')}
            </p>
          ) : (
            <div className={tableStyles.tableWrap}>
              <table className={tableStyles.table}>
                <thead>
                  <tr>
                    <th scope="col">{t('MOD_PAGE.HEALTH_COL_PROMPT')}</th>
                    <th scope="col">{t('MOD_PAGE.HEALTH_COL_UNDONE_ON')}</th>
                    <SortHeader
                      id="inputs"
                      sort={misclicks.sort}
                      onSort={misclicks.toggleSort}
                      numeric
                    >
                      {t('MOD_PAGE.HEALTH_COL_INPUTS')}
                    </SortHeader>
                    <SortHeader
                      id="undos"
                      sort={misclicks.sort}
                      onSort={misclicks.toggleSort}
                      numeric
                    >
                      {t('MOD_PAGE.HEALTH_COL_UNDOS')}
                    </SortHeader>
                    <SortHeader
                      id="undoRate"
                      sort={misclicks.sort}
                      onSort={misclicks.toggleSort}
                      numeric
                    >
                      {t('MOD_PAGE.HEALTH_COL_UNDO_RATE')}
                    </SortHeader>
                    <SortHeader
                      id="fastUndos"
                      sort={misclicks.sort}
                      onSort={misclicks.toggleSort}
                      numeric
                    >
                      {t('MOD_PAGE.HEALTH_COL_FAST_UNDOS')}
                    </SortHeader>
                    <SortHeader
                      id="fastRate"
                      sort={misclicks.sort}
                      onSort={misclicks.toggleSort}
                      numeric
                    >
                      {t('MOD_PAGE.HEALTH_COL_FAST_RATE')}
                    </SortHeader>
                    <SortHeader
                      id="prevFastRate"
                      sort={misclicks.sort}
                      onSort={misclicks.toggleSort}
                      numeric
                    >
                      {t('MOD_PAGE.HEALTH_COL_PREV_FAST_RATE')}
                    </SortHeader>
                    <SortHeader
                      id="avgUndoMs"
                      sort={misclicks.sort}
                      onSort={misclicks.toggleSort}
                      numeric
                    >
                      {t('MOD_PAGE.HEALTH_COL_UNDO_TIME')}
                    </SortHeader>
                  </tr>
                </thead>
                <tbody>
                  {misclicks.sortedRows.map((row) => (
                    <tr key={`${row.phase}|${row.mode}`}>
                      <td>
                        <code className={styles.phase}>{row.phase}</code>
                        <span className={styles.modeLabel}>
                          {modeLabel(row.mode)}
                        </span>
                      </td>
                      <td>
                        {row.contexts.length === 0 ? (
                          <span className={tableStyles.muted}>-</span>
                        ) : (
                          <div className={styles.contextList}>
                            {row.contexts.map((context) => (
                              <span
                                key={context.context}
                                title={context.context}
                              >
                                {contextLabel(context)}{' '}
                                <span className={tableStyles.muted}>
                                  {t('MOD_PAGE.HEALTH_CONTEXT_COUNT', {
                                    undos: context.undos,
                                    inputs: context.inputs.toLocaleString(),
                                    fast: context.fastUndos
                                  })}
                                  {context.prevInputs > 0 &&
                                    t('MOD_PAGE.HEALTH_CONTEXT_PREVIOUS', {
                                      fast: context.prevFastUndos,
                                      inputs:
                                        context.prevInputs.toLocaleString()
                                    })}
                                </span>
                              </span>
                            ))}
                          </div>
                        )}
                      </td>
                      <td className={tableStyles.numeric}>
                        {row.inputs.toLocaleString()}
                      </td>
                      <td className={tableStyles.numeric}>
                        {row.undos.toLocaleString()}
                      </td>
                      <td className={tableStyles.numeric}>
                        {percent(share(row.undos, row.inputs))}
                      </td>
                      <td className={tableStyles.numeric}>
                        {countOrDash(row.fastUndos)}
                      </td>
                      <td className={tableStyles.numeric}>
                        {percent(share(row.fastUndos, row.inputs))}
                      </td>
                      <td className={tableStyles.numeric}>
                        {row.prevInputs > 0
                          ? percent(share(row.prevFastUndos, row.prevInputs))
                          : '-'}
                      </td>
                      <td className={tableStyles.numeric}>
                        {row.undos > 0 ? seconds(row.avgUndoMs) : '-'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ))}
      </section>

      <section className={tableStyles.panel}>
        <div className={tableStyles.header}>
          <div>
            <h2 className={tableStyles.title}>
              {t('MOD_PAGE.HEALTH_CARDS_TITLE')}
            </h2>
            <p className={tableStyles.description}>
              {t('MOD_PAGE.HEALTH_CARDS_DESCRIPTION')}
            </p>
          </div>
        </div>

        {status ??
          (cards.sortedRows.length === 0 ? (
            <p className={tableStyles.empty}>
              {!data?.cards.length
                ? t('MOD_PAGE.HEALTH_CARDS_EMPTY')
                : cardMatches.length
                ? t('MOD_PAGE.HEALTH_ALL_SMALL')
                : t('MOD_PAGE.HEALTH_NO_MATCH')}
            </p>
          ) : (
            <div className={tableStyles.tableWrap}>
              <table className={tableStyles.table}>
                <thead>
                  <tr>
                    <th scope="col">{t('MOD_PAGE.HEALTH_COL_CARD')}</th>
                    <SortHeader
                      id="games"
                      sort={cards.sort}
                      onSort={cards.toggleSort}
                      numeric
                    >
                      {t('MOD_PAGE.HEALTH_COL_GAMES')}
                    </SortHeader>
                    <SortHeader
                      id="fixGames"
                      sort={cards.sort}
                      onSort={cards.toggleSort}
                      numeric
                    >
                      {t('MOD_PAGE.HEALTH_COL_FIX_GAMES')}
                    </SortHeader>
                    <SortHeader
                      id="fixRate"
                      sort={cards.sort}
                      onSort={cards.toggleSort}
                      numeric
                    >
                      {t('MOD_PAGE.HEALTH_COL_FIX_RATE')}
                    </SortHeader>
                    <SortHeader
                      id="prevFixRate"
                      sort={cards.sort}
                      onSort={cards.toggleSort}
                      numeric
                    >
                      {t('MOD_PAGE.HEALTH_COL_PREV_FIX_RATE')}
                    </SortHeader>
                    {FIX_COLUMNS.map(({ kind, labelKey }) => (
                      <SortHeader
                        key={kind}
                        id={kind}
                        sort={cards.sort}
                        onSort={cards.toggleSort}
                        numeric
                      >
                        {t(labelKey)}
                      </SortHeader>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {cards.sortedRows.map((row) => (
                    <tr key={row.cardID}>
                      <td>
                        <CardCell cardID={row.cardID} cardName={row.cardName} />
                      </td>
                      <td className={tableStyles.numeric}>
                        {row.games.toLocaleString()}
                      </td>
                      <td className={tableStyles.numeric}>
                        {row.fixGames.toLocaleString()}
                      </td>
                      <td className={tableStyles.numeric}>
                        {percent(share(row.fixGames, row.games))}
                      </td>
                      <td className={tableStyles.numeric}>
                        {row.prevGames > 0
                          ? percent(share(row.prevFixGames, row.prevGames))
                          : '-'}
                      </td>
                      {FIX_COLUMNS.map(({ kind }) => (
                        <td key={kind} className={tableStyles.numeric}>
                          {countOrDash(row[kind])}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ))}
      </section>
    </div>
  );
};

export default GameHealth;

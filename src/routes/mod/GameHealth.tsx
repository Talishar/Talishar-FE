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

const PROMPT_MODE_NAMES: [number, string][] = [
  [8, 'Put on top'],
  [11, 'Choose from deck'],
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
  | 'avgUndoMs';
type CardSortKey = 'games' | 'fixGames' | 'fixRate' | FixKind;

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
  avgUndoMs: { value: (row) => row.avgUndoMs, ascendingFirst: true }
};

const CARD_COLUMNS: Record<CardSortKey, SortColumn<SuspectCardStat>> = {
  games: { value: (row) => row.games },
  fixGames: { value: (row) => row.fixGames },
  fixRate: { value: (row) => share(row.fixGames, row.games) },
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
  const { data, isFetching, isError } = useGetGameHealthReportQuery(range);

  const modeLabel = (mode: number) =>
    MODE_NAMES.get(mode) ?? t('MOD_PAGE.HEALTH_MODE_UNKNOWN', { mode });
  const contextLabel = (context: MisclickContext) =>
    context.context === 'ATTACKTARGET'
      ? t('MOD_PAGE.HEALTH_ATTACK_TARGET')
      : context.contextName;

  const needle = query.trim().toLowerCase();

  const misclickRows = useMemo(() => {
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

  const cardRows = useMemo(() => {
    const rows = data?.cards ?? NO_CARDS;
    if (!needle) return rows;
    return rows.filter((row) =>
      [row.cardID, row.cardName].some((value) =>
        value.toLowerCase().includes(needle)
      )
    );
  }, [data, needle]);

  const misclicks = useTableSort(misclickRows, MISCLICK_COLUMNS);
  const cards = useTableSort(cardRows, CARD_COLUMNS);

  const failed = isError || !!data?.error;
  const status = failed ? (
    <p className={tableStyles.empty}>{t('MOD_PAGE.HEALTH_LOAD_FAILED')}</p>
  ) : !data ? (
    <p className={tableStyles.empty}>{t('MOD_PAGE.LOADING')}</p>
  ) : null;

  return (
    <div className={blockStyles.tabStack}>
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

        <div className={tableStyles.controls}>
          <input
            type="search"
            className={tableStyles.search}
            value={query}
            placeholder={t('MOD_PAGE.HEALTH_SEARCH_PLACEHOLDER')}
            aria-label={t('MOD_PAGE.HEALTH_SEARCH_PLACEHOLDER')}
            onChange={(event) => setQuery(event.target.value)}
          />
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
            {isFetching && (
              <span className={tableStyles.muted}>
                {' '}
                {t('MOD_PAGE.LOADING')}
              </span>
            )}
          </p>
        )}

        {status ??
          (misclicks.sortedRows.length === 0 ? (
            <p className={tableStyles.empty}>
              {data?.misclicks.length
                ? t('MOD_PAGE.HEALTH_NO_MATCH')
                : t('MOD_PAGE.HEALTH_MISCLICKS_EMPTY')}
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
                                className={styles.contextItem}
                                title={context.context}
                              >
                                {contextLabel(context)}{' '}
                                <span className={tableStyles.muted}>
                                  {t('MOD_PAGE.HEALTH_CONTEXT_COUNT', {
                                    undos: context.undos,
                                    inputs: context.inputs.toLocaleString(),
                                    fast: context.fastUndos
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
                        {seconds(row.avgUndoMs)}
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
              {data?.cards.length
                ? t('MOD_PAGE.HEALTH_NO_MATCH')
                : t('MOD_PAGE.HEALTH_CARDS_EMPTY')}
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

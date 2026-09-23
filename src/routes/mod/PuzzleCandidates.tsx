import React, { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  useCreatePuzzleGameMutation,
  useGetPuzzleCandidatesQuery
} from 'features/api/apiSlice';
import {
  CreatePuzzleGameResponse,
  PuzzleCandidate
} from 'interface/API/ModPageAPI';
import { CARD_SQUARES_PATH, getCollectionCardImagePath } from 'utils';
import { getReadableFormatName } from 'utils/formatUtils';
import { useLanguageSelector } from 'hooks/useLanguageSelector';
import tableStyles from './PromptStats.module.css';
import styles from './PuzzleCandidates.module.css';

type SortKey = 'id' | 'opponentLife' | 'handCount' | 'turn';

interface ReadyPuzzle extends CreatePuzzleGameResponse {
  candidateId: number;
}

const playUrl = (gameName: number, playerID: number, authKey: string) =>
  `/game/play/${gameName}?playerID=${playerID}&authKey=${authKey}`;

const HeroCell = ({
  cardNumber,
  name
}: {
  cardNumber: string;
  name: string;
}) => {
  const { getLanguage } = useLanguageSelector();
  const [imageFailed, setImageFailed] = useState(false);
  return (
    <div className={tableStyles.cardCell}>
      {!imageFailed ? (
        <img
          className={tableStyles.thumb}
          src={getCollectionCardImagePath({
            path: CARD_SQUARES_PATH,
            locale: getLanguage(),
            cardNumber
          })}
          alt=""
          loading="lazy"
          onError={() => setImageFailed(true)}
        />
      ) : (
        <span className={tableStyles.thumbPlaceholder} aria-hidden="true" />
      )}
      <span className={tableStyles.cardName}>{name || cardNumber}</span>
    </div>
  );
};

const PuzzleCandidates: React.FC = () => {
  const { t } = useTranslation();
  const [query, setQuery] = useState('');
  const [format, setFormat] = useState('');
  const [emptyOpponentHand, setEmptyOpponentHand] = useState(true);
  const [removeDecks, setRemoveDecks] = useState(true);
  const [sortKey, setSortKey] = useState<SortKey>('id');
  const [sortDescending, setSortDescending] = useState(true);
  const [creatingId, setCreatingId] = useState<number | null>(null);
  const [ready, setReady] = useState<ReadyPuzzle | null>(null);

  const { data, isFetching, isError } = useGetPuzzleCandidatesQuery();
  const [createPuzzleGame] = useCreatePuzzleGameMutation();

  const candidates = useMemo(() => data?.candidates ?? [], [data]);

  const formats = useMemo(
    () => Array.from(new Set(candidates.map((row) => row.format))).sort(),
    [candidates]
  );

  const visibleRows = useMemo(() => {
    const needle = query.trim().toLowerCase();
    const filtered = candidates.filter((row) => {
      if (format && row.format !== format) return false;
      if (!needle) return true;
      return [
        row.heroName,
        row.hero,
        row.opponentHeroName,
        row.opponentHero
      ].some((value) => value.toLowerCase().includes(needle));
    });
    const direction = sortDescending ? -1 : 1;
    return [...filtered].sort(
      (a, b) => (a[sortKey] - b[sortKey]) * direction || b.id - a.id
    );
  }, [candidates, query, format, sortKey, sortDescending]);

  const handleSort = (key: SortKey) => {
    if (key === sortKey) setSortDescending((value) => !value);
    else {
      setSortKey(key);
      setSortDescending(true);
    }
  };

  const handlePlay = async (candidate: PuzzleCandidate) => {
    setCreatingId(candidate.id);
    try {
      const result = await createPuzzleGame({
        candidateId: candidate.id,
        emptyOpponentHand,
        removeDecks
      }).unwrap();
      setReady({ ...result, candidateId: candidate.id });
    } catch {
      // Error will be shown via toast from RTK Query error handler
    } finally {
      setCreatingId(null);
    }
  };

  const formatLabel = (code: string) =>
    code === '' ? '-' : getReadableFormatName(code);

  const sortHeader = (id: SortKey, label: string) => (
    <th
      scope="col"
      className={tableStyles.numeric}
      aria-sort={
        sortKey === id ? (sortDescending ? 'descending' : 'ascending') : 'none'
      }
    >
      <button
        type="button"
        className={tableStyles.sortButton}
        onClick={() => handleSort(id)}
      >
        {label}
        <span className={tableStyles.sortIndicator} aria-hidden="true">
          {sortKey === id ? (sortDescending ? '▼' : '▲') : ''}
        </span>
      </button>
    </th>
  );

  return (
    <section className={tableStyles.panel}>
      <div className={tableStyles.header}>
        <div>
          <h2 className={tableStyles.title}>{t('MOD_PAGE.PUZZLES_TITLE')}</h2>
          <p className={tableStyles.description}>
            {t('MOD_PAGE.PUZZLES_DESCRIPTION')}
          </p>
        </div>
      </div>

      <div className={tableStyles.controls}>
        <input
          type="search"
          className={tableStyles.search}
          value={query}
          placeholder={t('MOD_PAGE.PUZZLES_SEARCH_PLACEHOLDER')}
          aria-label={t('MOD_PAGE.PUZZLES_SEARCH_PLACEHOLDER')}
          onChange={(event) => setQuery(event.target.value)}
        />
        <select
          className={tableStyles.phaseSelect}
          value={format}
          aria-label={t('MOD_PAGE.PUZZLES_FORMAT_FILTER')}
          onChange={(event) => setFormat(event.target.value)}
        >
          <option value="">{t('MOD_PAGE.PUZZLES_ALL_FORMATS')}</option>
          {formats.map((value) => (
            <option key={value} value={value}>
              {formatLabel(value)}
            </option>
          ))}
        </select>
        <label className={tableStyles.toggle}>
          <input
            type="checkbox"
            checked={emptyOpponentHand}
            onChange={(event) => setEmptyOpponentHand(event.target.checked)}
          />
          {t('MOD_PAGE.PUZZLES_EMPTY_OPPONENT_HAND')}
        </label>
        <label className={tableStyles.toggle}>
          <input
            type="checkbox"
            checked={removeDecks}
            onChange={(event) => setRemoveDecks(event.target.checked)}
          />
          {t('MOD_PAGE.PUZZLES_REMOVE_DECKS')}
        </label>
      </div>

      {ready && (
        <div className={styles.ready} role="status">
          <span>
            {t('MOD_PAGE.PUZZLES_READY', {
              id: ready.candidateId,
              game: ready.gameName
            })}
          </span>
          <div className={styles.readyLinks}>
            <a
              className={`${styles.button} ${styles.primary}`}
              href={playUrl(ready.gameName, ready.playerID, ready.authKey)}
              target="_blank"
              rel="noopener noreferrer"
            >
              {t('MOD_PAGE.PUZZLES_OPEN_PUZZLE')}
            </a>
            <a
              className={styles.button}
              href={playUrl(
                ready.gameName,
                ready.opponentPlayerID,
                ready.opponentAuthKey
              )}
              target="_blank"
              rel="noopener noreferrer"
            >
              {t('MOD_PAGE.PUZZLES_OPEN_OPPONENT')}
            </a>
          </div>
        </div>
      )}

      {data && !isError && (
        <p className={tableStyles.summary}>
          {t('MOD_PAGE.PUZZLES_SUMMARY', {
            total: data.total.toLocaleString(),
            shown: candidates.length.toLocaleString()
          })}
          {isFetching && (
            <span className={tableStyles.muted}> {t('MOD_PAGE.LOADING')}</span>
          )}
        </p>
      )}

      {isError || data?.error ? (
        <p className={tableStyles.empty}>{t('MOD_PAGE.PUZZLES_LOAD_FAILED')}</p>
      ) : !data ? (
        <p className={tableStyles.empty}>{t('MOD_PAGE.LOADING')}</p>
      ) : visibleRows.length === 0 ? (
        <p className={tableStyles.empty}>
          {candidates.length === 0
            ? t('MOD_PAGE.PUZZLES_EMPTY')
            : t('MOD_PAGE.PUZZLES_NO_MATCH')}
        </p>
      ) : (
        <div className={tableStyles.tableWrap}>
          <table className={tableStyles.table}>
            <thead>
              <tr>
                {sortHeader('id', '#')}
                <th scope="col">{t('MOD_PAGE.PUZZLES_COL_HERO')}</th>
                <th scope="col">{t('MOD_PAGE.PUZZLES_COL_OPPONENT')}</th>
                {sortHeader(
                  'opponentLife',
                  t('MOD_PAGE.PUZZLES_COL_OPPONENT_LIFE')
                )}
                {sortHeader('handCount', t('MOD_PAGE.PUZZLES_COL_HAND'))}
                {sortHeader('turn', t('MOD_PAGE.PUZZLES_COL_TURN'))}
                <th scope="col">{t('MOD_PAGE.PUZZLES_COL_FORMAT')}</th>
                <th scope="col">{t('MOD_PAGE.PUZZLES_COL_COLLECTED')}</th>
                <th scope="col">
                  <span className={styles.visuallyHidden}>
                    {t('MOD_PAGE.PUZZLES_PLAY')}
                  </span>
                </th>
              </tr>
            </thead>
            <tbody>
              {visibleRows.map((row) => (
                <tr key={row.id}>
                  <td className={tableStyles.numeric}>{row.id}</td>
                  <td>
                    <HeroCell cardNumber={row.hero} name={row.heroName} />
                  </td>
                  <td>
                    <HeroCell
                      cardNumber={row.opponentHero}
                      name={row.opponentHeroName}
                    />
                  </td>
                  <td className={tableStyles.numeric}>{row.opponentLife}</td>
                  <td className={tableStyles.numeric}>
                    {row.handCount}
                    <span className={tableStyles.muted}>
                      {' '}
                      / {row.opponentHandCount}
                    </span>
                  </td>
                  <td className={tableStyles.numeric}>{row.turn}</td>
                  <td>{formatLabel(row.format)}</td>
                  <td className={tableStyles.muted}>
                    {row.createdAt.slice(5, 16)}
                  </td>
                  <td>
                    <button
                      type="button"
                      className={styles.button}
                      disabled={creatingId !== null}
                      onClick={() => handlePlay(row)}
                    >
                      {creatingId === row.id
                        ? t('MOD_PAGE.PUZZLES_CREATING')
                        : t('MOD_PAGE.PUZZLES_PLAY')}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
};

export default PuzzleCandidates;

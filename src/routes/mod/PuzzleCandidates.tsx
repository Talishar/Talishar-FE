import React, { Fragment, useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  useCreatePuzzleGameMutation,
  useGetPuzzleCandidatesQuery,
  useVerifyPuzzleCandidatesMutation
} from 'features/api/apiSlice';
import {
  CreatePuzzleGameResponse,
  PuzzleCandidate,
  PuzzleCandidatesResponse,
  PuzzleCard,
  PuzzleDifficulty
} from 'interface/API/ModPageAPI';
import { CARD_SQUARES_PATH, getCollectionCardImagePath } from 'utils';
import { getReadableFormatName } from 'utils/formatUtils';
import { useLanguageSelector } from 'hooks/useLanguageSelector';
import tableStyles from './PromptStats.module.css';
import styles from './PuzzleCandidates.module.css';

type SortKey = 'score' | 'id' | 'opponentLife';
type ProofFilter = 'proven' | 'all';
type VerifyState = 'idle' | 'running' | 'failed';

interface ReadyPuzzle extends CreatePuzzleGameResponse {
  candidateId: number;
}

const DIFFICULTIES: PuzzleDifficulty[] = ['easy', 'medium', 'hard'];
const GOOD_FLAGS = ['EXACT_LETHAL', 'BIG_TURN', 'ALL_CARDS', 'HIGH_PRESSURE'];
const BAD_FLAGS = [
  'LOW_PRESSURE',
  'FEW_OPTIONS',
  'ONE_CARD',
  'RAW_POWER',
  'SPARE_CARDS',
  'UNPROVEN'
];
const PROOF_FILTERS: ProofFilter[] = ['proven', 'all'];

const playUrl = (gameName: number, playerID: number, authKey: string) =>
  `/game/play/${gameName}?playerID=${playerID}&authKey=${authKey}`;

const realTurnValues = (row: PuzzleCandidate): Record<string, number> => ({
  cardsPlayed: row.realTurn?.cardsPlayed ?? 0,
  pitched: row.realTurn?.pitched ?? 0,
  threatened: row.realTurn?.threatened ?? 0,
  dealt: row.realTurn?.dealt ?? 0,
  blocked: row.realTurn?.blocked ?? 0,
  overkill: row.realTurn?.overkill ?? 0
});

const isProven = (row: PuzzleCandidate) => row.proof?.status === 'proven';

const proofValues = (row: PuzzleCandidate): Record<string, number> => ({
  cardsPlayed: row.proof?.cardsPlayed ?? 0,
  pitched: row.proof?.pitched ?? 0,
  threatened: row.proof?.threatened ?? 0,
  blocked: row.proof?.blocked ?? 0,
  dealt: row.proof?.dealt ?? 0,
  life: row.opponentLife,
  realLife: row.realLife
});

const proofKey = (row: PuzzleCandidate) => {
  if (!row.hasLine) return 'NO_LINE';
  if (!row.proof) return 'PENDING';
  return isProven(row) ? 'PROVEN' : 'FAILED';
};

const useCardImage = (cardNumber: string) => {
  const { getLanguage } = useLanguageSelector();
  return getCollectionCardImagePath({
    path: CARD_SQUARES_PATH,
    locale: getLanguage(),
    cardNumber
  });
};

const HeroCell = ({ row }: { row: PuzzleCandidate }) => {
  const { t } = useTranslation();
  const src = useCardImage(row.hero);
  const [imageFailed, setImageFailed] = useState(false);
  return (
    <div className={tableStyles.cardCell}>
      {!imageFailed ? (
        <img
          className={tableStyles.thumb}
          src={src}
          alt=""
          loading="lazy"
          onError={() => setImageFailed(true)}
        />
      ) : (
        <span className={tableStyles.thumbPlaceholder} aria-hidden="true" />
      )}
      <div className={tableStyles.cardText}>
        <span className={tableStyles.cardName}>{row.heroName || row.hero}</span>
        <span className={tableStyles.muted}>
          {t('MOD_PAGE.PUZZLES_VERSUS', {
            name: row.opponentHeroName || row.opponentHero
          })}
        </span>
      </div>
    </div>
  );
};

const CardThumb = ({
  card,
  arsenal
}: {
  card: PuzzleCard;
  arsenal: boolean;
}) => {
  const { t } = useTranslation();
  const src = useCardImage(card.id);
  const [imageFailed, setImageFailed] = useState(false);
  const title = arsenal
    ? t('MOD_PAGE.PUZZLES_IN_ARSENAL', { name: card.name })
    : card.name;
  const className = arsenal
    ? `${styles.cardThumb} ${styles.arsenalThumb}`
    : styles.cardThumb;
  return imageFailed ? (
    <span className={`${className} ${styles.cardFallback}`} title={title}>
      {card.name.slice(0, 2)}
    </span>
  ) : (
    <img
      className={className}
      src={src}
      alt={title}
      title={title}
      loading="lazy"
      onError={() => setImageFailed(true)}
    />
  );
};

const CardList = ({ label, cards }: { label: string; cards: PuzzleCard[] }) => {
  const { t } = useTranslation();
  return (
    <div className={styles.detailGroup}>
      <span className={styles.detailLabel}>{label}</span>
      {cards.length === 0 ? (
        <span className={tableStyles.muted}>{t('MOD_PAGE.PUZZLES_NONE')}</span>
      ) : (
        <ul className={styles.detailList}>
          {cards.map((card, index) => (
            <li key={`${card.id}-${index}`}>
              {card.name}{' '}
              <span className={tableStyles.muted}>
                {card.type === 'E'
                  ? t('MOD_PAGE.PUZZLES_EQUIPMENT_STATS', {
                      defense: card.defense
                    })
                  : card.type === 'W'
                  ? t('MOD_PAGE.PUZZLES_WEAPON_STATS', { power: card.power })
                  : t('MOD_PAGE.PUZZLES_CARD_STATS', {
                      type: card.type,
                      cost: card.cost,
                      pitch: card.pitch,
                      power: card.power,
                      defense: card.defense
                    })}
                {card.goAgain && ` · ${t('MOD_PAGE.PUZZLES_GO_AGAIN')}`}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

const Details = ({ row }: { row: PuzzleCandidate }) => {
  const { t } = useTranslation();
  const proof = proofKey(row);
  return (
    <div className={styles.details}>
      <CardList label={t('MOD_PAGE.PUZZLES_YOUR_HAND')} cards={row.hand} />
      <CardList
        label={t('MOD_PAGE.PUZZLES_YOUR_ARSENAL')}
        cards={row.arsenal}
      />
      <CardList
        label={t('MOD_PAGE.PUZZLES_YOUR_WEAPONS')}
        cards={row.weapons}
      />
      <CardList
        label={t('MOD_PAGE.PUZZLES_THEIR_EQUIPMENT')}
        cards={row.opponentEquipment}
      />
      <CardList
        label={t('MOD_PAGE.PUZZLES_THEIR_HAND')}
        cards={row.opponentHand}
      />
      <div className={styles.detailGroup}>
        <span className={styles.detailLabel}>
          {t('MOD_PAGE.PUZZLES_POSITION')}
        </span>
        <ul className={styles.detailList}>
          <li>
            {t('MOD_PAGE.PUZZLES_RESOURCES', {
              floating: row.floating,
              pitch: row.handPitch,
              actionPoints: row.actionPoints
            })}
          </li>
          <li>
            {t('MOD_PAGE.PUZZLES_ESTIMATE', {
              damage: row.estimatedDamage,
              through: row.estimatedThrough,
              attacks: row.estimatedAttacks,
              life: row.opponentLife
            })}
          </li>
          <li>
            {proof === 'PROVEN'
              ? t('MOD_PAGE.PUZZLES_PROOF_DETAIL', proofValues(row))
              : proof === 'FAILED'
              ? t('MOD_PAGE.PUZZLES_PROOF_FAILED_DETAIL', {
                  reason: row.proof?.reason ?? ''
                })
              : t(`MOD_PAGE.PUZZLES_PROOF_${proof}_DETAIL`)}
          </li>
          <li>
            {row.realTurn
              ? t('MOD_PAGE.PUZZLES_REAL_TURN_DETAIL', realTurnValues(row))
              : t('MOD_PAGE.PUZZLES_NO_REAL_TURN')}
          </li>
          <li className={tableStyles.muted}>
            {t('MOD_PAGE.PUZZLES_COLLECTED', {
              date: row.createdAt,
              turn: row.turn
            })}
          </li>
        </ul>
      </div>
    </div>
  );
};

const PuzzleCandidates: React.FC = () => {
  const { t } = useTranslation();
  const [query, setQuery] = useState('');
  const [format, setFormat] = useState('');
  const [difficulty, setDifficulty] = useState('');
  const [proofFilter, setProofFilter] = useState<ProofFilter>('proven');
  const [sortKey, setSortKey] = useState<SortKey>('score');
  const [sortDescending, setSortDescending] = useState(true);
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [creatingId, setCreatingId] = useState<number | null>(null);
  const [ready, setReady] = useState<ReadyPuzzle | null>(null);

  const { data, isFetching, isError, refetch } = useGetPuzzleCandidatesQuery();
  const [createPuzzleGame] = useCreatePuzzleGameMutation();
  const [verifyPuzzleCandidates] = useVerifyPuzzleCandidatesMutation();
  const [verifyState, setVerifyState] = useState<VerifyState>('idle');
  const [remaining, setRemaining] = useState(0);
  const verifiedList = useRef<PuzzleCandidatesResponse>();

  const candidates = useMemo(() => data?.candidates ?? [], [data]);
  const pending = data?.pending ?? 0;
  const provenCount = useMemo(
    () => candidates.filter(isProven).length,
    [candidates]
  );

  useEffect(() => {
    if (!data || pending === 0 || verifyState !== 'idle') return;
    if (verifiedList.current === data) return;
    verifiedList.current = data;
    setVerifyState('running');
    setRemaining(pending);
    const run = async () => {
      let failed = false;
      try {
        for (let left = pending; left > 0; ) {
          const result = await verifyPuzzleCandidates().unwrap();
          left = result.remaining;
          setRemaining(left);
          if (result.verified === 0) {
            failed = left > 0;
            break;
          }
        }
      } catch {
        failed = true;
      }
      setVerifyState(failed ? 'failed' : 'idle');
      refetch();
    };
    run();
  }, [data, pending, verifyState, verifyPuzzleCandidates, refetch]);

  const formats = useMemo(
    () => Array.from(new Set(candidates.map((row) => row.format))).sort(),
    [candidates]
  );

  const visibleRows = useMemo(() => {
    const needle = query.trim().toLowerCase();
    const filtered = candidates.filter((row) => {
      if (format && row.format !== format) return false;
      if (difficulty && row.difficulty !== difficulty) return false;
      if (proofFilter === 'proven' && !isProven(row)) return false;
      if (!needle) return true;
      return [
        row.heroName,
        row.hero,
        row.opponentHeroName,
        row.opponentHero,
        ...row.hand.map((card) => card.name)
      ].some((value) => value.toLowerCase().includes(needle));
    });
    const direction = sortDescending ? -1 : 1;
    return [...filtered].sort(
      (a, b) => (a[sortKey] - b[sortKey]) * direction || b.id - a.id
    );
  }, [
    candidates,
    query,
    format,
    difficulty,
    proofFilter,
    sortKey,
    sortDescending
  ]);

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
        candidateId: candidate.id
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

  const flagClass = (code: string) => {
    if (GOOD_FLAGS.includes(code))
      return `${tableStyles.reason} ${styles.good}`;
    if (BAD_FLAGS.includes(code)) return `${tableStyles.reason} ${styles.bad}`;
    return tableStyles.reason;
  };

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
        <select
          className={tableStyles.phaseSelect}
          value={difficulty}
          aria-label={t('MOD_PAGE.PUZZLES_DIFFICULTY_FILTER')}
          onChange={(event) => setDifficulty(event.target.value)}
        >
          <option value="">{t('MOD_PAGE.PUZZLES_ALL_DIFFICULTIES')}</option>
          {DIFFICULTIES.map((value) => (
            <option key={value} value={value}>
              {t(`MOD_PAGE.PUZZLES_DIFFICULTY_${value.toUpperCase()}`)}
            </option>
          ))}
        </select>
        <select
          className={tableStyles.phaseSelect}
          value={proofFilter}
          aria-label={t('MOD_PAGE.PUZZLES_PROOF_FILTER')}
          onChange={(event) =>
            setProofFilter(event.target.value as ProofFilter)
          }
        >
          {PROOF_FILTERS.map((value) => (
            <option key={value} value={value}>
              {t(`MOD_PAGE.PUZZLES_PROOF_FILTER_${value.toUpperCase()}`)}
            </option>
          ))}
        </select>
      </div>

      {ready && (
        <div className={styles.ready} role="status">
          <span>
            {t('MOD_PAGE.PUZZLES_READY', {
              id: ready.candidateId,
              game: ready.gameName
            })}
          </span>
          <a
            className={`${styles.button} ${styles.primary}`}
            href={playUrl(ready.gameName, ready.playerID, ready.authKey)}
            target="_blank"
            rel="noopener noreferrer"
          >
            {t('MOD_PAGE.PUZZLES_OPEN_PUZZLE')}
          </a>
        </div>
      )}

      {data && !isError && (
        <p className={tableStyles.summary}>
          {t('MOD_PAGE.PUZZLES_SUMMARY', {
            total: data.total.toLocaleString(),
            shown: candidates.length.toLocaleString(),
            proven: provenCount.toLocaleString()
          })}
          {verifyState === 'running' && (
            <span className={tableStyles.muted}>
              {' '}
              {t('MOD_PAGE.PUZZLES_VERIFYING', {
                count: remaining.toLocaleString()
              })}
            </span>
          )}
          {verifyState === 'failed' && (
            <span className={tableStyles.muted}>
              {' '}
              {t('MOD_PAGE.PUZZLES_VERIFY_FAILED')}
            </span>
          )}
          {isFetching && verifyState !== 'running' && (
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
          <table className={`${tableStyles.table} ${styles.table}`}>
            <thead>
              <tr>
                {sortHeader('score', t('MOD_PAGE.PUZZLES_COL_SCORE'))}
                <th scope="col">{t('MOD_PAGE.PUZZLES_COL_MATCHUP')}</th>
                {sortHeader('opponentLife', t('MOD_PAGE.PUZZLES_COL_LIFE'))}
                <th scope="col">{t('MOD_PAGE.PUZZLES_COL_CARDS')}</th>
                <th scope="col">{t('MOD_PAGE.PUZZLES_COL_DEFENSE')}</th>
                <th scope="col">{t('MOD_PAGE.PUZZLES_COL_PROOF')}</th>
                <th scope="col">{t('MOD_PAGE.PUZZLES_COL_FLAGS')}</th>
                <th scope="col">{t('MOD_PAGE.PUZZLES_COL_FORMAT')}</th>
                {sortHeader('id', '#')}
                <th scope="col">
                  <span className={styles.visuallyHidden}>
                    {t('MOD_PAGE.PUZZLES_PLAY')}
                  </span>
                </th>
              </tr>
            </thead>
            <tbody>
              {visibleRows.map((row) => (
                <Fragment key={row.id}>
                  <tr>
                    <td className={tableStyles.numeric}>
                      <span className={styles.score}>{row.score}</span>
                      <span className={styles.difficulty}>
                        {t(
                          `MOD_PAGE.PUZZLES_DIFFICULTY_${row.difficulty.toUpperCase()}`
                        )}
                      </span>
                    </td>
                    <td>
                      <HeroCell row={row} />
                    </td>
                    <td className={tableStyles.numeric}>
                      <span className={styles.score}>{row.opponentLife}</span>
                      {row.opponentLife !== row.realLife && (
                        <span className={tableStyles.muted}>
                          {t('MOD_PAGE.PUZZLES_LIFE_WAS', {
                            life: row.realLife
                          })}
                        </span>
                      )}
                    </td>
                    <td>
                      <div className={styles.cardStrip}>
                        {row.hand.map((card, index) => (
                          <CardThumb
                            key={`hand-${card.id}-${index}`}
                            card={card}
                            arsenal={false}
                          />
                        ))}
                        {row.arsenal.map((card, index) => (
                          <CardThumb
                            key={`arsenal-${card.id}-${index}`}
                            card={card}
                            arsenal
                          />
                        ))}
                      </div>
                    </td>
                    <td>
                      {t('MOD_PAGE.PUZZLES_DEFENSE', {
                        equipment: row.opponentEquipmentBlock,
                        hand: row.opponentHandBlock
                      })}
                    </td>
                    <td>
                      {isProven(row) ? (
                        t('MOD_PAGE.PUZZLES_PROOF_SHORT', proofValues(row))
                      ) : (
                        <span
                          className={tableStyles.muted}
                          title={row.proof?.reason}
                        >
                          {t(`MOD_PAGE.PUZZLES_PROOF_${proofKey(row)}`)}
                        </span>
                      )}
                    </td>
                    <td>
                      <div className={tableStyles.reasons}>
                        {row.flags.map((flag) => (
                          <span
                            key={flag.code}
                            className={flagClass(flag.code)}
                          >
                            {t(`MOD_PAGE.PUZZLES_FLAG_${flag.code}`, {
                              value: flag.value
                            })}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td>{formatLabel(row.format)}</td>
                    <td
                      className={`${tableStyles.numeric} ${tableStyles.muted}`}
                    >
                      {row.id}
                    </td>
                    <td>
                      <div className={styles.actions}>
                        <button
                          type="button"
                          className={styles.button}
                          disabled={creatingId !== null || !isProven(row)}
                          title={
                            isProven(row)
                              ? undefined
                              : t('MOD_PAGE.PUZZLES_PLAY_UNPROVEN')
                          }
                          onClick={() => handlePlay(row)}
                        >
                          {creatingId === row.id
                            ? t('MOD_PAGE.PUZZLES_CREATING')
                            : t('MOD_PAGE.PUZZLES_PLAY')}
                        </button>
                        <button
                          type="button"
                          className={styles.button}
                          aria-expanded={expandedId === row.id}
                          onClick={() =>
                            setExpandedId(expandedId === row.id ? null : row.id)
                          }
                        >
                          {expandedId === row.id
                            ? t('MOD_PAGE.PUZZLES_HIDE_DETAILS')
                            : t('MOD_PAGE.PUZZLES_DETAILS')}
                        </button>
                      </div>
                    </td>
                  </tr>
                  {expandedId === row.id && (
                    <tr className={styles.detailRow}>
                      <td colSpan={10}>
                        <Details row={row} />
                      </td>
                    </tr>
                  )}
                </Fragment>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
};

export default PuzzleCandidates;

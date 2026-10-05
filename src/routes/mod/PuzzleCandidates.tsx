import React, { Fragment, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'react-hot-toast';
import {
  useCreatePuzzleGameMutation,
  useGetPuzzleCandidatesQuery,
  useSchedulePuzzleMutation,
  useVerifyPuzzleCandidateMutation
} from 'features/api/apiSlice';
import {
  CreatePuzzleGameResponse,
  PuzzleBot,
  PuzzleCandidate,
  PuzzleCard,
  PuzzleDifficulty,
  PuzzleKind,
  PuzzleLesson,
  PuzzleMode,
  PuzzleRubric,
  PuzzleStep
} from 'interface/API/ModPageAPI';
import { CARD_SQUARES_PATH, getCollectionCardImagePath } from 'utils';
import { getReadableFormatName } from 'utils/formatUtils';
import { parseTextToElements } from 'utils/ParseEscapedString';
import { describePuzzleStep, puzzleCardNames } from 'utils/puzzleText';
import { useLanguageSelector } from 'hooks/useLanguageSelector';
import PuzzleSchedule from './PuzzleSchedule';
import tableStyles from './PromptStats.module.css';
import styles from './PuzzleCandidates.module.css';

type SortKey = 'interest' | 'id' | 'opponentLife' | 'gap';
type ProofFilter = 'all' | 'proven';

interface ReadyPuzzle extends CreatePuzzleGameResponse {
  candidateId: number;
  mode: PuzzleMode;
}

const KINDS: PuzzleKind[] = ['lethal', 'survive'];
const DIFFICULTIES: PuzzleDifficulty[] = ['easy', 'medium', 'hard'];
const GOOD_FLAGS = [
  'EXACT_LETHAL',
  'BIG_TURN',
  'ALL_CARDS',
  'HIGH_PRESSURE',
  'NEEDS_TEXT',
  'BOT_FAILS'
];
const BAD_FLAGS = [
  'LOW_PRESSURE',
  'FEW_OPTIONS',
  'ONE_CARD',
  'UNPROVEN',
  'PLAIN_STATS',
  'BOT_SOLVES'
];
const PROOF_FILTERS: ProofFilter[] = ['all', 'proven'];

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

const needsCheck = (row: PuzzleCandidate) =>
  row.hasLine && (!row.proof || (isProven(row) && !row.bot));

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

const Solution = ({ steps }: { steps: PuzzleStep[] }) => {
  const { t } = useTranslation();
  return (
    <div className={`${styles.detailGroup} ${styles.solution}`}>
      <span className={styles.detailLabel}>
        {t('MOD_PAGE.PUZZLES_SOLUTION')}
      </span>
      <ol className={styles.stepList}>
        {steps.map((step, index) => (
          <li key={index}>
            {describePuzzleStep(step, t)}
            {step.prompt && (
              <span className={tableStyles.muted}> · {step.prompt}</span>
            )}
          </li>
        ))}
      </ol>
    </div>
  );
};

const Lesson = ({ lesson }: { lesson: PuzzleLesson }) => {
  const { t } = useTranslation();
  return (
    <div className={`${styles.detailGroup} ${styles.solution}`}>
      <span className={styles.detailLabel}>
        {t('MOD_PAGE.PUZZLES_LESSON', {
          theme: t(`PUZZLE.THEME.${lesson.theme}`)
        })}
      </span>
      <ol className={styles.stepList}>
        {lesson.hints.map((hint, index) => (
          <li key={index}>{parseTextToElements(hint)}</li>
        ))}
      </ol>
    </div>
  );
};

const Rubric = ({ rubric }: { rubric: PuzzleRubric }) => {
  const { t } = useTranslation();
  return (
    <div className={`${styles.detailGroup} ${styles.solution}`}>
      <span className={styles.detailLabel}>
        {t('MOD_PAGE.PUZZLES_RUBRIC_TITLE', {
          percent: rubric.percent,
          points: rubric.points,
          max: rubric.max
        })}
      </span>
      <ul className={styles.rubricList}>
        {rubric.criteria.map((criterion) => (
          <li
            key={criterion.code}
            className={
              criterion.points === criterion.max ? undefined : styles.rubricMiss
            }
          >
            <span className={styles.rubricPoints}>
              {t('MOD_PAGE.PUZZLES_RUBRIC_POINTS', {
                points: criterion.points,
                max: criterion.max
              })}
            </span>
            {t(`MOD_PAGE.PUZZLES_RUBRIC_${criterion.code}`)}
            {!criterion.measured && (
              <span className={tableStyles.muted}>
                {' '}
                · {t('MOD_PAGE.PUZZLES_RUBRIC_UNMEASURED')}
              </span>
            )}
          </li>
        ))}
      </ul>
      {rubric.capped && (
        <span className={tableStyles.muted}>
          {t('MOD_PAGE.PUZZLES_RUBRIC_CAPPED')}
        </span>
      )}
    </div>
  );
};

const BotSummary = ({ bot, kind }: { bot: PuzzleBot; kind: PuzzleKind }) => {
  const { t } = useTranslation();
  const none = t('MOD_PAGE.PUZZLES_NONE');
  return (
    <div className={styles.detailGroup}>
      <span className={styles.detailLabel}>
        {t('MOD_PAGE.PUZZLES_BOT_TITLE')}
      </span>
      <ul className={styles.detailList}>
        {kind === 'survive' ? (
          <>
            <li>
              {t(
                bot.won
                  ? 'MOD_PAGE.PUZZLES_BOT_SURVIVED'
                  : 'MOD_PAGE.PUZZLES_BOT_DIED',
                { damage: bot.damage }
              )}
            </li>
            <li>
              {t('MOD_PAGE.PUZZLES_BOT_BLOCKED', {
                cards: puzzleCardNames(bot.blocked) || none
              })}
            </li>
          </>
        ) : (
          <>
            <li>
              {t(
                bot.won
                  ? 'MOD_PAGE.PUZZLES_BOT_KILLED'
                  : 'MOD_PAGE.PUZZLES_BOT_FELL_SHORT',
                { damage: bot.damage }
              )}
            </li>
            <li>
              {t('MOD_PAGE.PUZZLES_BOT_PLAYED', {
                cards: puzzleCardNames(bot.played) || none
              })}
            </li>
            <li>
              {t('MOD_PAGE.PUZZLES_BOT_PITCHED', {
                cards: puzzleCardNames(bot.pitched) || none
              })}
            </li>
          </>
        )}
      </ul>
    </div>
  );
};

const ScheduleForm = ({
  row,
  mode,
  onModeChange
}: {
  row: PuzzleCandidate;
  mode: PuzzleMode;
  onModeChange: (mode: PuzzleMode) => void;
}) => {
  const { t } = useTranslation();
  const [date, setDate] = useState('');
  const [life, setLife] = useState('');
  const [schedulePuzzle, { isLoading }] = useSchedulePuzzleMutation();
  const setsLife = mode !== 'damage';

  const schedule = async () => {
    try {
      const result = await schedulePuzzle({
        action: 'schedule',
        candidateId: row.id,
        mode,
        date: date || undefined,
        life: setsLife && life !== '' ? Number(life) : undefined
      }).unwrap();
      if (result.error) toast.error(result.error);
      else
        toast.success(
          t('MOD_PAGE.PUZZLES_SCHEDULED', { date: result.scheduled ?? date })
        );
    } catch {
      // Error will be shown via toast from RTK Query error handler
    }
  };

  return (
    <div className={styles.detailGroup}>
      <span className={styles.detailLabel}>
        {t('MOD_PAGE.PUZZLES_DAILY_TITLE')}
      </span>
      <div className={styles.scheduleForm}>
        {row.kind === 'lethal' && (
          <select
            className={tableStyles.phaseSelect}
            value={mode}
            aria-label={t('MOD_PAGE.PUZZLES_MODE')}
            onChange={(event) => onModeChange(event.target.value as PuzzleMode)}
          >
            <option value="lethal">{t('PUZZLE.MODE.lethal')}</option>
            <option value="damage">{t('PUZZLE.MODE.damage')}</option>
          </select>
        )}
        <input
          type="date"
          className={tableStyles.search}
          value={date}
          aria-label={t('MOD_PAGE.PUZZLES_SCHEDULE_DATE')}
          onChange={(event) => setDate(event.target.value)}
        />
        {setsLife && (
          <input
            type="number"
            min={1}
            max={99}
            className={`${tableStyles.search} ${styles.lifeInput}`}
            value={life}
            placeholder={String(row.opponentLife)}
            aria-label={t('MOD_PAGE.PUZZLES_SCHEDULE_LIFE')}
            title={t('MOD_PAGE.PUZZLES_SCHEDULE_LIFE')}
            onChange={(event) => setLife(event.target.value)}
          />
        )}
        <button
          type="button"
          className={styles.button}
          disabled={isLoading || !isProven(row)}
          onClick={schedule}
        >
          {isLoading
            ? t('MOD_PAGE.PUZZLES_CHECKING')
            : t('MOD_PAGE.PUZZLES_SCHEDULE')}
        </button>
      </div>
      <span className={tableStyles.muted}>
        {isProven(row)
          ? t('MOD_PAGE.PUZZLES_SCHEDULE_HINT', { life: row.opponentLife })
          : t('MOD_PAGE.PUZZLES_SCHEDULE_NEEDS_PROOF')}
      </span>
    </div>
  );
};

const Details = ({
  row,
  checking,
  mode,
  onModeChange
}: {
  row: PuzzleCandidate;
  checking: boolean;
  mode: PuzzleMode;
  onModeChange: (mode: PuzzleMode) => void;
}) => {
  const { t } = useTranslation();
  const proof = proofKey(row);
  const survive = row.kind === 'survive';
  const spare = (isProven(row) && row.proof?.spare) || [];
  return (
    <div className={styles.details}>
      <Rubric rubric={row.rubric} />
      {row.lesson && <Lesson lesson={row.lesson} />}
      {isProven(row) && row.solution && row.solution.length > 0 && (
        <Solution steps={row.solution} />
      )}
      {row.bot && <BotSummary bot={row.bot} kind={row.kind} />}
      <ScheduleForm row={row} mode={mode} onModeChange={onModeChange} />
      <CardList label={t('MOD_PAGE.PUZZLES_YOUR_HAND')} cards={row.hand} />
      <CardList
        label={t('MOD_PAGE.PUZZLES_YOUR_ARSENAL')}
        cards={row.arsenal}
      />
      {survive ? (
        <CardList
          label={t('MOD_PAGE.PUZZLES_YOUR_EQUIPMENT')}
          cards={row.equipment}
        />
      ) : (
        <>
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
        </>
      )}
      <div className={styles.detailGroup}>
        <span className={styles.detailLabel}>
          {t('MOD_PAGE.PUZZLES_POSITION')}
        </span>
        <ul className={styles.detailList}>
          {survive ? (
            <li>
              {t('MOD_PAGE.PUZZLES_SURVIVE_ESTIMATE', {
                incoming: row.estimatedDamage,
                through: row.estimatedThrough,
                life: row.opponentLife
              })}
            </li>
          ) : (
            <>
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
            </>
          )}
          <li>
            {proof === 'PROVEN'
              ? t(
                  survive
                    ? 'MOD_PAGE.PUZZLES_SURVIVE_PROOF_DETAIL'
                    : 'MOD_PAGE.PUZZLES_PROOF_DETAIL',
                  proofValues(row)
                )
              : proof === 'FAILED'
              ? t('MOD_PAGE.PUZZLES_PROOF_FAILED_DETAIL', {
                  reason: row.proof?.reason ?? '',
                  life: row.realLife
                })
              : checking
              ? t('MOD_PAGE.PUZZLES_PROOF_CHECKING_DETAIL')
              : t(`MOD_PAGE.PUZZLES_PROOF_${proof}_DETAIL`, {
                  life: row.realLife
                })}
          </li>
          {spare.length > 0 && (
            <li>
              {t('MOD_PAGE.PUZZLES_SURVIVE_PROOF_SPARE', {
                cards: puzzleCardNames(spare)
              })}
            </li>
          )}
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
  const [kind, setKind] = useState<PuzzleKind>('lethal');
  const [query, setQuery] = useState('');
  const [format, setFormat] = useState('');
  const [difficulty, setDifficulty] = useState('');
  const [proofFilter, setProofFilter] = useState<ProofFilter>('all');
  const [showFiltered, setShowFiltered] = useState(false);
  const [sortKey, setSortKey] = useState<SortKey>('interest');
  const [sortDescending, setSortDescending] = useState(true);
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [creatingId, setCreatingId] = useState<number | null>(null);
  const [ready, setReady] = useState<ReadyPuzzle | null>(null);
  const [modes, setModes] = useState<Record<number, PuzzleMode>>({});

  const { data, isFetching, isError, refetch } =
    useGetPuzzleCandidatesQuery(kind);
  const [createPuzzleGame] = useCreatePuzzleGameMutation();
  const [verifyPuzzleCandidate] = useVerifyPuzzleCandidateMutation();
  const [checkingId, setCheckingId] = useState<number | null>(null);

  const candidates = useMemo(() => data?.candidates ?? [], [data]);
  const provenCount = useMemo(
    () => candidates.filter(isProven).length,
    [candidates]
  );
  const filteredCount = useMemo(
    () => candidates.filter((row) => row.filtered).length,
    [candidates]
  );

  const formats = useMemo(
    () => Array.from(new Set(candidates.map((row) => row.format))).sort(),
    [candidates]
  );

  const modeFor = (row: PuzzleCandidate): PuzzleMode =>
    row.kind === 'survive' ? 'survive' : modes[row.id] ?? 'lethal';

  const visibleRows = useMemo(() => {
    const needle = query.trim().toLowerCase();
    const filtered = candidates.filter((row) => {
      if (!showFiltered && row.filtered) return false;
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
    showFiltered,
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

  const checkLine = async (candidate: PuzzleCandidate) => {
    if (!needsCheck(candidate)) return;
    setCheckingId(candidate.id);
    try {
      await verifyPuzzleCandidate({ candidateId: candidate.id }).unwrap();
      await refetch();
    } catch {
      // Error will be shown via toast from RTK Query error handler
    } finally {
      setCheckingId(null);
    }
  };

  const handlePlay = async (candidate: PuzzleCandidate) => {
    const mode = modeFor(candidate);
    setCreatingId(candidate.id);
    setReady(null);
    try {
      await checkLine(candidate);
      const result = await createPuzzleGame({
        candidateId: candidate.id,
        mode
      }).unwrap();
      setReady({ ...result, candidateId: candidate.id, mode });
    } catch {
      // Error will be shown via toast from RTK Query error handler
    } finally {
      setCreatingId(null);
    }
  };

  const toggleDetails = (candidate: PuzzleCandidate) => {
    if (expandedId === candidate.id) {
      setExpandedId(null);
      return;
    }
    setExpandedId(candidate.id);
    if (checkingId === null && creatingId === null) checkLine(candidate);
  };

  const changeKind = (value: PuzzleKind) => {
    setKind(value);
    setExpandedId(null);
    setFormat('');
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
      <PuzzleSchedule />

      <div className={tableStyles.header}>
        <div>
          <h2 className={tableStyles.title}>{t('MOD_PAGE.PUZZLES_TITLE')}</h2>
          <p className={tableStyles.description}>
            {t('MOD_PAGE.PUZZLES_DESCRIPTION')}
          </p>
        </div>
        <div
          className={tableStyles.segmented}
          role="group"
          aria-label={t('MOD_PAGE.PUZZLES_KIND')}
        >
          {KINDS.map((value) => (
            <button
              key={value}
              type="button"
              aria-pressed={kind === value}
              className={
                kind === value
                  ? `${tableStyles.segment} ${tableStyles.segmentActive}`
                  : tableStyles.segment
              }
              onClick={() => changeKind(value)}
            >
              {t(`PUZZLE.MODE.${value}`)}
            </button>
          ))}
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
        <label className={tableStyles.toggle}>
          <input
            type="checkbox"
            checked={showFiltered}
            onChange={(event) => setShowFiltered(event.target.checked)}
          />
          {t('MOD_PAGE.PUZZLES_SHOW_FILTERED', {
            count: filteredCount
          })}
        </label>
      </div>

      {ready && (
        <div className={styles.ready} role="status">
          <span>
            {t('MOD_PAGE.PUZZLES_READY', {
              id: ready.candidateId,
              game: ready.gameName,
              mode: t(`PUZZLE.MODE.${ready.mode}`)
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
            proven: provenCount.toLocaleString(),
            filtered: filteredCount.toLocaleString()
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
          <table className={`${tableStyles.table} ${styles.table}`}>
            <thead>
              <tr>
                {sortHeader('interest', t('MOD_PAGE.PUZZLES_COL_INTEREST'))}
                <th scope="col">{t('MOD_PAGE.PUZZLES_COL_MATCHUP')}</th>
                {sortHeader('opponentLife', t('MOD_PAGE.PUZZLES_COL_LIFE'))}
                {sortHeader('gap', t('MOD_PAGE.PUZZLES_COL_GAP'))}
                <th scope="col">{t('MOD_PAGE.PUZZLES_COL_CARDS')}</th>
                <th scope="col">
                  {kind === 'survive'
                    ? t('MOD_PAGE.PUZZLES_COL_INCOMING')
                    : t('MOD_PAGE.PUZZLES_COL_DEFENSE')}
                </th>
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
                      <span className={styles.score}>
                        {t('MOD_PAGE.PUZZLES_INTEREST_VALUE', {
                          percent: row.interest
                        })}
                      </span>
                      {row.rubric.potential > row.interest && (
                        <span className={tableStyles.muted}>
                          {t('MOD_PAGE.PUZZLES_INTEREST_UP_TO', {
                            percent: row.rubric.potential
                          })}
                        </span>
                      )}
                      <span className={styles.difficulty}>
                        {t(
                          `MOD_PAGE.PUZZLES_DIFFICULTY_${row.difficulty.toUpperCase()}`
                        )}
                      </span>
                      {row.lesson && (
                        <span className={styles.theme}>
                          {t(`PUZZLE.THEME.${row.lesson.theme}`)}
                        </span>
                      )}
                    </td>
                    <td>
                      <HeroCell row={row} />
                      {row.status === 1 && (
                        <span className={tableStyles.muted}>
                          {t('MOD_PAGE.PUZZLES_STATUS_SCHEDULED')}
                        </span>
                      )}
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
                    <td className={tableStyles.numeric}>
                      <span className={styles.score}>{row.gap}</span>
                      {row.bot && (
                        <span className={tableStyles.muted}>
                          {t('MOD_PAGE.PUZZLES_BOT_SHORT', {
                            damage: row.bot.damage
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
                      {row.kind === 'survive'
                        ? t('MOD_PAGE.PUZZLES_INCOMING', {
                            incoming: row.estimatedDamage,
                            attacks: row.estimatedAttacks
                          })
                        : t('MOD_PAGE.PUZZLES_DEFENSE', {
                            equipment: row.opponentEquipmentBlock,
                            hand: row.opponentHandBlock
                          })}
                    </td>
                    <td>
                      {isProven(row) ? (
                        t(
                          row.kind === 'survive'
                            ? 'MOD_PAGE.PUZZLES_SURVIVE_PROOF_SHORT'
                            : 'MOD_PAGE.PUZZLES_PROOF_SHORT',
                          proofValues(row)
                        )
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
                          disabled={creatingId !== null || checkingId !== null}
                          onClick={() => handlePlay(row)}
                        >
                          {checkingId === row.id
                            ? t('MOD_PAGE.PUZZLES_CHECKING')
                            : creatingId === row.id
                            ? t('MOD_PAGE.PUZZLES_CREATING')
                            : t('MOD_PAGE.PUZZLES_PLAY')}
                        </button>
                        <button
                          type="button"
                          className={styles.button}
                          aria-expanded={expandedId === row.id}
                          onClick={() => toggleDetails(row)}
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
                      <td colSpan={11}>
                        <Details
                          row={row}
                          checking={checkingId === row.id}
                          mode={modeFor(row)}
                          onModeChange={(mode) =>
                            setModes((current) => ({
                              ...current,
                              [row.id]: mode
                            }))
                          }
                        />
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

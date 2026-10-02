import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { toast } from 'react-hot-toast';
import { FaThumbsDown, FaThumbsUp } from 'react-icons/fa';
import {
  useGetDailyPuzzleQuery,
  useRateDailyPuzzleMutation,
  useStartDailyPuzzleMutation
} from 'features/api/apiSlice';
import {
  DailyPuzzleInfo,
  DailyPuzzleLesson,
  DailyPuzzleResponse,
  DailyPuzzleResult
} from 'interface/API/DailyPuzzleAPI';
import PageBanner from 'components/PageBanner/PageBanner';
import AdRailLayout from 'components/ads/AdRailLayout';
import { generateCroppedImageUrl } from 'utils/cropImages';
import { getReadableFormatName } from 'utils/formatUtils';
import { parseTextToElements } from 'utils/ParseEscapedString';
import { describePuzzleStep } from 'utils/puzzleText';
import styles from './DailyPuzzle.module.css';

const MAX_STARS = 3;

const playUrl = (gameName: number, playerID: number, authKey: string) =>
  `/game/play/${gameName}?playerID=${playerID}&authKey=${authKey}`;

const starText = (stars: number) =>
  '★'.repeat(stars) + '☆'.repeat(Math.max(0, MAX_STARS - stars));

const Stars = ({ stars }: { stars: number }) => {
  const { t } = useTranslation();
  return (
    <span
      className={styles.stars}
      role="img"
      aria-label={t('DAILY_PUZZLE.STARS_LABEL', { stars, max: MAX_STARS })}
    >
      {Array.from({ length: MAX_STARS }, (_, index) => (
        <span
          key={index}
          className={index < stars ? styles.starOn : styles.starOff}
          aria-hidden="true"
        >
          ★
        </span>
      ))}
    </span>
  );
};

const HeroPortrait = ({
  hero,
  name,
  label
}: {
  hero: string;
  name: string;
  label: string;
}) => {
  const [imageFailed, setImageFailed] = useState(false);
  return (
    <figure className={styles.hero}>
      {imageFailed ? (
        <span className={styles.heroFallback} aria-hidden="true" />
      ) : (
        <img
          className={styles.heroImage}
          src={generateCroppedImageUrl(hero)}
          alt=""
          onError={() => setImageFailed(true)}
        />
      )}
      <figcaption>
        <span className={styles.heroLabel}>{label}</span>
        <span className={styles.heroName}>{name}</span>
      </figcaption>
    </figure>
  );
};

const useCountdown = (seconds: number) => {
  const [startedAt] = useState(() => Date.now());
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const timer = window.setInterval(() => setNow(Date.now()), 30000);
    return () => window.clearInterval(timer);
  }, []);
  const left = Math.max(0, seconds - Math.floor((now - startedAt) / 1000));
  return {
    hours: Math.floor(left / 3600),
    minutes: Math.floor((left % 3600) / 60)
  };
};

const shareText = (
  puzzle: DailyPuzzleInfo,
  result: DailyPuzzleResult,
  t: ReturnType<typeof useTranslation>['t']
) => {
  const lines = [
    t('DAILY_PUZZLE.SHARE_TITLE', {
      number: puzzle.number,
      mode: t(`PUZZLE.MODE.${puzzle.mode}`)
    })
  ];
  const stars = starText(result.stars);
  if (puzzle.mode === 'damage') {
    lines.push(
      t('DAILY_PUZZLE.SHARE_DAMAGE', {
        stars,
        damage: result.damage ?? 0,
        bot: puzzle.bars?.bot ?? 0,
        real: puzzle.bars?.real ?? 0
      })
    );
  } else if (result.solved) {
    lines.push(
      t('DAILY_PUZZLE.SHARE_SOLVED', {
        stars,
        hints:
          result.hints === 0
            ? t('DAILY_PUZZLE.SHARE_NO_HINTS')
            : t('DAILY_PUZZLE.SHARE_HINTS', { count: result.hints }),
        tries:
          result.tries === 1
            ? t('DAILY_PUZZLE.SHARE_FIRST_TRY')
            : t('DAILY_PUZZLE.SHARE_TRIES', { count: result.tries })
      })
    );
  } else {
    lines.push(t('DAILY_PUZZLE.SHARE_FAILED', { stars }));
  }
  lines.push(`${window.location.origin}/puzzle`);
  return lines.join('\n');
};

const copyText = async (text: string) => {
  if (navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(text);
    return;
  }
  const area = document.createElement('textarea');
  area.value = text;
  area.setAttribute('readonly', '');
  area.style.position = 'fixed';
  area.style.opacity = '0';
  document.body.appendChild(area);
  area.select();
  document.execCommand('copy');
  document.body.removeChild(area);
};

const Goal = ({ puzzle }: { puzzle: DailyPuzzleInfo }) => {
  const { t } = useTranslation();
  return (
    <p className={styles.goal}>
      {t(`DAILY_PUZZLE.GOAL_${puzzle.mode.toUpperCase()}`, {
        life: puzzle.life
      })}
    </p>
  );
};

const DamageBars = ({
  puzzle,
  damage
}: {
  puzzle: DailyPuzzleInfo;
  damage?: number | null;
}) => {
  const { t } = useTranslation();
  if (!puzzle.bars) return null;
  const bars = [
    { key: 'BOT', value: puzzle.bars.bot },
    { key: 'REAL', value: puzzle.bars.real },
    { key: 'BEST', value: puzzle.bars.best }
  ];
  return (
    <ol className={styles.bars} aria-label={t('DAILY_PUZZLE.BARS_LABEL')}>
      {bars.map((bar, index) => (
        <li
          key={bar.key}
          className={
            damage !== undefined && damage !== null && damage >= bar.value
              ? `${styles.bar} ${styles.barReached}`
              : styles.bar
          }
        >
          <span className={styles.barStar} aria-hidden="true">
            {'★'.repeat(index + 1)}
          </span>
          <span className={styles.barLabel}>
            {t(`DAILY_PUZZLE.BAR_${bar.key}`)}
          </span>
          <span className={styles.barValue}>{bar.value}</span>
        </li>
      ))}
    </ol>
  );
};

const ResultPanel = ({
  data,
  result
}: {
  data: DailyPuzzleResponse;
  result: DailyPuzzleResult;
}) => {
  const { t } = useTranslation();
  const puzzle = data.puzzle as DailyPuzzleInfo;
  const [ratePuzzle, { isLoading }] = useRateDailyPuzzleMutation();

  const share = async () => {
    try {
      await copyText(shareText(puzzle, result, t));
      toast.success(t('DAILY_PUZZLE.SHARE_COPIED'));
    } catch {
      toast.error(t('DAILY_PUZZLE.SHARE_FAILED_COPY'));
    }
  };

  const rate = async (rating: -1 | 1) => {
    try {
      await ratePuzzle({
        rating: result.rating === rating ? 0 : rating
      }).unwrap();
    } catch {
      // Error will be shown via toast from RTK Query error handler
    }
  };

  const summary =
    puzzle.mode === 'damage'
      ? t('DAILY_PUZZLE.RESULT_DAMAGE', { damage: result.damage ?? 0 })
      : result.solved
      ? t('DAILY_PUZZLE.RESULT_SOLVED')
      : t('DAILY_PUZZLE.RESULT_FAILED');

  return (
    <section className={styles.panel} aria-labelledby="daily-puzzle-result">
      <div className={styles.resultHead}>
        <Stars stars={result.stars} />
        <div>
          <h2 id="daily-puzzle-result" className={styles.panelTitle}>
            {summary}
          </h2>
          <p className={styles.muted}>
            {t('DAILY_PUZZLE.RESULT_DETAIL', {
              hints: result.hints,
              tries: result.tries
            })}
          </p>
        </div>
      </div>
      {puzzle.mode === 'damage' && (
        <DamageBars puzzle={puzzle} damage={result.damage} />
      )}
      <div className={styles.actions}>
        <button type="button" className={styles.primaryButton} onClick={share}>
          {t('DAILY_PUZZLE.SHARE')}
        </button>
        <div
          className={styles.rating}
          role="group"
          aria-label={t('DAILY_PUZZLE.RATE_LABEL')}
        >
          <button
            type="button"
            className={styles.iconButton}
            aria-pressed={result.rating === 1}
            aria-label={t('DAILY_PUZZLE.RATE_UP')}
            title={t('DAILY_PUZZLE.RATE_UP')}
            disabled={isLoading}
            onClick={() => rate(1)}
          >
            <FaThumbsUp aria-hidden="true" />
          </button>
          <button
            type="button"
            className={styles.iconButton}
            aria-pressed={result.rating === -1}
            aria-label={t('DAILY_PUZZLE.RATE_DOWN')}
            title={t('DAILY_PUZZLE.RATE_DOWN')}
            disabled={isLoading}
            onClick={() => rate(-1)}
          >
            <FaThumbsDown aria-hidden="true" />
          </button>
        </div>
      </div>
    </section>
  );
};

const LessonPanel = ({ lesson }: { lesson: DailyPuzzleLesson }) => {
  const { t } = useTranslation();
  return (
    <section className={styles.panel} aria-labelledby="daily-puzzle-lesson">
      <h2 id="daily-puzzle-lesson" className={styles.panelTitle}>
        {lesson.theme
          ? t('DAILY_PUZZLE.LESSON_TITLE', {
              theme: t(`PUZZLE.THEME.${lesson.theme}`)
            })
          : t('DAILY_PUZZLE.LESSON_TITLE_PLAIN')}
      </h2>
      {lesson.trick && (
        <p className={styles.trick}>{parseTextToElements(lesson.trick)}</p>
      )}
      {lesson.solution.length > 0 && (
        <>
          <h3 className={styles.subTitle}>{t('DAILY_PUZZLE.SOLUTION')}</h3>
          <ol className={styles.steps}>
            {lesson.solution.map((step, index) => (
              <li key={index}>{describePuzzleStep(step, t)}</li>
            ))}
          </ol>
        </>
      )}
      {lesson.hints.length > 0 && (
        <>
          <h3 className={styles.subTitle}>{t('DAILY_PUZZLE.HINTS')}</h3>
          <ol className={styles.steps}>
            {lesson.hints.map((hint, index) => (
              <li key={index}>{parseTextToElements(hint)}</li>
            ))}
          </ol>
        </>
      )}
    </section>
  );
};

const Leaderboard = ({ data }: { data: DailyPuzzleResponse }) => {
  const { t } = useTranslation();
  if (!data.leaderboard || data.leaderboard.length === 0) return null;
  return (
    <section className={styles.panel} aria-labelledby="daily-puzzle-board">
      <h2 id="daily-puzzle-board" className={styles.panelTitle}>
        {t('DAILY_PUZZLE.LEADERBOARD')}
      </h2>
      <ol className={styles.board}>
        {data.leaderboard.map((entry, index) => (
          <li key={`${entry.name}-${index}`} className={styles.boardRow}>
            <span className={styles.boardRank}>{index + 1}</span>
            <span className={styles.boardName}>{entry.name}</span>
            <span className={styles.muted}>
              {t('DAILY_PUZZLE.BOARD_HINTS', { count: entry.hints })}
            </span>
            <span className={styles.boardDamage}>{entry.damage}</span>
          </li>
        ))}
      </ol>
    </section>
  );
};

const DailyPuzzle: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { data, isLoading, isError } = useGetDailyPuzzleQuery(undefined, {
    refetchOnMountOrArgChange: true
  });
  const [startDailyPuzzle, { isLoading: isStarting }] =
    useStartDailyPuzzleMutation();
  const countdown = useCountdown(data?.nextIn ?? 0);

  const start = async () => {
    try {
      const game = await startDailyPuzzle().unwrap();
      if (game.error) {
        toast.error(game.error);
        return;
      }
      navigate(playUrl(game.gameName, game.playerID, game.authKey));
    } catch {
      // Error will be shown via toast from RTK Query error handler
    }
  };

  const puzzle = data?.puzzle ?? null;
  const result = data?.result ?? null;
  const finished = result?.finished ?? false;

  return (
    <main className={styles.page}>
      <PageBanner
        title={t('DAILY_PUZZLE.TITLE')}
        subtitle={t('DAILY_PUZZLE.SUBTITLE')}
      />
      <AdRailLayout contentWidth={900}>
        <div className={styles.content}>
          {isLoading ? (
            <p className={styles.empty}>{t('DAILY_PUZZLE.LOADING')}</p>
          ) : isError || !data || data.error ? (
            <p className={styles.empty}>{t('DAILY_PUZZLE.LOAD_FAILED')}</p>
          ) : !puzzle ? (
            <p className={styles.empty}>{t('DAILY_PUZZLE.NONE_TODAY')}</p>
          ) : (
            <>
              <section
                className={styles.panel}
                aria-labelledby="daily-puzzle-title"
              >
                <div className={styles.panelHead}>
                  <h2 id="daily-puzzle-title" className={styles.panelTitle}>
                    {t('DAILY_PUZZLE.NUMBER', { number: puzzle.number })}
                  </h2>
                  <span className={styles.mode}>
                    {t(`PUZZLE.MODE.${puzzle.mode}`)}
                  </span>
                </div>
                <div className={styles.matchup}>
                  <HeroPortrait
                    hero={puzzle.hero}
                    name={puzzle.heroName}
                    label={t('DAILY_PUZZLE.YOU_PLAY')}
                  />
                  <span className={styles.versus}>
                    {t('DAILY_PUZZLE.VERSUS')}
                  </span>
                  <HeroPortrait
                    hero={puzzle.opponentHero}
                    name={puzzle.opponentHeroName}
                    label={t('DAILY_PUZZLE.AGAINST')}
                  />
                </div>
                <Goal puzzle={puzzle} />
                <ul className={styles.facts}>
                  {puzzle.difficulty && (
                    <li>
                      {t(
                        `DAILY_PUZZLE.DIFFICULTY_${puzzle.difficulty.toUpperCase()}`
                      )}
                    </li>
                  )}
                  <li>{getReadableFormatName(puzzle.format)}</li>
                  <li>
                    {t('DAILY_PUZZLE.HINTS_AVAILABLE', {
                      count: puzzle.hintsTotal
                    })}
                  </li>
                  {data.stats && data.stats.finished > 0 && (
                    <li>
                      {puzzle.mode === 'damage'
                        ? t('DAILY_PUZZLE.PLAYERS', {
                            count: data.stats.finished
                          })
                        : t('DAILY_PUZZLE.SOLVE_RATE', {
                            solved: data.stats.solved,
                            count: data.stats.finished
                          })}
                    </li>
                  )}
                </ul>
                {puzzle.mode === 'damage' && !finished && (
                  <DamageBars puzzle={puzzle} />
                )}
                <div className={styles.actions}>
                  {!data.loggedIn ? (
                    <Link className={styles.primaryButton} to="/user/login">
                      {t('DAILY_PUZZLE.LOG_IN')}
                    </Link>
                  ) : (
                    <button
                      type="button"
                      className={
                        finished ? styles.secondaryButton : styles.primaryButton
                      }
                      disabled={isStarting}
                      onClick={start}
                    >
                      {isStarting
                        ? t('DAILY_PUZZLE.STARTING')
                        : finished
                        ? t('DAILY_PUZZLE.PRACTICE')
                        : result
                        ? t('DAILY_PUZZLE.CONTINUE')
                        : t('DAILY_PUZZLE.PLAY')}
                    </button>
                  )}
                </div>
                <p className={styles.rules}>
                  {finished
                    ? t('DAILY_PUZZLE.RULES_PRACTICE')
                    : t('DAILY_PUZZLE.RULES')}
                </p>
              </section>
              {finished && result && (
                <ResultPanel data={data} result={result} />
              )}
              {finished && data.lesson && <LessonPanel lesson={data.lesson} />}
              {puzzle.mode === 'damage' && <Leaderboard data={data} />}
            </>
          )}
          {data && (
            <p className={styles.next}>
              {t('DAILY_PUZZLE.NEXT_IN', countdown)}
            </p>
          )}
        </div>
      </AdRailLayout>
    </main>
  );
};

export default DailyPuzzle;

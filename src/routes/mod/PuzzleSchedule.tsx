import React from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'react-hot-toast';
import {
  useGetPuzzleScheduleQuery,
  useSchedulePuzzleMutation
} from 'features/api/apiSlice';
import { PuzzleScheduleDay } from 'interface/API/ModPageAPI';
import tableStyles from './PromptStats.module.css';
import styles from './PuzzleCandidates.module.css';

const solveRate = (day: PuzzleScheduleDay) =>
  day.stats.finished === 0
    ? null
    : Math.round((100 * day.stats.solved) / day.stats.finished);

// Days with a daily puzzle, from two weeks back to the planned ones, with how players received them.
const PuzzleSchedule: React.FC = () => {
  const { t } = useTranslation();
  const { data, isError } = useGetPuzzleScheduleQuery();
  const [schedulePuzzle, { isLoading }] = useSchedulePuzzleMutation();

  const remove = async (date: string) => {
    try {
      const result = await schedulePuzzle({ action: 'remove', date }).unwrap();
      if (result.error) toast.error(result.error);
    } catch {
      // Error will be shown via toast from RTK Query error handler
    }
  };

  const today = data?.today ?? '';
  const upcoming = (data?.days ?? []).filter((day) => day.date >= today);
  const freeSoon = upcoming.length === 0 || upcoming[0].date !== today;

  return (
    <div className={styles.schedule}>
      <div className={tableStyles.header}>
        <div>
          <h2 className={tableStyles.title}>
            {t('MOD_PAGE.PUZZLES_SCHEDULE_TITLE')}
          </h2>
          <p className={tableStyles.description}>
            {t('MOD_PAGE.PUZZLES_SCHEDULE_DESCRIPTION')}
          </p>
        </div>
      </div>
      {data && freeSoon && (
        <p className={`${tableStyles.summary} ${styles.warning}`}>
          {t('MOD_PAGE.PUZZLES_SCHEDULE_NONE_TODAY')}
        </p>
      )}
      {isError || data?.error ? (
        <p className={tableStyles.empty}>
          {data?.error ?? t('MOD_PAGE.PUZZLES_SCHEDULE_LOAD_FAILED')}
        </p>
      ) : !data ? (
        <p className={tableStyles.empty}>{t('MOD_PAGE.LOADING')}</p>
      ) : data.days.length === 0 ? (
        <p className={tableStyles.empty}>
          {t('MOD_PAGE.PUZZLES_SCHEDULE_EMPTY')}
        </p>
      ) : (
        <div className={tableStyles.tableWrap}>
          <table className={tableStyles.table}>
            <thead>
              <tr>
                <th scope="col">{t('MOD_PAGE.PUZZLES_SCHEDULE_COL_DATE')}</th>
                <th scope="col">{t('MOD_PAGE.PUZZLES_SCHEDULE_COL_PUZZLE')}</th>
                <th scope="col">{t('MOD_PAGE.PUZZLES_SCHEDULE_COL_THEME')}</th>
                <th scope="col" className={tableStyles.numeric}>
                  {t('MOD_PAGE.PUZZLES_SCHEDULE_COL_PLAYERS')}
                </th>
                <th scope="col" className={tableStyles.numeric}>
                  {t('MOD_PAGE.PUZZLES_SCHEDULE_COL_SOLVED')}
                </th>
                <th scope="col" className={tableStyles.numeric}>
                  {t('MOD_PAGE.PUZZLES_SCHEDULE_COL_STARS')}
                </th>
                <th scope="col" className={tableStyles.numeric}>
                  {t('MOD_PAGE.PUZZLES_SCHEDULE_COL_RATING')}
                </th>
                <th scope="col">
                  <span className={styles.visuallyHidden}>
                    {t('MOD_PAGE.PUZZLES_SCHEDULE_REMOVE')}
                  </span>
                </th>
              </tr>
            </thead>
            <tbody>
              {data.days.map((day) => {
                const rate = solveRate(day);
                return (
                  <tr key={day.date}>
                    <td>
                      <span className={tableStyles.cardName}>{day.date}</span>
                      {day.date === today && (
                        <span className={tableStyles.muted}>
                          {' '}
                          {t('MOD_PAGE.PUZZLES_SCHEDULE_TODAY')}
                        </span>
                      )}
                    </td>
                    <td>
                      <div className={tableStyles.cardText}>
                        <span className={tableStyles.cardName}>
                          {t(`PUZZLE.MODE.${day.mode}`)} ·{' '}
                          {t('MOD_PAGE.PUZZLES_SCHEDULE_CANDIDATE', {
                            id: day.candidateId
                          })}
                        </span>
                        <span className={tableStyles.muted}>
                          {day.heroName}{' '}
                          {t('MOD_PAGE.PUZZLES_VERSUS', {
                            name: day.opponentHeroName
                          })}
                        </span>
                        {(day.interest !== null || day.auto) && (
                          <span className={tableStyles.muted}>
                            {[
                              day.interest !== null &&
                                t('MOD_PAGE.PUZZLES_SCHEDULE_INTEREST', {
                                  percent: day.interest
                                }),
                              day.auto && t('MOD_PAGE.PUZZLES_SCHEDULE_AUTO')
                            ]
                              .filter(Boolean)
                              .join(' · ')}
                          </span>
                        )}
                      </div>
                    </td>
                    <td>{day.theme ? t(`PUZZLE.THEME.${day.theme}`) : '-'}</td>
                    <td className={tableStyles.numeric}>{day.stats.players}</td>
                    <td className={tableStyles.numeric}>
                      {day.mode === 'damage'
                        ? day.stats.best ?? '-'
                        : rate === null
                        ? '-'
                        : `${rate}%`}
                    </td>
                    <td className={tableStyles.numeric}>
                      {day.stats.averageStars ?? '-'}
                    </td>
                    <td className={tableStyles.numeric}>
                      {t('MOD_PAGE.PUZZLES_SCHEDULE_RATING', {
                        ups: day.stats.ups,
                        downs: day.stats.downs
                      })}
                    </td>
                    <td>
                      {day.date >= today && (
                        <button
                          type="button"
                          className={styles.button}
                          disabled={isLoading}
                          onClick={() => remove(day.date)}
                        >
                          {t('MOD_PAGE.PUZZLES_SCHEDULE_REMOVE')}
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default PuzzleSchedule;

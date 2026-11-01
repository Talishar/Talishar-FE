import React, { useState } from 'react';
import classNames from 'classnames';
import { toast } from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import {
  useDeletePlayerReportMutation,
  useGetPlayerReportsQuery
} from 'features/api/apiSlice';
import {
  MODERATION_REASONS,
  MODERATION_REASON_LABEL_KEYS,
  PlayerReport
} from 'interface/API/ModerationAPI';
import tableStyles from './ModTable.module.css';
import styles from './BlockReports.module.css';
import { DAY_OPTIONS } from './BlockReports';
import useWarnPlayer from './useWarnPlayer';
import useBanPlayer from './useBanPlayer';
import { SortColumn, SortHeader, useTableSort } from './SortableTable';

type SortKey = 'date' | 'reported' | 'reporter' | 'reason' | 'game';

const SORT_COLUMNS: Record<SortKey, SortColumn<PlayerReport>> = {
  date: { value: (row) => row.createdAt },
  reported: { value: (row) => row.reportedName, ascendingFirst: true },
  reporter: { value: (row) => row.reporterName, ascendingFirst: true },
  reason: {
    value: (row) =>
      row.reason ? MODERATION_REASONS.indexOf(row.reason) : null,
    ascendingFirst: true
  },
  game: { value: (row) => Number(row.gameName) }
};

const NO_REPORTS: PlayerReport[] = [];

const PlayerReports: React.FC = () => {
  const { t } = useTranslation();
  const [days, setDays] = useState(30);
  const { data, isFetching, isError, refetch } = useGetPlayerReportsQuery({
    days
  });
  const { warn, isWarning } = useWarnPlayer();
  const { ban, isBanning } = useBanPlayer();
  const [expanded, setExpanded] = useState<Set<number>>(new Set());

  const toggleExpanded = (reportId: number) => {
    const next = new Set(expanded);
    if (next.has(reportId)) next.delete(reportId);
    else next.add(reportId);
    setExpanded(next);
  };
  const [deleteReport, { isLoading: isRemoving }] =
    useDeletePlayerReportMutation();

  const removeReport = async (report: PlayerReport) => {
    const confirmed = window.confirm(
      t('PLAYER_REPORTS.REMOVE_CONFIRM', {
        reportedName: report.reportedName,
        gameName: report.gameName
      })
    );
    if (!confirmed) return;
    try {
      await deleteReport({ reportId: report.reportId }).unwrap();
      toast.success(t('PLAYER_REPORTS.REMOVED'));
    } catch (err: any) {
      toast.error(err?.data?.error || t('PLAYER_REPORTS.REMOVE_FAILED'));
    }
  };

  const {
    sortedRows: reports,
    sort,
    toggleSort
  } = useTableSort(data?.reports ?? NO_REPORTS, SORT_COLUMNS);

  return (
    <section className={tableStyles.panel}>
      <div className={tableStyles.header}>
        <div>
          <h2 className={tableStyles.title}>{t('PLAYER_REPORTS.TITLE')}</h2>
          <p className={tableStyles.description}>
            {t('PLAYER_REPORTS.DESCRIPTION')}
          </p>
        </div>
      </div>

      <div className={tableStyles.controls}>
        <label className={tableStyles.toggle}>
          {t('BLOCK_REPORTS.PERIOD')}
          <select
            className={tableStyles.phaseSelect}
            value={days}
            onChange={(e) => setDays(Number(e.target.value))}
          >
            {DAY_OPTIONS.map((value) => (
              <option key={value} value={value}>
                {t('BLOCK_REPORTS.LAST_DAYS', { count: value })}
              </option>
            ))}
          </select>
        </label>
        <button
          className={styles.actionButton}
          onClick={() => refetch()}
          disabled={isFetching}
        >
          {t('GAME_LIST.REFRESH')}
        </button>
      </div>

      {isError ? (
        <p className={tableStyles.empty}>{t('PLAYER_REPORTS.LOAD_FAILED')}</p>
      ) : isFetching && !data ? (
        <p className={tableStyles.empty}>{t('PLAYER_REPORTS.LOADING')}</p>
      ) : reports.length === 0 ? (
        <p className={tableStyles.empty}>{t('PLAYER_REPORTS.EMPTY')}</p>
      ) : (
        <div className={tableStyles.tableWrap}>
          <table className={tableStyles.table}>
            <thead>
              <tr>
                <SortHeader id="date" sort={sort} onSort={toggleSort}>
                  {t('PLAYER_REPORTS.DATE')}
                </SortHeader>
                <SortHeader id="reported" sort={sort} onSort={toggleSort}>
                  {t('PLAYER_REPORTS.REPORTED')}
                </SortHeader>
                <SortHeader id="reporter" sort={sort} onSort={toggleSort}>
                  {t('PLAYER_REPORTS.REPORTER')}
                </SortHeader>
                <SortHeader id="reason" sort={sort} onSort={toggleSort}>
                  {t('PLAYER_REPORTS.REASON')}
                </SortHeader>
                <th>{t('PLAYER_REPORTS.NOTE')}</th>
                <SortHeader id="game" sort={sort} onSort={toggleSort}>
                  {t('PLAYER_REPORTS.GAME')}
                </SortHeader>
                <th>{t('BLOCK_REPORTS.ACTIONS')}</th>
              </tr>
            </thead>
            <tbody>
              {reports.map((report) => {
                const warned =
                  report.lastWarnedAt !== null &&
                  report.lastWarnedAt >= report.createdAt;
                const chat = report.chatLog ?? [];
                const reportedSeat = 3 - report.reporterPlayerID;
                return (
                  <React.Fragment key={report.reportId}>
                    <tr>
                      <td className={styles.nowrap}>
                        {report.createdAt.slice(0, 16)}
                      </td>
                      <td>
                        <span className={styles.username}>
                          {report.reportedName}
                        </span>
                        {report.reportCount > 1 && (
                          <span className={styles.bannedTag}>
                            {t('PLAYER_REPORTS.REPORT_COUNT', {
                              count: report.reportCount
                            })}
                          </span>
                        )}
                        {!report.reportedHasAccount && (
                          <span className={styles.bannedTag}>
                            {t('PLAYER_REPORTS.GUEST')}
                          </span>
                        )}
                        {report.reportedIsBanned && (
                          <span className={styles.bannedTag}>
                            {t('BLOCK_REPORTS.BANNED')}
                          </span>
                        )}
                      </td>
                      <td>
                        {report.reporterName ?? (
                          <span className={tableStyles.muted}>
                            {t('PLAYER_REPORTS.GUEST')}
                          </span>
                        )}
                      </td>
                      <td>
                        {report.reason ? (
                          <span className={styles.reasonTag}>
                            {t(MODERATION_REASON_LABEL_KEYS[report.reason])}
                          </span>
                        ) : (
                          <span className={tableStyles.muted}>-</span>
                        )}
                      </td>
                      <td className={styles.noteCell}>
                        {report.note ?? (
                          <span className={tableStyles.muted}>-</span>
                        )}
                      </td>
                      <td className={styles.nowrap}>{report.gameName}</td>
                      <td>
                        <div className={styles.actions}>
                          <button
                            className={styles.actionButton}
                            onClick={() => toggleExpanded(report.reportId)}
                            disabled={chat.length === 0}
                            aria-expanded={expanded.has(report.reportId)}
                          >
                            {t('PLAYER_REPORTS.CHAT', { count: chat.length })}
                          </button>
                          <button
                            className={styles.actionButton}
                            onClick={() => warn(report.reportedName)}
                            disabled={
                              isWarning ||
                              warned ||
                              !report.reportedHasAccount ||
                              report.reportedIsBanned
                            }
                            title={
                              warned
                                ? t('BLOCK_REPORTS.WARNED_ON', {
                                    date: report.lastWarnedAt?.slice(0, 16)
                                  })
                                : undefined
                            }
                          >
                            {warned
                              ? t('BLOCK_REPORTS.WARNED')
                              : t('BLOCK_REPORTS.WARN')}
                          </button>
                          <button
                            className={styles.actionButton}
                            onClick={() => ban(report.reportedName)}
                            disabled={
                              isBanning ||
                              !report.reportedHasAccount ||
                              report.reportedIsBanned
                            }
                          >
                            {t('BLOCK_REPORTS.BAN')}
                          </button>
                          <button
                            className={styles.actionButton}
                            onClick={() => removeReport(report)}
                            disabled={isRemoving}
                          >
                            {t('PLAYER_REPORTS.REMOVE')}
                          </button>
                        </div>
                      </td>
                    </tr>
                    {expanded.has(report.reportId) && (
                      <tr>
                        <td colSpan={7}>
                          <ul className={styles.chatLog}>
                            {chat.map((line, ix) => (
                              <li
                                key={ix}
                                className={classNames(styles.chatLine, {
                                  [styles.chatLineReported]:
                                    line.playerID === reportedSeat
                                })}
                              >
                                <span className={styles.chatName}>
                                  {line.name}:
                                </span>{' '}
                                {line.text}
                              </li>
                            ))}
                          </ul>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
};

export default PlayerReports;

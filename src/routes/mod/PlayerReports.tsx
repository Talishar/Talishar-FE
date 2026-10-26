import React, { useState } from 'react';
import { toast } from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import {
  useDeletePlayerReportMutation,
  useGetPlayerReportsQuery
} from 'features/api/apiSlice';
import {
  MODERATION_REASON_LABEL_KEYS,
  PlayerReport
} from 'interface/API/ModerationAPI';
import tableStyles from './ModTable.module.css';
import styles from './BlockReports.module.css';
import { DAY_OPTIONS } from './BlockReports';
import useWarnPlayer from './useWarnPlayer';

const PlayerReports: React.FC = () => {
  const { t } = useTranslation();
  const [days, setDays] = useState(30);
  const { data, isFetching, isError, refetch } = useGetPlayerReportsQuery({
    days
  });
  const { warn, isWarning } = useWarnPlayer();
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

  const reports = data?.reports ?? [];

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
                <th>{t('PLAYER_REPORTS.DATE')}</th>
                <th>{t('PLAYER_REPORTS.REPORTED')}</th>
                <th>{t('PLAYER_REPORTS.REPORTER')}</th>
                <th>{t('PLAYER_REPORTS.REASON')}</th>
                <th>{t('PLAYER_REPORTS.NOTE')}</th>
                <th>{t('PLAYER_REPORTS.GAME')}</th>
                <th>{t('BLOCK_REPORTS.ACTIONS')}</th>
              </tr>
            </thead>
            <tbody>
              {reports.map((report) => (
                <tr key={report.reportId}>
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
                        onClick={() => warn(report.reportedName)}
                        disabled={
                          isWarning ||
                          !report.reportedHasAccount ||
                          report.reportedIsBanned
                        }
                      >
                        {t('BLOCK_REPORTS.WARN')}
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
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
};

export default PlayerReports;

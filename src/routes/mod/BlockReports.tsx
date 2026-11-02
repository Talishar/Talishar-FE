import React, { useState } from 'react';
import classNames from 'classnames';
import { useTranslation } from 'react-i18next';
import { useGetBlockReportsQuery } from 'features/api/apiSlice';
import {
  MODERATION_REASONS,
  MODERATION_REASON_LABEL_KEYS,
  ModerationReason
} from 'interface/API/ModerationAPI';
import { BlockReportPlayer } from 'interface/API/BlockedUsersAPI.php';
import tableStyles from './ModTable.module.css';
import styles from './BlockReports.module.css';
import useWarnPlayer from './useWarnPlayer';
import useBanPlayer from './useBanPlayer';
import { SortColumn, SortHeader, useTableSort } from './SortableTable';

export const DAY_OPTIONS = [30, 90, 365];
const MIN_BLOCK_OPTIONS = [1, 2, 3, 5, 10];

type SortKey = 'player' | 'blocks' | ModerationReason | 'lastBlocked';

const SORT_COLUMNS: Record<SortKey, SortColumn<BlockReportPlayer>> = {
  player: { value: (row) => row.displayName, ascendingFirst: true },
  blocks: { value: (row) => row.blockCount },
  rude: { value: (row) => row.reasonCounts.rude },
  insulting: { value: (row) => row.reasonCounts.insulting },
  unsporting: { value: (row) => row.reasonCounts.unsporting },
  other: { value: (row) => row.reasonCounts.other },
  lastBlocked: { value: (row) => row.lastBlockedAt }
};

const NO_PLAYERS: BlockReportPlayer[] = [];

const BlockReports: React.FC = () => {
  const { t } = useTranslation();
  const [days, setDays] = useState(90);
  const [minBlocks, setMinBlocks] = useState(2);
  const [expanded, setExpanded] = useState<Set<number>>(new Set());

  const { data, isFetching, isError, refetch } = useGetBlockReportsQuery({
    days,
    minBlocks
  });
  const { warn, isWarning } = useWarnPlayer();
  const { ban, isBanning } = useBanPlayer();

  const {
    sortedRows: players,
    sort,
    toggleSort
  } = useTableSort(data?.players ?? NO_PLAYERS, SORT_COLUMNS);

  const toggleExpanded = (usersId: number) => {
    const next = new Set(expanded);
    if (next.has(usersId)) next.delete(usersId);
    else next.add(usersId);
    setExpanded(next);
  };

  return (
    <section className={tableStyles.panel}>
      <div className={tableStyles.header}>
        <div>
          <h2 className={tableStyles.title}>{t('BLOCK_REPORTS.TITLE')}</h2>
          <p className={tableStyles.description}>
            {t('BLOCK_REPORTS.DESCRIPTION')}
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
        <label className={tableStyles.toggle}>
          {t('BLOCK_REPORTS.MIN_BLOCKS')}
          <select
            className={tableStyles.phaseSelect}
            value={minBlocks}
            onChange={(e) => setMinBlocks(Number(e.target.value))}
          >
            {MIN_BLOCK_OPTIONS.map((value) => (
              <option key={value} value={value}>
                {value}
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
        <p className={tableStyles.empty}>{t('BLOCK_REPORTS.LOAD_FAILED')}</p>
      ) : isFetching && !data ? (
        <p className={tableStyles.empty}>{t('BLOCK_REPORTS.LOADING')}</p>
      ) : players.length === 0 ? (
        <p className={tableStyles.empty}>{t('BLOCK_REPORTS.EMPTY')}</p>
      ) : (
        <div className={tableStyles.tableWrap}>
          <table className={tableStyles.table}>
            <thead>
              <tr>
                <SortHeader id="player" sort={sort} onSort={toggleSort}>
                  {t('BLOCK_REPORTS.PLAYER')}
                </SortHeader>
                <SortHeader id="blocks" sort={sort} onSort={toggleSort} numeric>
                  {t('BLOCK_REPORTS.BLOCKS')}
                </SortHeader>
                {MODERATION_REASONS.map((reason) => (
                  <SortHeader
                    key={reason}
                    id={reason}
                    sort={sort}
                    onSort={toggleSort}
                    numeric
                  >
                    {t(MODERATION_REASON_LABEL_KEYS[reason])}
                  </SortHeader>
                ))}
                <SortHeader id="lastBlocked" sort={sort} onSort={toggleSort}>
                  {t('BLOCK_REPORTS.LAST_BLOCKED')}
                </SortHeader>
                <th>{t('BLOCK_REPORTS.ACTIONS')}</th>
              </tr>
            </thead>
            <tbody>
              {players.map((player) => {
                const warned =
                  player.lastWarnedAt !== null &&
                  player.lastWarnedAt >= player.lastBlockedAt;
                return (
                  <React.Fragment key={player.usersId}>
                    <tr>
                      <td>
                        <span className={styles.username}>
                          {player.displayName}
                        </span>
                        {player.displayName !== player.username && (
                          <span className={tableStyles.muted}>
                            {' '}
                            ({player.username})
                          </span>
                        )}
                        {player.isBanned && (
                          <span className={styles.bannedTag}>
                            {t('BLOCK_REPORTS.BANNED')}
                          </span>
                        )}
                      </td>
                      <td className={tableStyles.numeric}>
                        {player.blockCount}
                      </td>
                      {MODERATION_REASONS.map((reason) => (
                        <td
                          key={reason}
                          className={classNames(tableStyles.numeric, {
                            [tableStyles.muted]:
                              player.reasonCounts[reason] === 0
                          })}
                        >
                          {player.reasonCounts[reason]}
                        </td>
                      ))}
                      <td className={styles.nowrap}>
                        {player.lastBlockedAt.slice(0, 10)}
                      </td>
                      <td className={styles.actions}>
                        <button
                          className={styles.actionButton}
                          onClick={() => toggleExpanded(player.usersId)}
                          disabled={player.notes.length === 0}
                          aria-expanded={expanded.has(player.usersId)}
                        >
                          {t('BLOCK_REPORTS.NOTES', {
                            count: player.notes.length
                          })}
                        </button>
                        <button
                          className={styles.actionButton}
                          onClick={() => warn(player.username)}
                          disabled={isWarning || warned || player.isBanned}
                          title={
                            warned
                              ? t('BLOCK_REPORTS.WARNED_ON', {
                                  date: player.lastWarnedAt?.slice(0, 16)
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
                          onClick={() => ban(player.username)}
                          disabled={isBanning || player.isBanned}
                        >
                          {t('BLOCK_REPORTS.BAN')}
                        </button>
                      </td>
                    </tr>
                    {expanded.has(player.usersId) && (
                      <tr>
                        <td colSpan={4 + MODERATION_REASONS.length}>
                          <ul className={styles.notes}>
                            {player.notes.map((note, ix) => (
                              <li key={ix} className={styles.note}>
                                <div className={styles.noteMeta}>
                                  <span>{note.createdAt.slice(0, 10)}</span>
                                  <span>
                                    {t('BLOCK_REPORTS.BY', {
                                      username: note.blockedBy
                                    })}
                                  </span>
                                  {note.reason && (
                                    <span className={styles.reasonTag}>
                                      {t(
                                        MODERATION_REASON_LABEL_KEYS[
                                          note.reason
                                        ]
                                      )}
                                    </span>
                                  )}
                                </div>
                                {note.note && (
                                  <div className={styles.noteText}>
                                    {note.note}
                                  </div>
                                )}
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

export default BlockReports;

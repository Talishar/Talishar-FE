import React, { useMemo, useState } from 'react';
import { toast } from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import {
  useBanIPDirectMutation,
  useDismissBanEvaderMutation,
  useGetModPageDataQuery
} from 'features/api/apiSlice';
import { LinkedAccount } from 'interface/API/ModPageAPI';
import tableStyles from './ModTable.module.css';
import styles from './BlockReports.module.css';
import banStyles from './BanLists.module.css';
import useBanPlayer from './useBanPlayer';
import { SortColumn, SortHeader, useTableSort } from './SortableTable';

const PAGE_SIZE = 50;
const BANNED_IP_LINK = 'banned IP';

interface EvaderIP {
  ip: string;
  linkedTo: string[];
  bannedIP: boolean;
  lastSeen: string | null;
}

interface Evader {
  username: string;
  ips: EvaderIP[];
  linkedTo: string[];
  bannedIP: boolean;
  lastSeen: string | null;
}

interface BannedPlayerRow {
  name: string;
  ips: string[];
}

type EvaderSortKey = 'account' | 'ips' | 'lastSeen';

const EVADER_SORT: Record<EvaderSortKey, SortColumn<Evader>> = {
  account: { value: (row) => row.username, ascendingFirst: true },
  ips: { value: (row) => row.ips.length },
  lastSeen: { value: (row) => row.lastSeen }
};

type PlayerSortKey = 'player' | 'ips';

const PLAYER_SORT: Record<PlayerSortKey, SortColumn<BannedPlayerRow>> = {
  player: { value: (row) => row.name, ascendingFirst: true },
  ips: { value: (row) => row.ips.length }
};

const laterOf = (a: string | null, b: string | null) =>
  a === null ? b : b === null ? a : a > b ? a : b;

const groupEvaders = (links: LinkedAccount[]): Evader[] => {
  const byUser = new Map<string, Map<string, EvaderIP>>();
  for (const link of links) {
    let ips = byUser.get(link.username);
    if (!ips) {
      ips = new Map();
      byUser.set(link.username, ips);
    }
    let entry = ips.get(link.ip);
    if (!entry) {
      entry = { ip: link.ip, linkedTo: [], bannedIP: false, lastSeen: null };
      ips.set(link.ip, entry);
    }
    if (link.linkedTo === BANNED_IP_LINK) entry.bannedIP = true;
    else if (!entry.linkedTo.includes(link.linkedTo))
      entry.linkedTo.push(link.linkedTo);
    entry.lastSeen = laterOf(entry.lastSeen, link.lastSeen ?? null);
  }
  const evaders: Evader[] = [];
  byUser.forEach((ipMap, username) => {
    const ips = [...ipMap.values()].sort((a, b) =>
      (b.lastSeen ?? '').localeCompare(a.lastSeen ?? '')
    );
    const linkedTo = [...new Set(ips.flatMap((ip) => ip.linkedTo))];
    evaders.push({
      username,
      ips,
      linkedTo,
      bannedIP: ips.some((ip) => ip.bannedIP),
      lastSeen: ips.reduce<string | null>(
        (latest, ip) => laterOf(latest, ip.lastSeen),
        null
      )
    });
  });
  return evaders.sort((a, b) =>
    (b.lastSeen ?? '').localeCompare(a.lastSeen ?? '')
  );
};

const matches = (query: string, ...values: string[]) =>
  values.some((value) => value.toLowerCase().includes(query));

const NO_EVADERS: Evader[] = [];
const NO_PLAYERS: BannedPlayerRow[] = [];

const ShowMore: React.FC<{ remaining: number; onClick: () => void }> = ({
  remaining,
  onClick
}) => {
  const { t } = useTranslation();
  if (remaining <= 0) return null;
  return (
    <button
      type="button"
      className={`${styles.actionButton} ${banStyles.showMore}`}
      onClick={onClick}
    >
      {t('BAN_LISTS.SHOW_MORE', { count: Math.min(remaining, PAGE_SIZE) })}
    </button>
  );
};

const BanLists: React.FC = () => {
  const { t } = useTranslation();
  const { data, isLoading, isFetching, refetch } =
    useGetModPageDataQuery(undefined);
  const { ban, isBanning } = useBanPlayer();
  const [banIPDirect, { isLoading: isBanningIP }] = useBanIPDirectMutation();
  const [dismissEvader, { isLoading: isDismissing }] =
    useDismissBanEvaderMutation();

  const [evaderQuery, setEvaderQuery] = useState('');
  const [evaderLimit, setEvaderLimit] = useState(PAGE_SIZE);
  const [expandedEvaders, setExpandedEvaders] = useState<Set<string>>(
    new Set()
  );
  const [playerQuery, setPlayerQuery] = useState('');
  const [playerLimit, setPlayerLimit] = useState(PAGE_SIZE);
  const [expandedPlayers, setExpandedPlayers] = useState<Set<string>>(
    new Set()
  );
  const [ipQuery, setIpQuery] = useState('');
  const [ipLimit, setIpLimit] = useState(PAGE_SIZE * 2);

  const bannedIPSet = useMemo(
    () => new Set(data?.bannedIPs ?? []),
    [data?.bannedIPs]
  );
  const ipAccountCounts = data?.ipAccountCounts ?? {};

  const allEvaders = useMemo(
    () =>
      data?.linkedAccounts ? groupEvaders(data.linkedAccounts) : NO_EVADERS,
    [data?.linkedAccounts]
  );
  const filteredEvaders = useMemo(() => {
    const query = evaderQuery.trim().toLowerCase();
    if (!query) return allEvaders;
    return allEvaders.filter((row) =>
      matches(query, row.username, ...row.linkedTo, ...row.ips.map((i) => i.ip))
    );
  }, [allEvaders, evaderQuery]);
  const {
    sortedRows: evaders,
    sort: evaderSort,
    toggleSort: toggleEvaderSort
  } = useTableSort(filteredEvaders, EVADER_SORT);

  const allPlayers = useMemo(() => {
    if (!data?.bannedPlayers) return NO_PLAYERS;
    return data.bannedPlayers.map((name) => ({
      name,
      ips: data.bannedPlayerIPs?.[name.toLowerCase()] ?? []
    }));
  }, [data?.bannedPlayers, data?.bannedPlayerIPs]);
  const filteredPlayers = useMemo(() => {
    const query = playerQuery.trim().toLowerCase();
    if (!query) return allPlayers;
    return allPlayers.filter((row) => matches(query, row.name, ...row.ips));
  }, [allPlayers, playerQuery]);
  const {
    sortedRows: players,
    sort: playerSort,
    toggleSort: togglePlayerSort
  } = useTableSort(filteredPlayers, PLAYER_SORT);

  const bannedIPs = useMemo(() => {
    const all = data?.bannedIPs ?? [];
    const query = ipQuery.trim().toLowerCase();
    return query ? all.filter((ip) => ip.toLowerCase().includes(query)) : all;
  }, [data?.bannedIPs, ipQuery]);

  const toggleKey = (current: Set<string>, key: string) => {
    const next = new Set(current);
    if (next.has(key)) next.delete(key);
    else next.add(key);
    return next;
  };

  const banIP = async (ip: string) => {
    if (!window.confirm(t('BAN_LISTS.BAN_IP_CONFIRM', { ip }))) return;
    try {
      const result = await banIPDirect({ directIPToBan: ip }).unwrap();
      if (result?.status === 'error') throw { data: { error: result.message } };
      toast.success(t('BAN_LISTS.IP_BANNED', { ip }));
    } catch (err: any) {
      toast.error(err?.data?.error || t('BAN_LISTS.IP_BAN_FAILED'));
    }
  };

  const dismiss = async (evader: Evader) => {
    try {
      const result = await dismissEvader({
        username: evader.username,
        ips: evader.ips.map((ip) => ip.ip)
      }).unwrap();
      if (result?.error) throw { data: { error: result.error } };
      toast.success(t('BAN_LISTS.DISMISSED', { username: evader.username }));
    } catch (err: any) {
      toast.error(err?.data?.error || t('BAN_LISTS.DISMISS_FAILED'));
    }
  };

  const refreshButton = (
    <button
      type="button"
      className={styles.actionButton}
      onClick={() => refetch()}
      disabled={isFetching}
    >
      {t('GAME_LIST.REFRESH')}
    </button>
  );

  const renderIPChip = (ip: string) => (
    <span key={ip} className={banStyles.ipChip}>
      <span className={banStyles.ip}>{ip}</span>
      {bannedIPSet.has(ip) ? (
        <span className={banStyles.chipNote}>{t('BLOCK_REPORTS.BANNED')}</span>
      ) : (
        <button
          type="button"
          className={banStyles.chipButton}
          onClick={() => banIP(ip)}
          disabled={isBanningIP}
        >
          {t('BAN_LISTS.BAN_IP')}
        </button>
      )}
    </span>
  );

  if (isLoading) {
    return <p className={tableStyles.empty}>{t('MOD_PAGE.LOADING')}</p>;
  }

  return (
    <div className={styles.tabStack}>
      <section className={tableStyles.panel}>
        <div className={tableStyles.header}>
          <div>
            <h2 className={tableStyles.title}>
              {t('BAN_LISTS.EVADERS_TITLE')}
            </h2>
            <p className={tableStyles.description}>
              {t('BAN_LISTS.EVADERS_DESCRIPTION')}
            </p>
          </div>
        </div>

        <div className={tableStyles.controls}>
          <input
            type="search"
            className={tableStyles.search}
            placeholder={t('BAN_LISTS.SEARCH_PLACEHOLDER')}
            value={evaderQuery}
            onChange={(e) => {
              setEvaderQuery(e.target.value);
              setEvaderLimit(PAGE_SIZE);
            }}
          />
          {refreshButton}
          <span className={tableStyles.summary}>
            {t('BAN_LISTS.ACCOUNT_COUNT', { count: evaders.length })}
          </span>
        </div>

        {allEvaders.length === 0 ? (
          <p className={tableStyles.empty}>{t('BAN_LISTS.EVADERS_EMPTY')}</p>
        ) : evaders.length === 0 ? (
          <p className={tableStyles.empty}>{t('BAN_LISTS.NO_MATCH')}</p>
        ) : (
          <>
            <div className={tableStyles.tableWrap}>
              <table className={tableStyles.table}>
                <thead>
                  <tr>
                    <SortHeader
                      id="account"
                      sort={evaderSort}
                      onSort={toggleEvaderSort}
                    >
                      {t('BAN_LISTS.ACCOUNT')}
                    </SortHeader>
                    <th>{t('BAN_LISTS.LINKED_TO')}</th>
                    <SortHeader
                      id="ips"
                      sort={evaderSort}
                      onSort={toggleEvaderSort}
                      numeric
                    >
                      {t('BAN_LISTS.SHARED_IPS')}
                    </SortHeader>
                    <SortHeader
                      id="lastSeen"
                      sort={evaderSort}
                      onSort={toggleEvaderSort}
                    >
                      {t('BAN_LISTS.LAST_SEEN')}
                    </SortHeader>
                    <th>{t('BLOCK_REPORTS.ACTIONS')}</th>
                  </tr>
                </thead>
                <tbody>
                  {evaders.slice(0, evaderLimit).map((evader) => {
                    const open = expandedEvaders.has(evader.username);
                    return (
                      <React.Fragment key={evader.username}>
                        <tr>
                          <td>
                            <span className={styles.username}>
                              {evader.username}
                            </span>
                          </td>
                          <td>
                            <div className={styles.reasonList}>
                              {evader.linkedTo.map((name) => (
                                <span key={name} className={styles.reasonTag}>
                                  {name}
                                </span>
                              ))}
                              {evader.bannedIP && (
                                <span className={styles.reasonTag}>
                                  {t('BAN_LISTS.BANNED_IP_TAG')}
                                </span>
                              )}
                            </div>
                          </td>
                          <td className={tableStyles.numeric}>
                            {evader.ips.length}
                          </td>
                          <td className={styles.nowrap}>
                            {evader.lastSeen?.slice(0, 10) ?? (
                              <span className={tableStyles.muted}>-</span>
                            )}
                          </td>
                          <td>
                            <div className={styles.actions}>
                              <button
                                type="button"
                                className={styles.actionButton}
                                onClick={() =>
                                  setExpandedEvaders((current) =>
                                    toggleKey(current, evader.username)
                                  )
                                }
                                aria-expanded={open}
                              >
                                {t('BAN_LISTS.IPS', {
                                  count: evader.ips.length
                                })}
                              </button>
                              <button
                                type="button"
                                className={styles.actionButton}
                                onClick={() => ban(evader.username)}
                                disabled={isBanning}
                              >
                                {t('BLOCK_REPORTS.BAN')}
                              </button>
                              <button
                                type="button"
                                className={styles.actionButton}
                                onClick={() => dismiss(evader)}
                                disabled={isDismissing}
                                title={t('BAN_LISTS.DISMISS_HINT')}
                              >
                                {t('BAN_LISTS.DISMISS')}
                              </button>
                            </div>
                          </td>
                        </tr>
                        {open && (
                          <tr>
                            <td colSpan={5}>
                              <div className={banStyles.ipRows}>
                                {evader.ips.map((entry) => {
                                  const accounts = ipAccountCounts[entry.ip];
                                  return (
                                    <div
                                      key={entry.ip}
                                      className={banStyles.ipRow}
                                    >
                                      <span className={banStyles.ip}>
                                        {entry.ip}
                                      </span>
                                      <span className={banStyles.ipLinks}>
                                        {[
                                          ...entry.linkedTo,
                                          ...(entry.bannedIP
                                            ? [t('BAN_LISTS.BANNED_IP_TAG')]
                                            : [])
                                        ].join(', ')}
                                      </span>
                                      <span className={tableStyles.muted}>
                                        {accounts
                                          ? t('BAN_LISTS.ACCOUNTS_ON_IP', {
                                              count: accounts
                                            })
                                          : ''}
                                      </span>
                                      <span className={tableStyles.muted}>
                                        {entry.lastSeen?.slice(0, 10) ?? ''}
                                      </span>
                                      {bannedIPSet.has(entry.ip) ? (
                                        <span className={banStyles.chipNote}>
                                          {t('BLOCK_REPORTS.BANNED')}
                                        </span>
                                      ) : (
                                        <button
                                          type="button"
                                          className={styles.actionButton}
                                          onClick={() => banIP(entry.ip)}
                                          disabled={isBanningIP}
                                        >
                                          {t('BAN_LISTS.BAN_IP')}
                                        </button>
                                      )}
                                    </div>
                                  );
                                })}
                              </div>
                            </td>
                          </tr>
                        )}
                      </React.Fragment>
                    );
                  })}
                </tbody>
              </table>
            </div>
            <ShowMore
              remaining={evaders.length - evaderLimit}
              onClick={() => setEvaderLimit(evaderLimit + PAGE_SIZE)}
            />
          </>
        )}
      </section>

      <section className={tableStyles.panel}>
        <div className={tableStyles.header}>
          <div>
            <h2 className={tableStyles.title}>
              {t('BAN_LISTS.PLAYERS_TITLE')}
            </h2>
            <p className={tableStyles.description}>
              {t('BAN_LISTS.PLAYERS_DESCRIPTION')}
            </p>
          </div>
        </div>

        <div className={tableStyles.controls}>
          <input
            type="search"
            className={tableStyles.search}
            placeholder={t('BAN_LISTS.SEARCH_PLACEHOLDER')}
            value={playerQuery}
            onChange={(e) => {
              setPlayerQuery(e.target.value);
              setPlayerLimit(PAGE_SIZE);
            }}
          />
          <span className={tableStyles.summary}>
            {t('BAN_LISTS.PLAYER_COUNT', { count: players.length })}
          </span>
        </div>

        {allPlayers.length === 0 ? (
          <p className={tableStyles.empty}>{t('MOD_PAGE.NO_BANNED_PLAYERS')}</p>
        ) : players.length === 0 ? (
          <p className={tableStyles.empty}>{t('BAN_LISTS.NO_MATCH')}</p>
        ) : (
          <>
            <div className={tableStyles.tableWrap}>
              <table className={`${tableStyles.table} ${banStyles.narrow}`}>
                <thead>
                  <tr>
                    <SortHeader
                      id="player"
                      sort={playerSort}
                      onSort={togglePlayerSort}
                    >
                      {t('BAN_LISTS.PLAYER')}
                    </SortHeader>
                    <SortHeader
                      id="ips"
                      sort={playerSort}
                      onSort={togglePlayerSort}
                      numeric
                    >
                      {t('BAN_LISTS.KNOWN_IPS')}
                    </SortHeader>
                    <th>{t('BLOCK_REPORTS.ACTIONS')}</th>
                  </tr>
                </thead>
                <tbody>
                  {players.slice(0, playerLimit).map((player) => {
                    const open = expandedPlayers.has(player.name);
                    return (
                      <React.Fragment key={player.name}>
                        <tr>
                          <td>
                            <span className={styles.username}>
                              {player.name}
                            </span>
                          </td>
                          <td className={tableStyles.numeric}>
                            {player.ips.length || (
                              <span className={tableStyles.muted}>0</span>
                            )}
                          </td>
                          <td>
                            <button
                              type="button"
                              className={styles.actionButton}
                              onClick={() =>
                                setExpandedPlayers((current) =>
                                  toggleKey(current, player.name)
                                )
                              }
                              disabled={player.ips.length === 0}
                              aria-expanded={open}
                            >
                              {t('BAN_LISTS.IPS', {
                                count: player.ips.length
                              })}
                            </button>
                          </td>
                        </tr>
                        {open && (
                          <tr>
                            <td colSpan={3}>
                              <div className={banStyles.ipGrid}>
                                {player.ips.map(renderIPChip)}
                              </div>
                            </td>
                          </tr>
                        )}
                      </React.Fragment>
                    );
                  })}
                </tbody>
              </table>
            </div>
            <ShowMore
              remaining={players.length - playerLimit}
              onClick={() => setPlayerLimit(playerLimit + PAGE_SIZE)}
            />
          </>
        )}
      </section>

      <section className={tableStyles.panel}>
        <div className={tableStyles.header}>
          <div>
            <h2 className={tableStyles.title}>{t('BAN_LISTS.IPS_TITLE')}</h2>
            <p className={tableStyles.description}>
              {t('BAN_LISTS.IPS_DESCRIPTION')}
            </p>
          </div>
        </div>

        <div className={tableStyles.controls}>
          <input
            type="search"
            className={tableStyles.search}
            placeholder={t('BAN_LISTS.SEARCH_IP_PLACEHOLDER')}
            value={ipQuery}
            onChange={(e) => {
              setIpQuery(e.target.value);
              setIpLimit(PAGE_SIZE * 2);
            }}
          />
          <span className={tableStyles.summary}>
            {t('BAN_LISTS.IP_COUNT', { count: bannedIPs.length })}
          </span>
        </div>

        {(data?.bannedIPs ?? []).length === 0 ? (
          <p className={tableStyles.empty}>{t('MOD_PAGE.NO_BANNED_IPS')}</p>
        ) : bannedIPs.length === 0 ? (
          <p className={tableStyles.empty}>{t('BAN_LISTS.NO_MATCH')}</p>
        ) : (
          <>
            <div className={`${banStyles.ipGrid} ${banStyles.ipGridBoxed}`}>
              {bannedIPs.slice(0, ipLimit).map((ip) => (
                <span key={ip} className={banStyles.ipChip}>
                  <span className={banStyles.ip}>{ip}</span>
                </span>
              ))}
            </div>
            <ShowMore
              remaining={bannedIPs.length - ipLimit}
              onClick={() => setIpLimit(ipLimit + PAGE_SIZE * 2)}
            />
          </>
        )}
      </section>
    </div>
  );
};

export default BanLists;

import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  useGetGameListQuery,
  useGetFriendsListQuery
} from 'features/api/apiSlice';
import styles from './GameList.module.scss';
import InProgressGame from '../inProgressGame';
import Filter from '../filter';
import { GAME_FORMAT, GAME_FORMAT_NUMBER, normalizeFormat } from 'appConstants';
import OpenGame from '../openGame/OpenGame';
import { useAutoAnimate } from '@formkit/auto-animate/react';
import useAuth from 'hooks/useAuth';
import { useBlockedUsers } from 'hooks/useBlockedUsers';
import { Link } from 'react-router-dom';
import { useCookies } from 'react-cookie';
import { HEROES_OF_RATHE } from '../filter/constants';
import GameFilter from './GameFilter';
import FriendBadge from './FriendBadge';
import { useTranslation } from 'react-i18next';
import { Friend } from 'interface/API/FriendListAPI.php';

export interface IOpenGame {
  p1Hero?: string;
  format: string;
  formatName?: string;
  description?: string;
  gameName: number;
  gameCreator?: string; // Username of the game creator
  visibility?: string; // "0" = private, "1" = public, "2" = friends-only
}

export interface IGameInProgress {
  p1Hero?: string;
  p2Hero?: string;
  format: string;
  gameName: number;
  secondsSinceLastUpdate?: number;
  gameCreator?: string; // Username of the game creator (p1)
  p2Username?: string; // Username of player 2
  visibility?: string; // "0" = private, "1" = public, "2" = friends-only
  spectatorCount?: number; // Logged-in spectators seen in the last 45 seconds
}

export interface GameListResponse {
  gamesInProgress: IGameInProgress[];
  openGames: IOpenGame[];
  canSeeQueue?: boolean;
  gameInProgressCount?: number;
  LastGameName?: number;
  LastPlayerID?: number;
  LastAuthKey?: string;
  featuredGame?: string; // Auto-selected match pinned above the in-progress list
  featuredMasteryLevel?: number; // Lower of the two players' hero mastery levels
  featuredSpectators?: number;
}

const USE_DEV_FAKE_GAMES = false; // Set to true to enable fake games for testing
const DEV_HERO_LIST = [
  'WTR001',
  'ARC001',
  'MON001',
  'UPR001',
  'ELE001',
  'ROS001',
  'HNT001',
  'SUP001'
];
const DEV_FORMAT_LIST = [
  GAME_FORMAT.COMPETITIVE_CC,
  GAME_FORMAT.BLITZ,
  GAME_FORMAT.COMMONER,
  GAME_FORMAT.DRAFT,
  GAME_FORMAT.SEALED,
  GAME_FORMAT.GAGE
];
const DEV_FAKE_FEATURED: IGameInProgress = {
  gameName: 90999,
  p1Hero: 'UPR001',
  p2Hero: 'ROS001',
  format: GAME_FORMAT.COMPETITIVE_CC,
  secondsSinceLastUpdate: 12,
  visibility: '1',
  spectatorCount: 14
};

// Fake games stand in for the API entirely, so the list can be worked on
// without a backend or a logged-in session. Index.tsx reads this to render the
// list at all when logged out.
export const DEV_FAKE_MODE = import.meta.env.DEV && USE_DEV_FAKE_GAMES;

const GameList = () => {
  const [cookies, setCookie, removeCookie] = useCookies([
    'experimental',
    'gameFilters',
    'gameFriendsFilter'
  ]);

  // Initial stuff to allow the lang to change
  const { t } = useTranslation();
  const { isLoggedIn, isLoading: isAuthLoading } = useAuth();
  const devFakeMode = DEV_FAKE_MODE;
  const canAccessPublicGames = devFakeMode || (!isAuthLoading && isLoggedIn);

  const {
    data: apiData,
    isLoading: isQueryLoading,
    error: queryError,
    refetch,
    isFetching
  } = useGetGameListQuery(undefined, {
    skip: !canAccessPublicGames
  });
  // In fake mode the list renders from local data, so a missing or failing
  // backend must not blank it out.
  const isLoading = devFakeMode ? false : isQueryLoading;
  const error = devFakeMode ? undefined : queryError;

  const DEV_FAKE_OPEN: IOpenGame[] = useMemo(
    () =>
      devFakeMode
        ? Array.from({ length: 20 }, (_, i) => ({
            gameName: 80000 + i,
            p1Hero: DEV_HERO_LIST[i % DEV_HERO_LIST.length],
            format: DEV_FORMAT_LIST[i % DEV_FORMAT_LIST.length],
            formatName: DEV_FORMAT_LIST[i % DEV_FORMAT_LIST.length],
            description: `Dev test game ${i + 1}`,
            visibility: '1'
          }))
        : [],
    [devFakeMode]
  );
  const DEV_FAKE_IN_PROGRESS: IGameInProgress[] = useMemo(
    () =>
      devFakeMode
        ? [
            DEV_FAKE_FEATURED,
            ...Array.from({ length: 20 }, (_, i) => ({
              gameName: 90000 + i,
              p1Hero: DEV_HERO_LIST[i % DEV_HERO_LIST.length],
              p2Hero: DEV_HERO_LIST[(i + 5) % DEV_HERO_LIST.length],
              format: DEV_FORMAT_LIST[i % DEV_FORMAT_LIST.length],
              secondsSinceLastUpdate: Math.floor(Math.random() * 600),
              visibility: '1',
              // Most games draw nobody; a couple pick up a watcher or two.
              spectatorCount: i % 5 === 0 ? (i % 3) + 1 : 0
            }))
          ]
        : [],
    [devFakeMode]
  );

  const devFakeResponse: GameListResponse = useMemo(
    () => ({
      openGames: DEV_FAKE_OPEN,
      gamesInProgress: DEV_FAKE_IN_PROGRESS,
      gameInProgressCount: DEV_FAKE_IN_PROGRESS.length,
      canSeeQueue: true,
      featuredGame: String(DEV_FAKE_FEATURED.gameName),
      featuredMasteryLevel: 8,
      featuredSpectators: DEV_FAKE_FEATURED.spectatorCount
    }),
    [DEV_FAKE_IN_PROGRESS, DEV_FAKE_OPEN]
  );

  const data: typeof apiData = useMemo(
    () =>
      apiData
        ? {
            ...apiData,
            openGames: [...DEV_FAKE_OPEN, ...(apiData.openGames ?? [])],
            gamesInProgress: [
              ...DEV_FAKE_IN_PROGRESS,
              ...(apiData.gamesInProgress ?? [])
            ],
            // The tab badge normally reports the server's own count, which knows
            // nothing about the fakes.
            gameInProgressCount:
              (apiData.gameInProgressCount ?? 0) + DEV_FAKE_IN_PROGRESS.length,
            ...(devFakeMode
              ? {
                  featuredGame: devFakeResponse.featuredGame,
                  featuredMasteryLevel: devFakeResponse.featuredMasteryLevel,
                  featuredSpectators: devFakeResponse.featuredSpectators
                }
              : {})
          }
        : devFakeMode
        ? devFakeResponse
        : apiData,
    [DEV_FAKE_IN_PROGRESS, DEV_FAKE_OPEN, apiData, devFakeMode, devFakeResponse]
  );
  const { data: friendsData } = useGetFriendsListQuery(undefined, {
    skip: !isLoggedIn
  });
  const { blockedUsers } = useBlockedUsers();

  useEffect(() => {
    if (friendsData?.friends) {
      try {
        const friendsList = friendsData.friends.map((f: Friend) => f.username);
        sessionStorage.setItem('friendsList', JSON.stringify(friendsList));
      } catch (e) {
        console.error('Failed to sync friendsList to sessionStorage:', e);
      }
    }
  }, [friendsData]);

  const [heroFilter, setHeroFilter] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState<'open' | 'inProgress'>('open');

  useEffect(() => {
    scrollableContentRef.current?.scrollTo({ top: 0 });
  }, [activeTab]);
  const [isRateLimited, setIsRateLimited] = useState(false);
  const lastRefetchTime = useRef<number>(0);
  const scrollableContentRef = useRef<HTMLDivElement>(null);
  const REFETCH_RATE_LIMIT_MS = 3000;

  useEffect(() => {
    if (!canAccessPublicGames) return;

    const id = setInterval(() => {
      if (!document.hidden) refetch();
    }, 10000);
    return () => clearInterval(id);
  }, [canAccessPublicGames, refetch]);

  // Initialize filters from cookies
  const defaultFormats = new Set([
    GAME_FORMAT.BLITZ,
    GAME_FORMAT.COMPETITIVE_BLITZ,
    GAME_FORMAT.CLASSIC_CONSTRUCTED,
    GAME_FORMAT.COMPETITIVE_CC,
    GAME_FORMAT.LLCC,
    GAME_FORMAT.COMPETITIVE_LL,
    GAME_FORMAT.SAGE,
    GAME_FORMAT.COMPETITIVE_SAGE,
    GAME_FORMAT.OPEN_CC,
    GAME_FORMAT.OPEN_BLITZ,
    GAME_FORMAT.OPEN_SAGE,
    GAME_FORMAT.OPEN_LL_CC,
    GAME_FORMAT.COMMONER,
    GAME_FORMAT.CLASH,
    GAME_FORMAT.SEALED,
    GAME_FORMAT.DRAFT,
    GAME_FORMAT.PRECON,
    GAME_FORMAT.OPEN,
    GAME_FORMAT.GAGE,
    // Also include numeric format values
    GAME_FORMAT_NUMBER.BLITZ,
    GAME_FORMAT_NUMBER.COMPETITIVE_BLITZ,
    GAME_FORMAT_NUMBER.CLASSIC_CONSTRUCTED,
    GAME_FORMAT_NUMBER.COMPETITIVE_CC,
    GAME_FORMAT_NUMBER.LLCC,
    GAME_FORMAT_NUMBER.COMPETITIVE_LL,
    GAME_FORMAT_NUMBER.SAGE,
    GAME_FORMAT_NUMBER.COMPETITIVE_SAGE,
    GAME_FORMAT_NUMBER.OPEN_CC,
    GAME_FORMAT_NUMBER.OPEN_BLITZ,
    GAME_FORMAT_NUMBER.OPEN_SAGE,
    GAME_FORMAT_NUMBER.OPEN_LL_CC,
    GAME_FORMAT_NUMBER.COMMONER,
    GAME_FORMAT_NUMBER.CLASH,
    GAME_FORMAT_NUMBER.SEALED,
    GAME_FORMAT_NUMBER.DRAFT,
    GAME_FORMAT_NUMBER.PRECON,
    GAME_FORMAT_NUMBER.OPEN,
    GAME_FORMAT_NUMBER.GAGE
  ]);

  const [inProgressFormatFilters, setInProgressFormatFilters] = useState<
    Set<string>
  >(() => {
    // Try to load from cookies first, then fallback to localStorage
    if (cookies.gameFilters) {
      try {
        const parsed = JSON.parse(cookies.gameFilters);
        const filters = new Set<string>(parsed);
        if (filters.size === 0) {
          return defaultFormats;
        }
        return filters;
      } catch {
        // Cookie parsing failed, try localStorage
      }
    }
    // Fallback to localStorage
    try {
      const stored = localStorage.getItem('gameFilters');
      if (stored) {
        const parsed = JSON.parse(stored);
        const filters = new Set<string>(parsed);
        if (filters.size === 0) {
          return defaultFormats;
        }
        return filters;
      }
    } catch {
      // localStorage parsing failed
    }
    return defaultFormats;
  });

  const [includeFriendsGames] = useState(() => {
    // Try to load from cookies first, then fallback to localStorage
    if (cookies.gameFriendsFilter !== undefined) {
      return cookies.gameFriendsFilter === 'true';
    }
    // Fallback to localStorage
    try {
      const stored = localStorage.getItem('gameFriendsFilter');
      if (stored) {
        return JSON.parse(stored);
      }
    } catch {
      // localStorage parsing failed
    }
    return true;
  });

  const [parent] = useAutoAnimate();

  useEffect(() => {
    try {
      const storedFilters = localStorage.getItem('gameFilters');
      if (storedFilters) {
        const parsed = JSON.parse(storedFilters);
        if (Array.isArray(parsed) && parsed.length === 0) {
          localStorage.removeItem('gameFilters');
        }
      }
    } catch {
      // Ignore parsing errors
    }
  }, []);

  // Save format filters to cookies and localStorage when they change
  useEffect(() => {
    setCookie(
      'gameFilters',
      JSON.stringify(Array.from(inProgressFormatFilters)),
      {
        path: '/',
        maxAge: 86400 * 30 // 30 days
      }
    );
    // Also save to localStorage as backup
    try {
      localStorage.setItem(
        'gameFilters',
        JSON.stringify(Array.from(inProgressFormatFilters))
      );
    } catch {
      console.error('Failed to save filters to localStorage');
    }
  }, [inProgressFormatFilters, setCookie]);

  // Save friends games filter to cookies and localStorage when it changes
  useEffect(() => {
    setCookie('gameFriendsFilter', String(includeFriendsGames), {
      path: '/',
      maxAge: 86400 * 30 // 30 days
    });
    // Also save to localStorage as backup
    try {
      localStorage.setItem(
        'gameFriendsFilter',
        JSON.stringify(includeFriendsGames)
      );
    } catch {
      console.error('Failed to save friends filter to localStorage');
    }
  }, [includeFriendsGames, setCookie]);

  const handleInProgressFilterChange = (formats: Set<string>) => {
    setInProgressFormatFilters(formats);
  };

  const { heroCountsOpen, heroCountsInProgress } = useMemo(() => {
    const open = new Map<string, number>();
    data?.openGames?.forEach((game: IOpenGame) => {
      if (game.p1Hero) {
        open.set(game.p1Hero, (open.get(game.p1Hero) ?? 0) + 1);
      }
    });

    const inProgress = new Map<string, number>();
    data?.gamesInProgress?.forEach((game: IGameInProgress) => {
      if (game.p1Hero) {
        inProgress.set(game.p1Hero, (inProgress.get(game.p1Hero) ?? 0) + 1);
      }
      if (game.p2Hero) {
        inProgress.set(game.p2Hero, (inProgress.get(game.p2Hero) ?? 0) + 1);
      }
    });

    return {
      heroCountsOpen: open,
      heroCountsInProgress: inProgress
    };
  }, [data?.gamesInProgress, data?.openGames]);

  const heroCounts =
    activeTab === 'open' ? heroCountsOpen : heroCountsInProgress;

  // Create a set of friend usernames for quick lookup
  const friendUsernames = useMemo(
    () => new Set(friendsData?.friends?.map((f: Friend) => f.username) || []),
    [friendsData?.friends]
  );
  const blockedUsernames = useMemo(() => new Set(blockedUsers), [blockedUsers]);
  const selectedHeroes = useMemo(() => new Set(heroFilter), [heroFilter]);

  // Filter games
  const filteredGamesInProgress = useMemo(
    () =>
      data?.gamesInProgress?.filter((game: IGameInProgress) => {
        // Hide games created by blocked users
        if (game.gameCreator && blockedUsernames.has(game.gameCreator)) {
          return false;
        }

        // Hide friends-only private games (visibility "2") - these can't be spectated
        if (game.visibility === '2') {
          return false;
        }

        // Apply hero filter
        if (selectedHeroes.size > 0) {
          if (
            !selectedHeroes.has(game.p1Hero ?? '') &&
            !selectedHeroes.has(game.p2Hero ?? '')
          ) {
            return false;
          }
        }

        // Apply format filter
        if (!inProgressFormatFilters.has(game.format)) {
          return false;
        }

        return true;
      }) ?? [],
    [
      blockedUsernames,
      data?.gamesInProgress,
      inProgressFormatFilters,
      selectedHeroes
    ]
  );

  // Separate friend games from other games

  const sortedInProgressGames = useMemo(
    () =>
      [...filteredGamesInProgress].sort((a, b) => {
        const fmtA = normalizeFormat(a.format) ?? a.format;
        const fmtB = normalizeFormat(b.format) ?? b.format;
        const cmp = fmtA.localeCompare(fmtB);
        if (cmp !== 0) return cmp;
        return b.gameName - a.gameName; // newest first within same format
      }),
    [filteredGamesInProgress]
  );
  const displayInProgressGames = sortedInProgressGames;

  const { featuredGame, unfeaturedInProgressGames } = useMemo(() => {
    const featured = data?.featuredGame
      ? displayInProgressGames.find(
          (game) => String(game.gameName) === String(data.featuredGame)
        )
      : undefined;

    return {
      featuredGame: featured,
      unfeaturedInProgressGames: featured
        ? displayInProgressGames.filter((game) => game !== featured)
        : displayInProgressGames
    };
  }, [data?.featuredGame, displayInProgressGames]);

  const { friendGamesInProgress, otherGamesInProgress } = useMemo(() => {
    const friendGames: IGameInProgress[] = [];
    const otherGames: IGameInProgress[] = [];

    unfeaturedInProgressGames.forEach((game) => {
      const isFriendGame = Boolean(
        (game.gameCreator && friendUsernames.has(game.gameCreator)) ||
          (game.p2Username && friendUsernames.has(game.p2Username))
      );
      if (includeFriendsGames && isFriendGame) {
        friendGames.push(game);
      } else if (!isFriendGame) {
        otherGames.push(game);
      }
    });

    return {
      friendGamesInProgress: friendGames,
      otherGamesInProgress: otherGames
    };
  }, [friendUsernames, includeFriendsGames, unfeaturedInProgressGames]);

  const sortedOpenGames = useMemo(
    () =>
      data?.openGames
        ?.filter((game: IOpenGame) => {
          // Hide games created by blocked users
          if (game.gameCreator && blockedUsernames.has(game.gameCreator)) {
            return false;
          }

          // Hide friends-only games from non-friends
          if (
            game.visibility === '2' &&
            !(game.gameCreator && friendUsernames.has(game.gameCreator))
          ) {
            return false;
          }

          // Apply hero and format filters
          return (
            (selectedHeroes.size === 0 ||
              selectedHeroes.has(game.p1Hero ?? '')) &&
            inProgressFormatFilters.has(game.format)
          );
        })
        .sort((a: IOpenGame, b: IOpenGame) =>
          a.format.localeCompare(b.format)
        ) ?? [],
    [
      blockedUsernames,
      data?.openGames,
      friendUsernames,
      inProgressFormatFilters,
      selectedHeroes
    ]
  );

  const handleReloadClick = () => {
    const now = Date.now();
    if (now - lastRefetchTime.current >= REFETCH_RATE_LIMIT_MS) {
      lastRefetchTime.current = now;
      setIsRateLimited(true);
      refetch();
      setTimeout(() => setIsRateLimited(false), REFETCH_RATE_LIMIT_MS);
    }
  };

  const otherFormats = [
    GAME_FORMAT.BLITZ,
    GAME_FORMAT.COMPETITIVE_BLITZ,
    GAME_FORMAT.OPEN_BLITZ,
    GAME_FORMAT.OPEN_LL_CC,
    GAME_FORMAT.COMMONER,
    GAME_FORMAT.CLASH,
    GAME_FORMAT.SEALED,
    GAME_FORMAT.DRAFT,
    GAME_FORMAT.PRECON,
    GAME_FORMAT.OPEN
  ];

  // Create mapping from string formats to numeric formats
  const formatNumberMapping = {
    [GAME_FORMAT.BLITZ]: GAME_FORMAT_NUMBER.BLITZ,
    [GAME_FORMAT.COMPETITIVE_BLITZ]: GAME_FORMAT_NUMBER.COMPETITIVE_BLITZ,
    [GAME_FORMAT.CLASSIC_CONSTRUCTED]: GAME_FORMAT_NUMBER.CLASSIC_CONSTRUCTED,
    [GAME_FORMAT.COMPETITIVE_CC]: GAME_FORMAT_NUMBER.COMPETITIVE_CC,
    [GAME_FORMAT.LLCC]: GAME_FORMAT_NUMBER.LLCC,
    [GAME_FORMAT.COMPETITIVE_LL]: GAME_FORMAT_NUMBER.COMPETITIVE_LL,
    [GAME_FORMAT.SAGE]: GAME_FORMAT_NUMBER.SAGE,
    [GAME_FORMAT.COMPETITIVE_SAGE]: GAME_FORMAT_NUMBER.COMPETITIVE_SAGE,
    [GAME_FORMAT.OPEN_CC]: GAME_FORMAT_NUMBER.OPEN_CC,
    [GAME_FORMAT.OPEN_BLITZ]: GAME_FORMAT_NUMBER.OPEN_BLITZ,
    [GAME_FORMAT.OPEN_SAGE]: GAME_FORMAT_NUMBER.OPEN_SAGE,
    [GAME_FORMAT.OPEN_LL_CC]: GAME_FORMAT_NUMBER.OPEN_LL_CC,
    [GAME_FORMAT.COMMONER]: GAME_FORMAT_NUMBER.COMMONER,
    [GAME_FORMAT.CLASH]: GAME_FORMAT_NUMBER.CLASH,
    [GAME_FORMAT.SEALED]: GAME_FORMAT_NUMBER.SEALED,
    [GAME_FORMAT.DRAFT]: GAME_FORMAT_NUMBER.DRAFT,
    [GAME_FORMAT.PRECON]: GAME_FORMAT_NUMBER.PRECON,
    [GAME_FORMAT.OPEN]: GAME_FORMAT_NUMBER.OPEN,
    [GAME_FORMAT.GAGE]: GAME_FORMAT_NUMBER.GAGE
  };

  const formatLabelMap: Record<string, string> = {
    [GAME_FORMAT.BLITZ]: t('GAME_LIST.FORMATS.BLITZ'),
    [GAME_FORMAT.COMPETITIVE_BLITZ]: t('GAME_LIST.FORMATS.COMPETITIVE_BLITZ'),
    [GAME_FORMAT.CLASSIC_CONSTRUCTED]: t('GAME_LIST.FORMATS.CC'),
    [GAME_FORMAT.COMPETITIVE_CC]: t('GAME_LIST.FORMATS.COMPETITIVE_CC'),
    [GAME_FORMAT.LLCC]: t('GAME_LIST.FORMATS.LL'),
    [GAME_FORMAT.COMPETITIVE_LL]: t('GAME_LIST.FORMATS.COMPETITIVE_LL'),
    [GAME_FORMAT.SAGE]: t('GAME_LIST.FORMATS.SAGE'),
    [GAME_FORMAT.COMPETITIVE_SAGE]: t('GAME_LIST.FORMATS.COMPETITIVE_SAGE'),
    [GAME_FORMAT.OPEN_SAGE]: t('GAME_LIST.FORMATS.FUTURE_SAGE'),
    [GAME_FORMAT.OPEN_CC]: t('GAME_LIST.FORMATS.FUTURE_CC'),
    [GAME_FORMAT.GAGE]: t('GAME_LIST.FORMATS.GAGE'),
    [GAME_FORMAT_NUMBER.BLITZ]: t('GAME_LIST.FORMATS.BLITZ'),
    [GAME_FORMAT_NUMBER.COMPETITIVE_BLITZ]: t(
      'GAME_LIST.FORMATS.COMPETITIVE_BLITZ'
    ),
    [GAME_FORMAT_NUMBER.CLASSIC_CONSTRUCTED]: t('GAME_LIST.FORMATS.CC'),
    [GAME_FORMAT_NUMBER.COMPETITIVE_CC]: t('GAME_LIST.FORMATS.COMPETITIVE_CC'),
    [GAME_FORMAT_NUMBER.LLCC]: t('GAME_LIST.FORMATS.LL'),
    [GAME_FORMAT_NUMBER.COMPETITIVE_LL]: t('GAME_LIST.FORMATS.COMPETITIVE_LL'),
    [GAME_FORMAT_NUMBER.SAGE]: t('GAME_LIST.FORMATS.SAGE'),
    [GAME_FORMAT_NUMBER.COMPETITIVE_SAGE]: t(
      'GAME_LIST.FORMATS.COMPETITIVE_SAGE'
    ),
    [GAME_FORMAT_NUMBER.OPEN_SAGE]: t('GAME_LIST.FORMATS.FUTURE_SAGE'),
    [GAME_FORMAT_NUMBER.OPEN_CC]: t('GAME_LIST.FORMATS.FUTURE_CC'),
    [GAME_FORMAT_NUMBER.GAGE]: t('GAME_LIST.FORMATS.GAGE')
  };

  const getFormatLabel = (format: string) =>
    formatLabelMap[format] || t('GAME_LIST.FORMATS.OTHER');

  const displayOpenGames = sortedOpenGames;

  // Count friend games in each tab for the badge indicator
  const friendOpenGamesCount = useMemo(
    () =>
      sortedOpenGames.reduce(
        (count, game: IOpenGame) =>
          count +
          Number(
            Boolean(game.gameCreator && friendUsernames.has(game.gameCreator))
          ),
        0
      ),
    [friendUsernames, sortedOpenGames]
  );

  const friendInProgressCount = useMemo(
    () =>
      filteredGamesInProgress.reduce(
        (count, game: IGameInProgress) =>
          count +
          Number(
            Boolean(
              (game.gameCreator && friendUsernames.has(game.gameCreator)) ||
                (game.p2Username && friendUsernames.has(game.p2Username))
            )
          ),
        0
      ),
    [filteredGamesInProgress, friendUsernames]
  );

  return (
    <article
      className={`${styles.gameList}${
        !isLoggedIn ? ` ${styles.gameListLoggedOut}` : ''
      }`}
    >
      {/* Sticky header - always visible, never scrolls */}
      <div className={styles.stickyHeader}>
        {cookies.experimental && (
          <button
            onClick={(e) => {
              e.preventDefault();
              removeCookie('experimental');
            }}
          >
            {t('GAME_LIST.DISABLE_EXPERIMENTAL')}
          </button>
        )}
        <div className={styles.titleDiv}>
          <h3 className={styles.title}>
            {t('GAME_LIST.OPEN_GAMES', 'Open Games')}
          </h3>
          {canAccessPublicGames && (
            <button
              onClick={handleReloadClick}
              className={styles.reloadButton}
              disabled={isFetching || isRateLimited}
              title={t('GAME_LIST.MANUAL_REFRESH')}
            >
              {t('GAME_LIST.REFRESH')}
              <span
                className={`${styles.refreshIcon}${
                  isFetching || isRateLimited ? ` ${styles.spinning}` : ''
                }`}
              >
                ↻
              </span>
            </button>
          )}
        </div>
        {canAccessPublicGames && isLoading ? (
          <div role="status" aria-live="polite" aria-busy="true">
            {t('GAME_LIST.LOADING')}
          </div>
        ) : null}
        {canAccessPublicGames && error ? (
          <div>
            <h2>{t('GAME_LIST.LOAD_ERROR_TITLE')}</h2>
            <p>{t('GAME_LIST.LOAD_ERROR_DESCRIPTION')}</p>
            <p>{JSON.stringify(error)}</p>
          </div>
        ) : null}
        {!isAuthLoading && !isLoggedIn && (
          <div className={styles.loginNotice}>
            <span className={styles.loginNoticeIcon} aria-hidden="true">
              {t('OPTIONS_MENU.LOCK_ICON')}
            </span>
            <div className={styles.loginNoticeContent}>
              <strong className={styles.loginNoticeTitle}>
                {t('GAME_LIST.LOGIN_REQUIRED_TITLE')}
              </strong>
              <p>{t('GAME_LIST.PLEASE_LOGIN')}</p>
              <Link to="/user/login" className={styles.loginButton}>
                {t('GAME_LIST.LOGIN_BUTTON')}
              </Link>
              <p className={styles.privateGameNotice}>
                {t('GAME_LIST.PRIVATE_GAMES_AVAILABLE')}
              </p>
            </div>
          </div>
        )}
        {!isLoading && !error && canAccessPublicGames && (
          <>
            <div className={styles.tabs}>
              <button
                className={`${styles.tab} ${
                  activeTab === 'open' ? styles.tabActive : ''
                }`}
                onClick={() => {
                  setActiveTab('open');
                }}
              >
                {t('GAME_LIST.LOOKING_FOR_OPPONENT', 'Looking for opponent')}
                <span
                  className={`${styles.tabBadge} ${
                    activeTab === 'open' ? styles.tabBadgeActive : ''
                  }`}
                >
                  {sortedOpenGames.length}
                </span>
                {friendOpenGamesCount > 0 && (
                  <FriendBadge
                    isFriendsGame
                    size="small"
                    tooltip={`${friendOpenGamesCount} friend${
                      friendOpenGamesCount > 1 ? 's' : ''
                    } looking for opponent`}
                  />
                )}
              </button>
              <button
                className={`${styles.tab} ${
                  activeTab === 'inProgress' ? styles.tabActive : ''
                }`}
                onClick={() => {
                  setActiveTab('inProgress');
                }}
              >
                {t('GAME_LIST.IN_PROGRESS_TAB', 'In progress')}
                <span
                  className={`${styles.tabBadge} ${
                    activeTab === 'inProgress' ? styles.tabBadgeActive : ''
                  }`}
                >
                  {data?.gameInProgressCount ?? 0}
                </span>
                {friendInProgressCount > 0 && (
                  <FriendBadge
                    isFriendsGame
                    size="small"
                    tooltip={`${friendInProgressCount} friend${
                      friendInProgressCount > 1 ? 's' : ''
                    } playing`}
                  />
                )}
              </button>
            </div>

            <div className={styles.filterRow}>
              <div className={styles.filterHeroWrapper}>
                <Filter
                  setHeroFilter={setHeroFilter}
                  heroOptions={HEROES_OF_RATHE}
                  heroCounts={heroCounts}
                />
              </div>
              <div className={styles.filterFormatWrapper}>
                <GameFilter
                  selectedFormats={inProgressFormatFilters}
                  onFilterChange={handleInProgressFilterChange}
                  formatOptions={[
                    {
                      label: t('GAME_LIST.FORMATS.CC'),
                      value: GAME_FORMAT.CLASSIC_CONSTRUCTED
                    },
                    {
                      label: t('GAME_LIST.FORMATS.COMPETITIVE_CC'),
                      value: GAME_FORMAT.COMPETITIVE_CC
                    },
                    {
                      label: t('GAME_LIST.FORMATS.LL'),
                      value: GAME_FORMAT.LLCC
                    },
                    {
                      label: t('GAME_LIST.FORMATS.COMPETITIVE_LL'),
                      value: GAME_FORMAT.COMPETITIVE_LL
                    },
                    {
                      label: t('GAME_LIST.FORMATS.SAGE'),
                      value: GAME_FORMAT.SAGE
                    },
                    {
                      label: t('GAME_LIST.FORMATS.COMPETITIVE_SAGE'),
                      value: GAME_FORMAT.COMPETITIVE_SAGE
                    },
                    {
                      label: t('GAME_LIST.FORMATS.FUTURE_SAGE'),
                      value: GAME_FORMAT.OPEN_SAGE
                    },
                    {
                      label: t('GAME_LIST.FORMATS.FUTURE_CC'),
                      value: GAME_FORMAT.OPEN_CC
                    },
                    {
                      label: t('GAME_LIST.FORMATS.GAGE'),
                      value: GAME_FORMAT.GAGE
                    },
                    {
                      label: t('GAME_LIST.FORMATS.OTHER'),
                      value: 'otherFormats',
                      isGroup: true,
                      groupValues: otherFormats
                    }
                  ]}
                  includeFriendsGames={includeFriendsGames}
                  formatNumberMapping={formatNumberMapping}
                />
              </div>
            </div>
          </>
        )}
      </div>

      {/* Scrollable game list content */}
      {!isLoading && !error && canAccessPublicGames && (
        <div className={styles.scrollableContent} ref={scrollableContentRef}>
          {activeTab === 'open' ? (
            <>
              {displayOpenGames.map((entry: IOpenGame, ix: number) => {
                const isFriendsGame = !!(
                  entry.gameCreator && friendUsernames.has(entry.gameCreator)
                );
                return (
                  <OpenGame
                    entry={entry}
                    ix={ix}
                    isOther={otherFormats.includes(entry.format)}
                    key={entry.gameName}
                    isFriendsGame={isFriendsGame}
                    formatLabel={getFormatLabel(entry.format)}
                  />
                );
              })}
            </>
          ) : (
            <div data-testid="games-in-progress" ref={parent}>
              {featuredGame && (
                <div className={styles.featuredSection}>
                  <div className={styles.featuredHeading}>
                    {t('GAME_LIST.FEATURED_MATCH', 'Featured match')}
                  </div>
                  <InProgressGame
                    entry={featuredGame}
                    isFeatured
                    masteryLevel={data?.featuredMasteryLevel}
                    isFriendsGame={
                      !!(
                        (featuredGame.gameCreator &&
                          friendUsernames.has(featuredGame.gameCreator)) ||
                        (featuredGame.p2Username &&
                          friendUsernames.has(featuredGame.p2Username))
                      )
                    }
                    formatLabel={getFormatLabel(featuredGame.format)}
                  />
                </div>
              )}
              {[...friendGamesInProgress, ...otherGamesInProgress].map(
                (entry) => {
                  const isFriendsGame = !!(
                    (entry.gameCreator &&
                      friendUsernames.has(entry.gameCreator)) ||
                    (entry.p2Username && friendUsernames.has(entry.p2Username))
                  );
                  const friendName =
                    entry.gameCreator && friendUsernames.has(entry.gameCreator)
                      ? entry.gameCreator
                      : entry.p2Username &&
                        friendUsernames.has(entry.p2Username)
                      ? entry.p2Username
                      : undefined;
                  return (
                    <InProgressGame
                      entry={entry}
                      key={entry.gameName}
                      isFriendsGame={isFriendsGame}
                      friendName={friendName}
                      formatLabel={getFormatLabel(entry.format)}
                    />
                  );
                }
              )}
            </div>
          )}
        </div>
      )}
    </article>
  );
};

export default GameList;

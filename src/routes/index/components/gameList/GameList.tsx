import { useState, useEffect, useRef } from 'react';
import {
  useGetGameListQuery,
  useGetFriendsListQuery
} from 'features/api/apiSlice';
import styles from './GameList.module.scss';
import InProgressGame from '../inProgressGame';
import Filter from '../filter';
import { GAME_FORMAT, GAME_FORMAT_NUMBER, normalizeFormat } from 'appConstants';
import FormatList from '../formatList';
import OpenGame from '../openGame/OpenGame';
import { useAutoAnimate } from '@formkit/auto-animate/react';
import useAuth from 'hooks/useAuth';
import { useBlockedUsers } from 'hooks/useBlockedUsers';
import { Link, useNavigate } from 'react-router-dom';
import { useCookies } from 'react-cookie';
import { useAppDispatch } from 'app/Hooks';
import { HEROES_OF_RATHE } from '../filter/constants';
import GameFilter from './GameFilter';
import FriendBadge from './FriendBadge';
import { useTranslation, Trans } from 'react-i18next';

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
}

export interface IInProgressGameList {
  gameList: IGameInProgress[];
  name: string;
  isFriendsSection?: boolean;
  friendUsernames?: Set<string>;
}

export interface GameListResponse {
  gamesInProgress: IGameInProgress[];
  openGames: IOpenGame[];
  canSeeQueue?: boolean;
  gameInProgressCount?: number;
  LastGameName?: number;
  LastPlayerID?: number;
  LastAuthKey?: string;
}

const GameList = () => {
  const [cookies, setCookie, removeCookie] = useCookies([
    'experimental',
    'gameFilters',
    'gameFriendsFilter'
  ]);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  // Initial stuff to allow the lang to change
  const { t, i18n, ready } = useTranslation();
  
  const { data: apiData, isLoading, error, refetch, isFetching } = useGetGameListQuery(undefined);
  const { isLoggedIn } = useAuth();

  const HERO_LIST = ['WTR001', 'ARC001', 'MON001', 'UPR001', 'ELE001', 'ROS001', 'HNT001', 'SUP001'];
  const FORMAT_LIST = [GAME_FORMAT.COMPETITIVE_CC, GAME_FORMAT.BLITZ, GAME_FORMAT.COMMONER, GAME_FORMAT.DRAFT, GAME_FORMAT.SEALED, GAME_FORMAT.GAGE];
  
  const USE_DEV_FAKE_GAMES = false; // Set to true to enable fake games for testing

  const DEV_FAKE_OPEN: IOpenGame[] = (import.meta.env.DEV && USE_DEV_FAKE_GAMES) ? Array.from({ length: 20 }, (_, i) => ({
    gameName: 80000 + i,
    p1Hero: HERO_LIST[i % HERO_LIST.length],
    format: FORMAT_LIST[i % FORMAT_LIST.length],
    formatName: FORMAT_LIST[i % FORMAT_LIST.length],
    description: `Dev test game ${i + 1}`,
    visibility: '1',
  })) : [];
  const DEV_FAKE_IN_PROGRESS: IGameInProgress[] = (import.meta.env.DEV && USE_DEV_FAKE_GAMES) ? Array.from({ length: 20 }, (_, i) => ({
    gameName: 90000 + i,
    p1Hero: HERO_LIST[i % HERO_LIST.length],
    p2Hero: HERO_LIST[(i + 5) % HERO_LIST.length],
    format: FORMAT_LIST[i % FORMAT_LIST.length],
    secondsSinceLastUpdate: Math.floor(Math.random() * 600),
    visibility: '1',
  })) : [];

  const data: typeof apiData = apiData
    ? {
        ...apiData,
        openGames: [...DEV_FAKE_OPEN, ...(apiData.openGames ?? [])],
        gamesInProgress: [...DEV_FAKE_IN_PROGRESS, ...(apiData.gamesInProgress ?? [])],
      }
    : apiData;
  const { data: friendsData } = useGetFriendsListQuery(undefined, { skip: !isLoggedIn });
  const { blockedUsers } = useBlockedUsers();

  useEffect(() => {
    if (friendsData?.friends) {
      try {
        const friendsList = friendsData.friends.map((f) => f.username);
        sessionStorage.setItem('friendsList', JSON.stringify(friendsList));
      } catch (e) {
        console.error('Failed to sync friendsList to sessionStorage:', e);
      }
    }
  }, [friendsData]);

  const [heroFilter, setHeroFilter] = useState<string[]>([]);
  const [gamesInProgressExpanded, setGamesInProgressExpanded] = useState(true); // Default to open
  const [activeTab, setActiveTab] = useState<'open' | 'inProgress'>('open');

  useEffect(() => {
    scrollableContentRef.current?.scrollTo({ top: 0 });
  }, [activeTab]);
  const [isRateLimited, setIsRateLimited] = useState(false);
  const PREVIEW_LIMIT = 9;
  const lastRefetchTime = useRef<number>(0);
  const scrollableContentRef = useRef<HTMLDivElement>(null);
  const REFETCH_RATE_LIMIT_MS = 3000;

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

  const [includeFriendsGames, setIncludeFriendsGames] = useState(() => {
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

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
    };
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

  const handleFriendsGamesFilterChange = (include: boolean) => {
    setIncludeFriendsGames(include);
  };

  const activeHeroIds = new Set<string>();

  if (data?.openGames) {
    data.openGames.forEach((game) => {
      if (game.p1Hero) activeHeroIds.add(game.p1Hero);
    });
  }

  if (data?.gamesInProgress) {
    data.gamesInProgress.forEach((game) => {
      if (game.p1Hero) activeHeroIds.add(game.p1Hero);
      if (game.p2Hero) activeHeroIds.add(game.p2Hero);
    });
  }

  const filteredHeroOptions = HEROES_OF_RATHE.filter((hero) =>
    activeHeroIds.has(hero.value)
  );

  // Create a set of friend usernames for quick lookup
  const friendUsernames = new Set(
    friendsData?.friends?.map((f) => f.username) || []
  );

  // Filter games
  const filteredGamesInProgress = data?.gamesInProgress
    ? data.gamesInProgress.filter((game) => {
        // Hide games created by blocked users
        if (game.gameCreator && blockedUsers.includes(game.gameCreator)) {
          return false;
        }

        // Hide friends-only private games (visibility "2") - these can't be spectated
        if (game.visibility === '2') {
          return false;
        }

        // Apply hero filter
        if (heroFilter.length > 0) {
          if (
            !heroFilter.find(
              (hero) => hero === game.p1Hero || hero === game.p2Hero
            )
          ) {
            return false;
          }
        }

        // Apply format filter
        if (!inProgressFormatFilters.has(game.format)) {
          return false;
        }

        return true;
      })
    : [];

  // Separate friend games from other games

  const sortedInProgressGames = [...filteredGamesInProgress].sort((a, b) => {
    const fmtA = normalizeFormat(a.format) ?? a.format;
    const fmtB = normalizeFormat(b.format) ?? b.format;
    const cmp = fmtA.localeCompare(fmtB);
    if (cmp !== 0) return cmp;
    return b.gameName - a.gameName; // newest first within same format
  });
  const displayInProgressGames = sortedInProgressGames;

  const friendGamesInProgress = includeFriendsGames
    ? displayInProgressGames.filter(
        (game) =>
          (game.gameCreator && friendUsernames.has(game.gameCreator)) ||
          (game.p2Username && friendUsernames.has(game.p2Username))
      )
    : [];

  const otherGamesInProgress = displayInProgressGames.filter(
    (game) =>
      !(
        (game.gameCreator && friendUsernames.has(game.gameCreator)) ||
        (game.p2Username && friendUsernames.has(game.p2Username))
      )
  );

  const sortedOpenGames = data?.openGames
    ? data.openGames
        .filter((game: IOpenGame) => {
          // Hide games created by blocked users
          if (game.gameCreator && blockedUsers.includes(game.gameCreator)) {
            return false;
          }

          // Hide friends-only games from non-friends
          if (game.visibility === '2' && !(game.gameCreator && friendUsernames.has(game.gameCreator))) {
            return false;
          }

          // Apply hero filter
          if (
            heroFilter.length === 0 ||
            heroFilter.find((hero) => hero === game.p1Hero)
          ) {
            // Apply format filter
            return inProgressFormatFilters.has(game.format);
          }
          return false;
        })
        .sort((a, b) => a.format.localeCompare(b.format))
    : [];

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
    [GAME_FORMAT.BLITZ]: t("GAME_LIST.FORMATS.BLITZ"),
    [GAME_FORMAT.COMPETITIVE_BLITZ]: t("GAME_LIST.FORMATS.COMPETITIVE_BLITZ"),
    [GAME_FORMAT.CLASSIC_CONSTRUCTED]: t("GAME_LIST.FORMATS.CC"),
    [GAME_FORMAT.COMPETITIVE_CC]: t("GAME_LIST.FORMATS.COMPETITIVE_CC"),
    [GAME_FORMAT.LLCC]: t("GAME_LIST.FORMATS.LL"),
    [GAME_FORMAT.COMPETITIVE_LL]: t("GAME_LIST.FORMATS.COMPETITIVE_LL"),
    [GAME_FORMAT.SAGE]: t("GAME_LIST.FORMATS.SAGE"),
    [GAME_FORMAT.COMPETITIVE_SAGE]: t("GAME_LIST.FORMATS.COMPETITIVE_SAGE"),
    [GAME_FORMAT.OPEN_SAGE]: t("GAME_LIST.FORMATS.FUTURE_SAGE"),
    [GAME_FORMAT.OPEN_CC]: t("GAME_LIST.FORMATS.FUTURE_CC"),
    [GAME_FORMAT.GAGE]: t("GAME_LIST.FORMATS.GAGE"),
    [GAME_FORMAT_NUMBER.BLITZ]: t("GAME_LIST.FORMATS.BLITZ"),
    [GAME_FORMAT_NUMBER.COMPETITIVE_BLITZ]: t("GAME_LIST.FORMATS.COMPETITIVE_BLITZ"),
    [GAME_FORMAT_NUMBER.CLASSIC_CONSTRUCTED]: t("GAME_LIST.FORMATS.CC"),
    [GAME_FORMAT_NUMBER.COMPETITIVE_CC]: t("GAME_LIST.FORMATS.COMPETITIVE_CC"),
    [GAME_FORMAT_NUMBER.LLCC]: t("GAME_LIST.FORMATS.LL"),
    [GAME_FORMAT_NUMBER.COMPETITIVE_LL]: t("GAME_LIST.FORMATS.COMPETITIVE_LL"),
    [GAME_FORMAT_NUMBER.SAGE]: t("GAME_LIST.FORMATS.SAGE"),
    [GAME_FORMAT_NUMBER.COMPETITIVE_SAGE]: t("GAME_LIST.FORMATS.COMPETITIVE_SAGE"),
    [GAME_FORMAT_NUMBER.OPEN_SAGE]: t("GAME_LIST.FORMATS.FUTURE_SAGE"),
    [GAME_FORMAT_NUMBER.OPEN_CC]: t("GAME_LIST.FORMATS.FUTURE_CC"),
    [GAME_FORMAT_NUMBER.GAGE]: t("GAME_LIST.FORMATS.GAGE"),
  };

  const getFormatLabel = (format: string) => formatLabelMap[format] || t("GAME_LIST.FORMATS.OTHER");

  const displayOpenGames = sortedOpenGames;

  // Count friend games in each tab for the badge indicator
  const friendOpenGamesCount = sortedOpenGames.filter(
    (game) => game.gameCreator && friendUsernames.has(game.gameCreator)
  ).length;

  const friendInProgressCount = filteredGamesInProgress.filter(
    (game) =>
      (game.gameCreator && friendUsernames.has(game.gameCreator)) ||
      (game.p2Username && friendUsernames.has(game.p2Username))
  ).length;

  return (
    <article className={`${styles.gameList}${!isLoggedIn ? ` ${styles.gameListLoggedOut}` : ''}`}>
      {/* Sticky header — always visible, never scrolls */}
      <div className={styles.stickyHeader}>
        {cookies.experimental && (
          <button
            onClick={(e) => {
              e.preventDefault();
              removeCookie('experimental');
            }}
          >
            {t("GAME_LIST.DISABLE_EXPERIMENTAL")}
          </button>
        )}
        <div className={styles.titleDiv}>
          <h3 className={styles.title}>{t("GAME_LIST.OPEN_GAMES", "Open Games")}</h3>
          <button
            onClick={handleReloadClick}
            className={styles.reloadButton}
            disabled={isFetching || isRateLimited}
            title={t("GAME_LIST.MANUAL_REFRESH")}
          >
            {t("GAME_LIST.REFRESH")}
            <span className={`${styles.refreshIcon}${(isFetching || isRateLimited) ? ` ${styles.spinning}` : ''}`}>↻</span>
          </button>
        </div>
        {isLoading ? <div aria-busy="true">{t("GAME_LIST.LOADING")}</div> : null}
        {error ? (
          <div>
            <h2>{t("GAME_LIST.LOAD_ERROR_TITLE")}</h2>
            <p>{t("GAME_LIST.LOAD_ERROR_DESCRIPTION")}</p>
            <p>{JSON.stringify(error)}</p>
          </div>
        ) : null}
        {!isLoggedIn && !isLoading && (
          <div className={styles.loginNotice}>
            <span className={styles.loginNoticeIcon}>🔒</span>
            <span>
              <Trans i18nKey="GAME_LIST.PLEASE_LOGIN">
                Please <Link to="/user/login">log in</Link> to view open lobbies and spectate games!
              </Trans>
            </span>
          </div>
        )}
        {!isLoading && !error && isLoggedIn && (
          <>
            <div className={styles.tabs}>
              <button
                className={`${styles.tab} ${activeTab === 'open' ? styles.tabActive : ''}`}
                onClick={() => { setActiveTab('open'); }}
              >
                {t("GAME_LIST.LOOKING_FOR_OPPONENT", "Looking for opponent")}
                <span className={`${styles.tabBadge} ${activeTab === 'open' ? styles.tabBadgeActive : ''}`}>
                  {sortedOpenGames.length}
                </span>
                {friendOpenGamesCount > 0 && (
                  <FriendBadge
                    isFriendsGame
                    size="small"
                    tooltip={`${friendOpenGamesCount} friend${friendOpenGamesCount > 1 ? 's' : ''} looking for opponent`}
                  />
                )}
              </button>
              <button
                className={`${styles.tab} ${activeTab === 'inProgress' ? styles.tabActive : ''}`}
                onClick={() => { setActiveTab('inProgress'); }}
              >
                {t("GAME_LIST.IN_PROGRESS_TAB", "In progress")}
                <span className={`${styles.tabBadge} ${activeTab === 'inProgress' ? styles.tabBadgeActive : ''}`}>
                  {data?.gameInProgressCount ?? 0}
                </span>
                {friendInProgressCount > 0 && (
                  <FriendBadge
                    isFriendsGame
                    size="small"
                    tooltip={`${friendInProgressCount} friend${friendInProgressCount > 1 ? 's' : ''} playing`}
                  />
                )}
              </button>
            </div>

            <div className={styles.filterRow}>
              <div className={styles.filterHeroWrapper}>
                <Filter setHeroFilter={setHeroFilter} heroOptions={filteredHeroOptions} />
              </div>
              <div className={styles.filterFormatWrapper}>
                <GameFilter
                  selectedFormats={inProgressFormatFilters}
                  onFilterChange={handleInProgressFilterChange}
                  formatOptions={[
                    { label: t("GAME_LIST.FORMATS.CC"), value: GAME_FORMAT.CLASSIC_CONSTRUCTED },
                    { label: t("GAME_LIST.FORMATS.COMPETITIVE_CC"), value: GAME_FORMAT.COMPETITIVE_CC },
                    { label: t("GAME_LIST.FORMATS.LL"), value: GAME_FORMAT.LLCC },
                    { label: t("GAME_LIST.FORMATS.COMPETITIVE_LL"), value: GAME_FORMAT.COMPETITIVE_LL },
                    { label: t("GAME_LIST.FORMATS.SAGE"), value: GAME_FORMAT.SAGE },
                    { label: t("GAME_LIST.FORMATS.COMPETITIVE_SAGE"), value: GAME_FORMAT.COMPETITIVE_SAGE },
                    { label: t("GAME_LIST.FORMATS.FUTURE_SAGE"), value: GAME_FORMAT.OPEN_SAGE },
                    { label: t("GAME_LIST.FORMATS.FUTURE_CC"), value: GAME_FORMAT.OPEN_CC },
                    { label: t("GAME_LIST.FORMATS.GAGE"), value: GAME_FORMAT.GAGE },
                    { label: t("GAME_LIST.FORMATS.OTHER"), value: 'otherFormats', isGroup: true, groupValues: otherFormats }
                  ]}
                  includeFriendsGames={includeFriendsGames}
                  onFriendsGamesChange={handleFriendsGamesFilterChange}
                  formatNumberMapping={formatNumberMapping}
                />
              </div>
            </div>
          </>
        )}
      </div>

      {/* Scrollable game list content */}
      {!isLoading && !error && isLoggedIn && (
        <div className={styles.scrollableContent} ref={scrollableContentRef}>
          {activeTab === 'open' ? (
            <>
              {displayOpenGames.map((entry, ix) => {
                const isFriendsGame = !!(entry.gameCreator && friendUsernames.has(entry.gameCreator));
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
              {[...friendGamesInProgress, ...otherGamesInProgress].map((entry, ix) => {
                const isFriendsGame = !!(
                  (entry.gameCreator && friendUsernames.has(entry.gameCreator)) ||
                  (entry.p2Username && friendUsernames.has(entry.p2Username))
                );
                const friendName =
                  entry.gameCreator && friendUsernames.has(entry.gameCreator)
                    ? entry.gameCreator
                    : entry.p2Username && friendUsernames.has(entry.p2Username)
                    ? entry.p2Username
                    : undefined;
                return (
                  <InProgressGame
                    entry={entry}
                    ix={ix}
                    key={entry.gameName}
                    isFriendsGame={isFriendsGame}
                    friendName={friendName}
                    formatLabel={getFormatLabel(entry.format)}
                  />
                );
              })}
            </div>
          )}
        </div>
      )}





    </article>
  );
};

const InProgressGameList = ({
  gameList,
  name,
  isFriendsSection,
  friendUsernames = new Set()
}: IInProgressGameList) => {
  const [parent] = useAutoAnimate();
  const [isMobile, setIsMobile] = useState(window.innerWidth < 1025);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 1025);
    };
    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  if (gameList.length === 0) {
    return null;
  }

  return (
    <div className={styles.groupDiv} ref={parent}>
      <h5
        className={styles.subSectionTitle}
        style={{
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          userSelect: 'none'
        }}
      >
        {name}
      </h5>
      {gameList.map((entry, ix: number) => {
        const isFriendsGame =
          isFriendsSection ||
          !!(
            (entry.gameCreator && friendUsernames.has(entry.gameCreator)) ||
            (entry.p2Username && friendUsernames.has(entry.p2Username))
          );
        const friendName =
          entry.gameCreator && friendUsernames.has(entry.gameCreator)
            ? entry.gameCreator
            : entry.p2Username && friendUsernames.has(entry.p2Username)
            ? entry.p2Username
            : undefined;
        return (
          <InProgressGame
            entry={entry}
            ix={ix}
            key={entry.gameName}
            isFriendsGame={isFriendsGame}
            friendName={friendName}
          />
        );
      })}
    </div>
  );
};

export default GameList;

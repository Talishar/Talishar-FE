import { useState, useEffect } from 'react';
import { useGetGameListQuery, useGetFriendsListQuery } from 'features/api/apiSlice';
import styles from './GameList.module.scss';
import InProgressGame from '../inProgressGame';
import Filter from '../filter';
import { GAME_FORMAT, GAME_FORMAT_NUMBER } from 'appConstants';
import FormatList from '../formatList';
import { useAutoAnimate } from '@formkit/auto-animate/react';
import useAuth from 'hooks/useAuth';
import { useBlockedUsers } from 'hooks/useBlockedUsers';
import { Link, useNavigate } from 'react-router-dom';
import { useCookies } from 'react-cookie';
import { setGameStart } from 'features/game/GameSlice';
import { useAppDispatch } from 'app/Hooks';
import { useLocation } from 'react-router-dom';
import { HEROES_OF_RATHE } from '../filter/constants';
import InProgressGameFilter from './InProgressGameFilter';

export interface IOpenGame {
  p1Hero?: string;
  format: string;
  formatName?: string;
  description?: string;
  gameName: number;
  gameCreator?: string; // Username of the game creator
}

export interface IGameInProgress {
  p1Hero?: string;
  p2Hero?: string;
  format: string;
  gameName: number;
  secondsSinceLastUpdate?: number;
  gameCreator?: string; // Username of the game creator
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

const GAME_LIST_POLLING_INTERVAL = 15000; // in ms (15 seconds)

const GameList = () => {
  const [cookies, setCookie, removeCookie] = useCookies(['experimental', 'inProgressGameFilters', 'inProgressGameFriendsFilter']);
  const [isTabActive, setIsTabActive] = useState(true);
  
  const { data, isLoading, error, refetch, isFetching } =
    useGetGameListQuery(undefined, {
      pollingInterval: isTabActive ? GAME_LIST_POLLING_INTERVAL : 0, // Stop polling when tab inactive
    });
  const { data: friendsData } = useGetFriendsListQuery(undefined);
  const { isLoggedIn } = useAuth();
  const { blockedUsers } = useBlockedUsers();

  const [heroFilter, setHeroFilter] = useState<string[]>([]);
  const [formatFilter, setFormatFilter] = useState<string | null>(null);
  const [gamesInProgressExpanded, setGamesInProgressExpanded] = useState(true); // Default to open
  
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
    GAME_FORMAT.OPEN_LL_CC,
    GAME_FORMAT.COMMONER,
    GAME_FORMAT.CLASH,
    GAME_FORMAT.SEALED,
    GAME_FORMAT.DRAFT,
    GAME_FORMAT.PRECON,
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
    GAME_FORMAT_NUMBER.OPEN_LL_CC,
    GAME_FORMAT_NUMBER.COMMONER,
    GAME_FORMAT_NUMBER.CLASH,
    GAME_FORMAT_NUMBER.SEALED,
    GAME_FORMAT_NUMBER.DRAFT,
    GAME_FORMAT_NUMBER.PRECON,
  ]);

  const [inProgressFormatFilters, setInProgressFormatFilters] = useState<Set<string>>(() => {
    // Try to load from cookies first, then fallback to localStorage
    if (cookies.inProgressGameFilters) {
      try {
        const parsed = JSON.parse(cookies.inProgressGameFilters);
        return new Set(parsed);
      } catch {
        // Cookie parsing failed, try localStorage
      }
    }
    // Fallback to localStorage
    try {
      const stored = localStorage.getItem('inProgressGameFilters');
      if (stored) {
        const parsed = JSON.parse(stored);
        return new Set(parsed);
      }
    } catch {
      // localStorage parsing failed
    }
    return defaultFormats;
  });

  const [includeFriendsGames, setIncludeFriendsGames] = useState(() => {
    // Try to load from cookies first, then fallback to localStorage
    if (cookies.inProgressGameFriendsFilter !== undefined) {
      return cookies.inProgressGameFriendsFilter === 'true';
    }
    // Fallback to localStorage
    try {
      const stored = localStorage.getItem('inProgressGameFriendsFilter');
      if (stored) {
        return JSON.parse(stored);
      }
    } catch {
      // localStorage parsing failed
    }
    return true;
  });

  const [parent] = useAutoAnimate();

  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const location = useLocation();

  useEffect(() => {
    const handleVisibilityChange = () => {
      setIsTabActive(!document.hidden);
      if (!document.hidden) {
        refetch();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [refetch]);

  // Save format filters to cookies and localStorage when they change
  useEffect(() => {
    setCookie('inProgressGameFilters', JSON.stringify(Array.from(inProgressFormatFilters)), {
      path: '/',
      maxAge: 86400 * 30, // 30 days
    });
    // Also save to localStorage as backup
    try {
      localStorage.setItem('inProgressGameFilters', JSON.stringify(Array.from(inProgressFormatFilters)));
    } catch {
      console.error('Failed to save filters to localStorage');
    }
  }, [inProgressFormatFilters, setCookie]);

  // Save friends games filter to cookies and localStorage when it changes
  useEffect(() => {
    setCookie('inProgressGameFriendsFilter', String(includeFriendsGames), {
      path: '/',
      maxAge: 86400 * 30, // 30 days
    });
    // Also save to localStorage as backup
    try {
      localStorage.setItem('inProgressGameFriendsFilter', JSON.stringify(includeFriendsGames));
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
    data.openGames.forEach(game => {
      if (game.p1Hero) activeHeroIds.add(game.p1Hero);
    });
  }
  
  if (data?.gamesInProgress) {
    data.gamesInProgress.forEach(game => {
      if (game.p1Hero) activeHeroIds.add(game.p1Hero);
      if (game.p2Hero) activeHeroIds.add(game.p2Hero);
    });
  }
  
  const filteredHeroOptions = HEROES_OF_RATHE.filter(hero =>
    activeHeroIds.has(hero.value)
  );

  // Create a set of friend usernames for quick lookup
  const friendUsernames = new Set(friendsData?.friends?.map(f => f.username) || []);

  // Filter games
  const filteredGamesInProgress = data?.gamesInProgress
    ? data.gamesInProgress.filter((game) => {
        // Hide games created by blocked users
        if (game.gameCreator && blockedUsers.includes(game.gameCreator)) {
          return false;
        }
        
        // Apply hero filter
        if (heroFilter.length > 0) {
          if (!heroFilter.find((hero) => hero === game.p1Hero || hero === game.p2Hero)) {
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
  const allFriendGames = filteredGamesInProgress.filter(game =>
    game.gameCreator && friendUsernames.has(game.gameCreator)
  );
  
  const friendGamesInProgress = includeFriendsGames ? allFriendGames : [];
  
  const otherGamesInProgress = filteredGamesInProgress.filter(game =>
    !game.gameCreator || !friendUsernames.has(game.gameCreator)
  );

  const sortedOpenGames = data?.openGames
    ? data.openGames
        .filter((game: IOpenGame) => {
          // Hide games created by blocked users
          if (game.gameCreator && blockedUsers.includes(game.gameCreator)) {
            return false;
          }
          
          return (
            heroFilter.length === 0 ||
            heroFilter.find((hero) => hero === game.p1Hero)
          );
        })
        .filter((game: IOpenGame) => {
          return formatFilter === null || game.format === formatFilter;
        })
        .sort((a, b) => a.format.localeCompare(b.format))
    : [];

  const handleReloadClick = () => {
    refetch();
  };

  const otherFormats = [
    GAME_FORMAT.OPEN_CC,
    GAME_FORMAT.OPEN_BLITZ,
    GAME_FORMAT.OPEN_LL_CC,
    GAME_FORMAT.COMMONER,
    GAME_FORMAT.CLASH,
    GAME_FORMAT.SEALED,
    GAME_FORMAT.DRAFT,
    GAME_FORMAT.PRECON,
    // GAME_FORMAT.LLBLITZ
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
    [GAME_FORMAT.OPEN_LL_CC]: GAME_FORMAT_NUMBER.OPEN_LL_CC,
    [GAME_FORMAT.COMMONER]: GAME_FORMAT_NUMBER.COMMONER,
    [GAME_FORMAT.CLASH]: GAME_FORMAT_NUMBER.CLASH,
    [GAME_FORMAT.SEALED]: GAME_FORMAT_NUMBER.SEALED,
    [GAME_FORMAT.DRAFT]: GAME_FORMAT_NUMBER.DRAFT,
    [GAME_FORMAT.PRECON]: GAME_FORMAT_NUMBER.PRECON,
  };

  return (
    <article className={styles.gameList}>
      {cookies.experimental && (
        <button
          onClick={(e) => {
            e.preventDefault();
            removeCookie('experimental');
          }}
        >
          Disable experimental features
        </button>
      )}
      <div className={styles.titleDiv}>
        <h3 className={styles.title}>
          Games
          <span 
            className={styles.autoRefreshText}
            title={`Auto-refreshes every ${GAME_LIST_POLLING_INTERVAL / 1000} seconds`}
          >
            (Auto-refresh: {GAME_LIST_POLLING_INTERVAL / 1000}s)
          </span>
        </h3>
        <button
          onClick={handleReloadClick}
          className={styles.reloadButton}
          aria-busy={isFetching}
          disabled={isFetching}
          title="Manually refresh game list"
        >
          Reload
        </button>
      </div>
      {isLoading ? <div aria-busy="true">Loading games please wait</div> : null}
      {error ? (
        <div>
          <h2>There has been an error!</h2>
          <p>
            Please refresh the page and try again, if you still get an error
            loading the gamelist. Please report on our discord and let us know
            the following:
          </p>
          <p>{JSON.stringify(error)}</p>
        </div>
      ) : null}
      {!isLoading && !error && (
        <Filter
          setHeroFilter={setHeroFilter}
          heroOptions={filteredHeroOptions}
        />
      )}
      {isLoggedIn && (
        <>
          <FormatList
            gameList={sortedOpenGames.filter(
              (game) => game.format === GAME_FORMAT.BLITZ
            )}
            name="Blitz"
            friendUsernames={friendUsernames}
          />
          <FormatList
            gameList={sortedOpenGames.filter(
              (game) => game.format === GAME_FORMAT.COMPETITIVE_BLITZ
            )}
            name="Competitive Blitz"
            friendUsernames={friendUsernames}
          />
          <FormatList
            gameList={sortedOpenGames.filter(
              (game) => game.format === GAME_FORMAT.CLASSIC_CONSTRUCTED
            )}
            name="Classic Constructed"
            friendUsernames={friendUsernames}
          />
          <FormatList
            gameList={sortedOpenGames.filter(
              (game) => game.format === GAME_FORMAT.COMPETITIVE_CC
            )}
            name="Competitive CC"
            friendUsernames={friendUsernames}
          />
          <FormatList
            gameList={sortedOpenGames.filter(
              (game) => game.format === GAME_FORMAT.LLCC
            )}
            name="Living Legend"
            friendUsernames={friendUsernames}
          />
          <FormatList
            gameList={sortedOpenGames.filter(
              (game) => game.format === GAME_FORMAT.COMPETITIVE_LL
            )}
            name="Competitive LL"
            friendUsernames={friendUsernames}
          />
          <FormatList
            gameList={sortedOpenGames.filter(
              (game) => game.format === GAME_FORMAT.SAGE
            )}
            name="Silver Age"
            friendUsernames={friendUsernames}
          />
          <FormatList
            gameList={sortedOpenGames.filter(
              (game) => game.format === GAME_FORMAT.COMPETITIVE_SAGE
            )}
            name="Competitive Silver Age"
            friendUsernames={friendUsernames}
          />
          <FormatList
            gameList={sortedOpenGames.filter((game) =>
              otherFormats.includes(game.format)
            )}
            name="Other Formats"
            isOther
            friendUsernames={friendUsernames}
          />
        </>
      )}
      {!isLoggedIn && !isLoading && (
        <p style={{ textAlign: 'center' }}>
          Please <Link to="/user/login">log in</Link> to view open lobbies!
        </p>
      )}
      {data != undefined && (
            <div data-testid="games-in-progress" ref={parent}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5em', gap: '0.5em', flexWrap: 'wrap' }}>
                <h4 
                  className={styles.subSectionTitle} 
                  onClick={() => setGamesInProgressExpanded(!gamesInProgressExpanded)}
                  style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', userSelect: 'none', margin: 0, flex: 1, minWidth: '200px' }}
                >
                  Games in Progress:&nbsp;<span>{data.gameInProgressCount}</span>
                </h4>
                <InProgressGameFilter
                  selectedFormats={inProgressFormatFilters}
                  onFilterChange={handleInProgressFilterChange}
                  formatOptions={[
                    { label: 'Classic Constructed', value: GAME_FORMAT.CLASSIC_CONSTRUCTED },
                    { label: 'Competitive CC', value: GAME_FORMAT.COMPETITIVE_CC },
                    { label: 'Living Legend', value: GAME_FORMAT.LLCC },
                    { label: 'Competitive LL', value: GAME_FORMAT.COMPETITIVE_LL },
                    { label: 'Silver Age', value: GAME_FORMAT.SAGE },
                    { label: 'Competitive Silver Age', value: GAME_FORMAT.COMPETITIVE_SAGE },
                    { label: 'Blitz', value: GAME_FORMAT.BLITZ },
                    { label: 'Competitive Blitz', value: GAME_FORMAT.COMPETITIVE_BLITZ },
                    { label: 'Other Formats', value: 'otherFormats', isGroup: true, groupValues: otherFormats },
                  ]}
                  includeFriendsGames={includeFriendsGames}
                  onFriendsGamesChange={handleFriendsGamesFilterChange}
                  formatNumberMapping={formatNumberMapping}
                />
              </div>
              {gamesInProgressExpanded && (
                <>
                  {friendGamesInProgress.length > 0 && (
                    <>
                      <InProgressGameList
                        gameList={friendGamesInProgress.sort((a, b) => b.gameName - a.gameName)}
                        name="Friends' Games"
                        isFriendsSection={true}
                        friendUsernames={friendUsernames}
                      />
                    </>
                  )}
              <InProgressGameList
                gameList={[
                  ...otherGamesInProgress.filter((game) =>
                    [GAME_FORMAT.BLITZ, GAME_FORMAT_NUMBER.BLITZ].includes(game.format)
                  ),
                ].sort((a, b) => b.gameName - a.gameName)}
                name="Blitz"
                friendUsernames={friendUsernames}
              />
              <InProgressGameList
                gameList={[
                  ...otherGamesInProgress.filter((game) =>
                    [GAME_FORMAT.COMPETITIVE_BLITZ, GAME_FORMAT_NUMBER.COMPETITIVE_BLITZ].includes(
                      game.format
                    )
                  ),
                ].sort((a, b) => b.gameName - a.gameName)}
                name="Competitive Blitz"
                friendUsernames={friendUsernames}
              />
              <InProgressGameList
                gameList={[
                  ...otherGamesInProgress.filter((game) =>
                    [GAME_FORMAT.CLASSIC_CONSTRUCTED, GAME_FORMAT_NUMBER.CLASSIC_CONSTRUCTED].includes(
                      game.format
                    )
                  ),
                ].sort((a, b) => b.gameName - a.gameName)}
                name="Classic Constructed"
                friendUsernames={friendUsernames}
              />
              <InProgressGameList
                gameList={[
                  ...otherGamesInProgress.filter((game) =>
                    [GAME_FORMAT.COMPETITIVE_CC, GAME_FORMAT_NUMBER.COMPETITIVE_CC].includes(
                      game.format
                    )
                  ),
                ].sort((a, b) => b.gameName - a.gameName)}
                name="Competitive CC"
                friendUsernames={friendUsernames}
              />
              <InProgressGameList
                gameList={[
                  ...otherGamesInProgress.filter((game) =>
                    [GAME_FORMAT.LLCC, GAME_FORMAT_NUMBER.LLCC].includes(
                      game.format
                    )
                  ),
                ].sort((a, b) => b.gameName - a.gameName)}
                name="Living Legend"
                friendUsernames={friendUsernames}
              />
              <InProgressGameList
                gameList={[
                  ...otherGamesInProgress.filter((game) =>
                    [GAME_FORMAT.COMPETITIVE_LL, GAME_FORMAT_NUMBER.COMPETITIVE_LL].includes(
                      game.format
                    )
                  ),
                ].sort((a, b) => b.gameName - a.gameName)}
                name="Competitive LL"
                friendUsernames={friendUsernames}
              />
              <InProgressGameList
                gameList={[
                  ...otherGamesInProgress.filter((game) =>
                    [GAME_FORMAT.SAGE, GAME_FORMAT_NUMBER.SAGE].includes(
                      game.format
                    )
                  ),
                ].sort((a, b) => b.gameName - a.gameName)}
                name="Silver Age"
                friendUsernames={friendUsernames}
              />
              <InProgressGameList
                gameList={[
                  ...otherGamesInProgress.filter((game) =>
                    [GAME_FORMAT.COMPETITIVE_SAGE, GAME_FORMAT_NUMBER.COMPETITIVE_SAGE].includes(
                      game.format
                    )
                  ),
                ].sort((a, b) => b.gameName - a.gameName)}
                name="Competitive Silver Age"
                friendUsernames={friendUsernames}
              />
              <InProgressGameList
                gameList={[
                  ...otherGamesInProgress.filter(
                    (game) =>
                      ![GAME_FORMAT.BLITZ, GAME_FORMAT_NUMBER.BLITZ, GAME_FORMAT.COMPETITIVE_CC, GAME_FORMAT.CLASSIC_CONSTRUCTED, GAME_FORMAT_NUMBER.CLASSIC_CONSTRUCTED, GAME_FORMAT_NUMBER.COMPETITIVE_CC, GAME_FORMAT.COMPETITIVE_LL, GAME_FORMAT.LLCC, GAME_FORMAT_NUMBER.LLCC, GAME_FORMAT_NUMBER.COMPETITIVE_LL, GAME_FORMAT.SAGE, GAME_FORMAT_NUMBER.SAGE, GAME_FORMAT.COMPETITIVE_SAGE, GAME_FORMAT_NUMBER.COMPETITIVE_SAGE].includes(game.format)
                  ),
                ].sort((a, b) => b.gameName - a.gameName)}
                name="Other Formats"
                friendUsernames={friendUsernames}
              />
                </>
              )}
            </div>
          )}
    </article>
  );
};

const InProgressGameList = ({ gameList, name, isFriendsSection, friendUsernames = new Set() }: IInProgressGameList) => {
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

  const limitedGameList = isMobile ? gameList.slice(0, 8) : gameList.slice(0, 10);

  if (limitedGameList.length === 0) {
    return null;
  }

  return (
    <div className={styles.groupDiv} ref={parent}>
      <h5 className={styles.subSectionTitle} style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', userSelect: 'none' }}>
        {name}
      </h5>
      {limitedGameList.map((entry, ix: number) => {
        const isFriendsGame = isFriendsSection || !!(entry.gameCreator && friendUsernames.has(entry.gameCreator));
        return <InProgressGame entry={entry} ix={ix} key={entry.gameName} isFriendsGame={isFriendsGame} />;
      })}
    </div>
  );
};

export default GameList;

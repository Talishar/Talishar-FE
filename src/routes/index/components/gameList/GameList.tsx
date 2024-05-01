import React, { useState } from 'react';
import { useGetGameListQuery } from 'features/api/apiSlice';
import styles from './GameList.module.scss';
import InProgressGame from '../inProgressGame';
import Filter from '../filter';
import { GAME_FORMAT, GAME_FORMAT_NUMBER } from 'appConstants';
import FormatList from '../formatList';
import { useAutoAnimate } from '@formkit/auto-animate/react';
import useAuth from 'hooks/useAuth';
import { Link, useNavigate } from 'react-router-dom';
import { useCookies } from 'react-cookie';
import { setGameStart } from 'features/game/GameSlice';
import { useAppDispatch } from 'app/Hooks';

export interface IOpenGame {
  p1Hero?: string;
  format: string;
  formatName?: string;
  description?: string;
  gameName: number;
}

export interface IGameInProgress {
  p1Hero?: string;
  p2Hero?: string;
  format: string;
  gameName: number;
  secondsSinceLastUpdate?: number;
}

export interface IInProgressGameList {
  gameList: IGameInProgress[];
  name: string;
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

const GAME_LIST_POLLING_INTERVAL = 10000; // in ms

const GameList = () => {
  const [cookies, setCookie, removeCookie] = useCookies(['experimental']);
  const { data, isLoading, error, refetch, isFetching } =
    useGetGameListQuery(undefined);
  const { isLoggedIn } = useAuth();

  const [heroFilter, setHeroFilter] = useState<string[]>([]);
  const [formatFilter, setFormatFilter] = useState<string | null>(null);

  const [parent] = useAutoAnimate();

  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  //Before displaying open games, check if we have a game in progress
  if(!!data?.LastAuthKey && data.LastAuthKey != "")
  {
    console.log(data.LastAuthKey);
    dispatch(
      setGameStart({
        playerID: data.LastPlayerID ?? 0,
        gameID: data.LastGameName ?? 0,
        authKey: data.LastAuthKey ?? ''
      })
    );
    const searchParam = { playerID: String(data.LastPlayerID ?? '0') };
    navigate(`/game/play/${data.LastGameName}`, {
      state: { playerID: data.LastPlayerID ?? 0 }
    });
    return <></>;
  }

  //No game in progress, show open games
  let sortedOpenGames = data?.openGames ? [...data.openGames] : [];
  sortedOpenGames = sortedOpenGames
    .filter((game: IOpenGame) => {
      return (
        heroFilter.length === 0 ||
        heroFilter.find((hero) => hero === game.p1Hero)
      );
    })
    .filter((game: IOpenGame) => {
      return formatFilter === null || game.format === formatFilter;
    })
    .sort((a, b) => a.format.localeCompare(b.format));

  let filteredGamesInProgress = data?.gamesInProgress
    ? [...data.gamesInProgress]
    : [];

  filteredGamesInProgress = filteredGamesInProgress.filter((game) => {
    return (
      heroFilter.length === 0 ||
      heroFilter.find((hero) => {
        return hero === game.p1Hero || hero === game.p2Hero;
      })
    );
  });

  const handleReloadClick = () => {
    refetch();
  };

  const otherFormats = [
    GAME_FORMAT.OPEN_FORMAT,
    GAME_FORMAT.COMMONER,
    GAME_FORMAT.CLASH,
    GAME_FORMAT.SEALED,
    GAME_FORMAT.DRAFT,
    GAME_FORMAT.LLCC,
    GAME_FORMAT.LLBLITZ
  ];

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
        <h1 className={styles.title}>Games</h1>
        <button
          onClick={handleReloadClick}
          aria-busy={isFetching}
          disabled={isFetching}
          className={styles.reloadButton}
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
            loading the gamelist. Please report on our discord and let them know
            the following:
          </p>
          <p>{JSON.stringify(error)}</p>
        </div>
      ) : null}
      {!isLoading && !error && <Filter setHeroFilter={setHeroFilter} />}
      {isLoggedIn ? (
        <>
          <FormatList
            gameList={sortedOpenGames.filter(
              (game) => game.format === GAME_FORMAT.BLITZ
            )}
            name="Blitz"
          />
          <FormatList
            gameList={sortedOpenGames.filter(
              (game) => game.format === GAME_FORMAT.COMPETITIVE_BLITZ
            )}
            name="Request Undo Blitz"
          />
          <FormatList
            gameList={sortedOpenGames.filter(
              (game) => game.format === GAME_FORMAT.CLASSIC_CONSTRUCTED
            )}
            name="Classic Constructed"
          />
          <FormatList
            gameList={sortedOpenGames.filter(
              (game) => game.format === GAME_FORMAT.COMPETITIVE_CC
            )}
            name="Request Undo CC"
          />
          <FormatList
            gameList={sortedOpenGames.filter((game) =>
              otherFormats.includes(game.format)
            )}
            name="Other"
            isOther
          />
        </>
      ) : (
        !isLoading && (
          <p>
            Please <Link to="/user/login">log in</Link> to view open lobbies
          </p>
        )
      )}
      {data != undefined && (
        <div data-testid="games-in-progress" ref={parent}>
          <h4 className={styles.subSectionTitle}>
            Public games in progress: <span>({data.gameInProgressCount})</span>
          </h4>
          <InProgressGameList
            gameList={filteredGamesInProgress.filter((game) =>
              [GAME_FORMAT.BLITZ, GAME_FORMAT_NUMBER.BLITZ].includes(
                game.format
              )
            )}
            name="Blitz"
          />
          <InProgressGameList
            gameList={filteredGamesInProgress.filter((game) =>
              [
                GAME_FORMAT.COMPETITIVE_BLITZ,
                GAME_FORMAT_NUMBER.COMPETITIVE_BLITZ
              ].includes(game.format)
            )}
            name="Request Undo Blitz"
          />
          <InProgressGameList
            gameList={filteredGamesInProgress.filter((game) =>
              [
                GAME_FORMAT.CLASSIC_CONSTRUCTED,
                GAME_FORMAT_NUMBER.CLASSIC_CONSTRUCTED
              ].includes(game.format)
            )}
            name="Classic Constructed"
          />
          <InProgressGameList
            gameList={filteredGamesInProgress.filter((game) =>
              [
                GAME_FORMAT.COMPETITIVE_CC,
                GAME_FORMAT_NUMBER.COMPETITIVE_CC
              ].includes(game.format)
            )}
            name="Request Undo CC"
          />
          <InProgressGameList
            gameList={filteredGamesInProgress.filter(
              (game) =>
                ![
                  GAME_FORMAT.BLITZ,
                  GAME_FORMAT_NUMBER.BLITZ,
                  GAME_FORMAT.COMPETITIVE_BLITZ,
                  GAME_FORMAT_NUMBER.COMPETITIVE_BLITZ,
                  GAME_FORMAT.COMPETITIVE_CC,
                  GAME_FORMAT.CLASSIC_CONSTRUCTED,
                  GAME_FORMAT_NUMBER.CLASSIC_CONSTRUCTED,
                  GAME_FORMAT_NUMBER.COMPETITIVE_CC
                ].includes(game.format)
            )}
            name="Other"
          />
        </div>
      )}
    </article>
  );
};

const InProgressGameList = ({ gameList, name }: IInProgressGameList) => {
  const [parent] = useAutoAnimate();
  if (gameList.length === 0) {
    return null;
  }

  return (
    <div className={styles.groupDiv} ref={parent}>
      <h5 className={styles.subSectionTitle}>{name}</h5>
      {gameList.map((entry, ix: number) => {
        return <InProgressGame entry={entry} ix={ix} key={entry.gameName} />;
      })}
    </div>
  );
};

export default GameList;

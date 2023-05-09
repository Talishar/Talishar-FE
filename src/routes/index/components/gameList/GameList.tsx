import React, { useState } from 'react';
import { useGetGameListQuery } from 'features/api/apiSlice';
import styles from './GameList.module.css';
import InProgressGame from '../inProgressGame';
import Filter from '../filter';
import { GAME_FORMAT } from 'appConstants';
import FormatList from '../formatList';
import { useAutoAnimate } from '@formkit/auto-animate/react';
import useAuth from 'hooks/useAuth';
import { Link } from 'react-router-dom';
import { useCookies } from 'react-cookie';

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
  gameName: number;
  secondsSinceLastUpdate?: number;
}

export interface GameListResponse {
  gamesInProgress: IGameInProgress[];
  openGames: IOpenGame[];
  canSeeQueue?: boolean;
  gameInProgressCount?: number;
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

  filteredGamesInProgress = filteredGamesInProgress
    .filter((game) => {
      return (
        heroFilter.length === 0 ||
        heroFilter.find((hero) => {
          return hero === game.p1Hero || hero === game.p2Hero;
        })
      );
    })
    .sort((a, b) => {
      return (a.secondsSinceLastUpdate ?? 0) - (b.secondsSinceLastUpdate ?? 0);
    });

  const handleReloadClick = () => {
    refetch();
  };

  const otherFormats = [
    GAME_FORMAT.OPEN_FORMAT,
    GAME_FORMAT.COMMONER,
    GAME_FORMAT.CLASH,
    GAME_FORMAT.SEALED,
    GAME_FORMAT.DRAFT
  ];
  const blitz = sortedOpenGames.filter(
    (game) => game.format === GAME_FORMAT.BLITZ
  );
  const compBlitz = sortedOpenGames.filter(
    (game) => game.format === GAME_FORMAT.COMPETITIVE_BLITZ
  );
  const cc = sortedOpenGames.filter(
    (game) => game.format === GAME_FORMAT.CLASSIC_CONSTRUCTED
  );
  const compcc = sortedOpenGames.filter(
    (game) => game.format === GAME_FORMAT.COMPETITIVE_CC
  );
  const otherGames = sortedOpenGames.filter((game) =>
    otherFormats.includes(game.format)
  );

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
          <FormatList gameList={blitz} name="Blitz" />
          <FormatList gameList={compBlitz} name="Competitive Blitz" />
          <FormatList gameList={cc} name="Classic Constructed" />
          <FormatList gameList={compcc} name="Comp CC" />
          <FormatList gameList={otherGames} name="Other" isOther />
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
          <h5 className={styles.subSectionTitle}>
            Games in progress: <span>({data.gameInProgressCount})</span>
          </h5>
          {filteredGamesInProgress.map((entry, ix: number) => {
            return (
              <InProgressGame entry={entry} ix={ix} key={entry.gameName} />
            );
          })}
        </div>
      )}
    </article>
  );
};

export default GameList;

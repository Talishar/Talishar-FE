import React, { useState } from 'react';
import { useGetGameListQuery } from 'features/api/apiSlice';
import { createSearchParams, useNavigate } from 'react-router-dom';
import styles from './GameList.module.css';
import InProgressGame from '../inProgressGame';
import OpenGame from '../openGame';
import Filter from '../filter';

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
  data?: {
    gamesInProgress: IGameInProgress[];
    openGames: IOpenGame[];
    canSeeQueue?: boolean;
  };
  isLoading?: boolean;
  error?: unknown;
  refetch?: () => void;
}

const GAME_LIST_POLLING_INTERVAL = 10000; // in ms

const GameList = () => {
  const { data, isLoading, error, refetch }: GameListResponse =
    useGetGameListQuery({}, {});
  const navigate = useNavigate();

  const [heroFilter, setHeroFilter] = useState<string[]>([]);
  const [formatFilter, setFormatFilter] = useState<string | null>(null);

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
    // .filter((game: IGameInProgress) => {
    //   return formatFilter === null; // TODO: get game format from BE
    // })
    .sort((a, b) => {
      return (a.secondsSinceLastUpdate ?? 0) - (b.secondsSinceLastUpdate ?? 0);
    });

  return (
    <article className={styles.gameList}>
      <h3>Games</h3>
      {isLoading ? <div aria-busy="true">Loading!</div> : null}
      {error ? <div>ERROR!</div> : null}
      {!isLoading && !error && <Filter setHeroFilter={setHeroFilter} />}
      {sortedOpenGames != undefined
        ? sortedOpenGames.map((entry, ix: number) => {
            return <OpenGame entry={entry} ix={ix} />;
          })
        : null}
      {data != undefined && (
        <div data-testid="games-in-progress">
          <h5 className={styles.title}>
            Games in progress: <span>({data.gamesInProgress.length})</span>
          </h5>
          {filteredGamesInProgress.map((entry, ix: number) => {
            return <InProgressGame entry={entry} ix={ix} />;
          })}
        </div>
      )}
    </article>
  );
};

export default GameList;

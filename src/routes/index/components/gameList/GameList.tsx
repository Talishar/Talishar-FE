import React from 'react';
import { useGetGameListQuery } from 'features/api/apiSlice';
import { createSearchParams, useNavigate } from 'react-router-dom';
import classNames from 'classnames';
import styles from './GameList.module.css';
import InProgressGame from '../inProgressGame';
import OpenGame from '../openGame';

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

  let sortedOpenGames = data?.openGames ? [...data.openGames] : [];
  sortedOpenGames = sortedOpenGames.sort((a, b) =>
    a.format.localeCompare(b.format)
  );

  const buttonClass = classNames(styles.button, 'secondary');

  return (
    <article className={styles.gameList}>
      <h3>Games</h3>
      {isLoading ? <div aria-busy="true">Loading!</div> : null}
      {error ? <div>ERROR!</div> : null}
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
          {data.gamesInProgress.map((entry, ix: number) => {
            return <InProgressGame entry={entry} ix={ix} />;
          })}
        </div>
      )}
    </article>
  );
};

export default GameList;

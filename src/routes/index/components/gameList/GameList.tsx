import { useGetGameListQuery } from 'features/api/apiSlice';
import styles from './GameList.module.css';
import React from 'react';
import { StringLiteral } from 'typescript';
import { createSearchParams, useNavigate } from 'react-router-dom';
import classNames from 'classnames';

export interface GameListResponse {
  data?: {
    gamesInProgress: {
      p1Hero?: string;
      p2Hero?: string;
      gameName: number;
      secondsSinceLastUpdate?: number;
    }[];
    openGames: {
      p1Hero?: string;
      format: string;
      formatName?: string;
      description?: string;
      gameName: number;
    }[];
    canSeeQueue?: boolean;
  };
  isLoading?: boolean;
  error?: unknown;
}

const GAME_LIST_POLLING_INTERVAL = 10000; // in ms

const GameList = () => {
  const { data, isLoading, error } = useGetGameListQuery<GameListResponse>(
    {},
    { pollingInterval: GAME_LIST_POLLING_INTERVAL }
  );
  const navigate = useNavigate();
  const spectateHandler = (gameName: number) => {
    navigate({
      pathname: `/game/play/${gameName}`,
      search: `?${createSearchParams({
        gameName: String(gameName),
        playerID: String(3)
      })}`
    });
  };

  let sortedOpenGames = data?.openGames ? [...data.openGames] : [];
  sortedOpenGames = sortedOpenGames.sort((a, b) =>
    a.format.localeCompare(b.format)
  );

  const buttonClass = classNames(styles.button, 'secondary');

  return (
    <div className={styles.gameList}>
      <h1>Spectating a game totally works though but you can't join one</h1>
      {isLoading ? <div aria-busy="true">Loading!</div> : null}
      {error ? <div>ERROR!</div> : null}
      {sortedOpenGames != undefined
        ? sortedOpenGames.map((entry, ix: number) => {
            return (
              <div key={ix} className={styles.gameItem}>
                <div>
                  {!!entry.p1Hero && (
                    <img src={`/crops/${entry.p1Hero}_cropped.png`} />
                  )}
                </div>
                <div>{entry.description}</div>
                <div>{entry.format}</div>
                <div>
                  <button
                    className={buttonClass}
                    onClick={(e) => {
                      e.preventDefault();
                      spectateHandler(entry.gameName);
                    }}
                  >
                    Join
                  </button>
                </div>
              </div>
            );
          })
        : null}
      {data != undefined && (
        <div data-testid="games-in-progress">
          <h5 className={styles.title}>
            Games in progress: <span>({data.gamesInProgress.length})</span>
          </h5>
          {data.gamesInProgress.map((entry, ix: number) => {
            return (
              <div key={ix} className={styles.gameItem}>
                <div>
                  {!!entry.p1Hero && (
                    <img src={`/crops/${entry.p1Hero}_cropped.png`} />
                  )}
                </div>{' '}
                -{' '}
                <div>
                  {!!entry.p2Hero && (
                    <img src={`/crops/${entry.p2Hero}_cropped.png`} />
                  )}
                </div>
                <div>
                  <button
                    className={buttonClass}
                    onClick={(e) => {
                      e.preventDefault();
                      spectateHandler(entry.gameName);
                    }}
                  >
                    Spectate
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default GameList;

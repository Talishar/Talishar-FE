import { useGetGameListQuery } from 'features/api/apiSlice';
import styles from './GameList.module.css';
import React from 'react';
import { StringLiteral } from 'typescript';

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

const GameList = () => {
  const { data, isLoading, error }: GameListResponse = useGetGameListQuery({});
  const spectateHandler = (gameName: number) => {
    console.log('clicky click ', gameName);
  };

  let sortedOpenGames = data?.openGames ? [...data.openGames] : [];
  sortedOpenGames = sortedOpenGames.sort((a, b) =>
    a.format.localeCompare(b.format)
  );

  return (
    <div className={styles.gameList}>
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
                    className={styles.button}
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
        <h5 className={styles.title}>
          Games in progress: <span>({data.gamesInProgress.length})</span>
        </h5>
      )}
      {data != undefined
        ? data.gamesInProgress.map((entry, ix: number) => {
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
                    className={styles.button}
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
          })
        : null}
    </div>
  );
};

export default GameList;

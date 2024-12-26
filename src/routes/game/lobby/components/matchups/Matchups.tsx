import { useAppSelector } from 'app/Hooks';
import { RootState } from 'app/Store';
import { useJoinGameMutation } from 'features/api/apiSlice';
import { getGameInfo } from 'features/game/GameSlice';
import React, { useState } from 'react';
import { toast } from 'react-hot-toast';
import { shallowEqual } from 'react-redux';
import styles from './Matchups.module.css';

export interface Matchups {
  refetch: () => void;
}

const Matchups = ({ refetch }: Matchups) => {
  const [isUpdating, setIsUpdating] = useState(false);

  const gameLobby = useAppSelector(
    (state: RootState) => state.game.gameLobby,
    shallowEqual
  );
  const { gameID, playerID } = useAppSelector(getGameInfo, shallowEqual);
  const [joinGameMutation, joinGameMutationData] = useJoinGameMutation();

  const handleMatchupClick = async (matchupID: string) => {
    setIsUpdating(true);
    try {
      await joinGameMutation({
        gameName: gameID,
        playerID: playerID,
        fabdb: gameLobby?.myDeckLink ?? '',
        matchup: matchupID
      }).unwrap();
      refetch();
      toast.success(
        `Matchup profile applied, check your deck before submission`,
        { position: 'top-center' }
      );
    } catch (err) {
      console.warn(err);
      toast.error('some error happened', { position: 'top-center' });
    } finally {
      setIsUpdating(false);
    }
  };

  const sortedMatchups = [...(gameLobby?.matchups ?? [])];
  sortedMatchups.sort((a, b) => a.name.localeCompare(b.name));

  if (sortedMatchups.length > 0) {
    return (
      <article className={styles.matchupContainer}>
        <>
          <h4>Matchups</h4>
          {sortedMatchups.map((matchup, ix) => (
            <div className={styles.matchups} key={ix}>
              <button
                disabled={isUpdating}
                className={'outline'}
                onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
                  e.preventDefault();
                  handleMatchupClick(matchup.matchupId);
                }}
              >
                {matchup.name}
              </button>
            </div>
          ))}
        </>
      </article>
    );
  } else {
    return (
      <article className={styles.emptyMatchupContainer}>
      </article>
    );
  }
};

export default Matchups;

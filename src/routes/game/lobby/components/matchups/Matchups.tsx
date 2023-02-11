import { useAppDispatch, useAppSelector } from 'app/Hooks';
import { RootState } from 'app/Store';
import { apiSlice, useJoinGameMutation } from 'features/api/apiSlice';
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
  const gameInfo = useAppSelector(
    (state: RootState) => state.game.gameInfo,
    shallowEqual
  );
  const [joinGameMutation, joinGameMutationData] = useJoinGameMutation();

  const handleMatchupClick = async (matchupID: string) => {
    setIsUpdating(true);
    try {
      await joinGameMutation({
        gameName: gameInfo.gameID,
        playerID: gameInfo.playerID,
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

  return (
    <article className={styles.matchupContainer}>
      <>
        <h4>Matchups</h4>
        {gameLobby?.matchups?.map((matchup, ix) => (
          <div key={ix}>
            <button
              disabled={isUpdating}
              className="outline"
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
};

export default Matchups;

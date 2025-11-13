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

  const getTurnOrderIndicator = (preferredTurnOrder: string | null | undefined) => {
    if (!preferredTurnOrder) return null;
    
    if (preferredTurnOrder === '1st') {
      return '1st';
    } else if (preferredTurnOrder === '2nd') {
      return '2nd';
    }
    return null;
  };

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
      toast.error('Some error happened', { position: 'top-center' });
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
          {sortedMatchups.map((matchup, ix) => {
            const turnOrderIndicator = getTurnOrderIndicator(matchup.preferredTurnOrder);
            return (
              <div className={styles.matchups} key={ix}>
                <button
                  disabled={isUpdating}
                  className={'outline'}
                  onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
                    e.preventDefault();
                    handleMatchupClick(matchup.matchupId);
                  }}
                >
                  <span className={styles.matchupName}>{matchup.name}</span>
                  {turnOrderIndicator && (
                    <span className={styles.turnOrderBadge}>
                      {turnOrderIndicator}
                    </span>
                  )}
                </button>
              </div>
            );
          })}
        </>
      </article>
    );
  }
  
  return null;
};

export default Matchups;

import { useAppSelector } from 'app/Hooks';
import { RootState } from 'app/Store';
import { useJoinGameMutation } from 'features/api/apiSlice';
import { getGameInfo } from 'features/game/GameSlice';
import React, { useState } from 'react';
import { toast } from 'react-hot-toast';
import { shallowEqual } from 'react-redux';
import styles from './Matchups.module.css';
import MatchupTooltip from './MatchupTooltip';

export interface Matchups {
  refetch: () => void;
  selectedMatchupId?: string | null;
  onMatchupSelected?: (matchupId: string) => void;
  suggestedMatchupId?: string | null;
  isReadied?: boolean;
}

const Matchups = ({
  refetch,
  selectedMatchupId,
  onMatchupSelected,
  suggestedMatchupId = null,
  isReadied = false
}: Matchups) => {
  const [isUpdating, setIsUpdating] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const gameLobby = useAppSelector(
    (state: RootState) => state.game.gameLobby,
    shallowEqual
  );
  const { gameID, playerID } = useAppSelector(getGameInfo, shallowEqual);
  const [joinGameMutation, joinGameMutationData] = useJoinGameMutation();

  const getTurnOrderIndicator = (
    preferredTurnOrder: string | null | undefined
  ) => {
    if (!preferredTurnOrder) return null;

    if (preferredTurnOrder === '1st') {
      return '1st';
    } else if (preferredTurnOrder === '2nd') {
      return '2nd';
    }
    return null;
  };

  const handleMatchupClick = async (matchupID: string) => {
    if (isReadied) return;
    setIsUpdating(true);
    try {
      const rawDeckLink = gameLobby?.myDeckLink ?? '';
      const favMarker = rawDeckLink.indexOf('<fav>');
      const cleanedDeckLink = favMarker !== -1 ? rawDeckLink.slice(favMarker + 5) : rawDeckLink;
      await joinGameMutation({
        gameName: gameID,
        playerID: playerID,
        fabdb: cleanedDeckLink,
        matchup: matchupID
      }).unwrap();
      onMatchupSelected?.(matchupID);
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
  sortedMatchups.sort((a, b) => {
    if (a.matchupId === suggestedMatchupId) return -1;
    if (b.matchupId === suggestedMatchupId) return 1;
    return a.name.localeCompare(b.name);
  });

  const filteredMatchups = sortedMatchups.filter((matchup) =>
    matchup.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (sortedMatchups.length > 0) {
    return (
      <article className={styles.matchupContainer}>
        <>
          <h4>Matchups</h4>
          <input
            type="text"
            placeholder="Search"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          {filteredMatchups.map((matchup, ix) => {
            const isSelected = selectedMatchupId === matchup.matchupId;
            const isSuggested = !selectedMatchupId && suggestedMatchupId === matchup.matchupId;
            const turnOrderIndicator = getTurnOrderIndicator(
              matchup.preferredTurnOrder
            );
            return (
              <div className={styles.matchups} key={ix}>
                <MatchupTooltip content={matchup.notes}>
                  <button
                    disabled={isUpdating || isReadied}
                    className={`${styles.matchupButton} ${
                      isSelected
                        ? styles.matchupButtonSelected
                        : isSuggested
                        ? styles.matchupButtonSuggested
                        : 'outline'
                    }`}
                    onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
                      e.preventDefault();
                      handleMatchupClick(matchup.matchupId);
                    }}
                  >
                    <span className={styles.matchupName}>{matchup.name}</span>
                    {isSelected && (
                      <span className={styles.selectedBadge}>Selected</span>
                    )}
                    {isSuggested && (
                      <span className={styles.suggestedBadge}>Suggested</span>
                    )}
                    {turnOrderIndicator && (
                      <span className={styles.turnOrderBadge}>
                        {turnOrderIndicator}
                      </span>
                    )}
                  </button>
                </MatchupTooltip>
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

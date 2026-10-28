import { useAppSelector } from 'app/Hooks';
import { RootState } from 'app/Store';
import { useJoinGameMutation } from 'features/api/apiSlice';
import { getGameInfo } from 'features/game/GameSlice';
import React, { useLayoutEffect, useRef, useState } from 'react';
import { toast } from 'react-hot-toast';
import { shallowEqual } from 'react-redux';
import styles from './Matchups.module.css';
import MatchupTooltip from './MatchupTooltip';
import { useTranslation } from 'react-i18next';
import { useMediaQuery } from 'hooks/useMediaQuery';
import { PHONE_LANDSCAPE_QUERY } from '../../phoneLandscape';

export interface Matchups {
  refetch: () => void;
  selectedMatchupId?: string | null;
  onMatchupSelected?: (matchupId: string) => void;
  suggestedMatchupId?: string | null;
  isReadied?: boolean;
}

const useLandscapeMatchupColumns = (
  containerRef: React.RefObject<HTMLElement>,
  layoutKey: string
) => {
  const isPhoneLandscape = useMediaQuery(PHONE_LANDSCAPE_QUERY);

  useLayoutEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    if (!isPhoneLandscape) {
      container.style.removeProperty('--matchup-columns');
      return;
    }

    let cancelled = false;
    let fittedWidth = -1;
    const range = document.createRange();
    const fit = (force: boolean) => {
      if (cancelled) return;
      const width = container.clientWidth;
      if (!force && width === fittedWidth) return;
      fittedWidth = width;
      const style = getComputedStyle(container);
      const columnGap = parseFloat(style.columnGap) || 0;
      const paddingLeft = parseFloat(style.paddingLeft) || 0;
      const paddingRight = parseFloat(style.paddingRight) || 0;
      const threeColumnWidth =
        (container.getBoundingClientRect().width -
          paddingLeft -
          paddingRight -
          2 * columnGap) /
        3;
      let fitsThree = true;
      container
        .querySelectorAll<HTMLElement>('.' + styles.matchupName)
        .forEach((name) => {
          const button = name.parentElement;
          if (!button) return;
          range.selectNodeContents(name);
          const needed =
            button.getBoundingClientRect().width -
            name.getBoundingClientRect().width +
            range.getBoundingClientRect().width;
          if (needed > threeColumnWidth) fitsThree = false;
        });
      container.style.setProperty('--matchup-columns', fitsThree ? '3' : '2');
    };

    const refit = () => fit(false);

    fit(true);
    window.addEventListener('resize', refit);
    const observer = new ResizeObserver(refit);
    observer.observe(container);
    document.fonts?.ready.then(() => fit(true));
    return () => {
      cancelled = true;
      window.removeEventListener('resize', refit);
      observer.disconnect();
    };
  }, [containerRef, isPhoneLandscape, layoutKey]);
};

const Matchups = ({
  refetch,
  selectedMatchupId,
  onMatchupSelected,
  suggestedMatchupId = null,
  isReadied = false
}: Matchups) => {
  const [isUpdating, setIsUpdating] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  // Initial stuff to allow the lang to change
  const { t, i18n } = useTranslation();

  const gameLobby = useAppSelector(
    (state: RootState) => state.game.gameLobby,
    shallowEqual
  );
  const { gameID, playerID } = useAppSelector(getGameInfo, shallowEqual);
  const [joinGameMutation] = useJoinGameMutation();

  const getTurnOrderIndicator = (
    preferredTurnOrder: string | null | undefined
  ) => {
    if (!preferredTurnOrder) return null;

    if (preferredTurnOrder === '1st') {
      return t('GAME_LOBBY.1ST');
    } else if (preferredTurnOrder === '2nd') {
      return t('GAME_LOBBY.2ND');
    }
    return null;
  };

  const handleMatchupClick = async (matchupID: string) => {
    if (isReadied) return;
    setIsUpdating(true);
    try {
      const rawDeckLink = gameLobby?.myDeckLink ?? '';
      const favMarker = rawDeckLink.indexOf('<fav>');
      const cleanedDeckLink =
        favMarker !== -1 ? rawDeckLink.slice(favMarker + 5) : rawDeckLink;
      await joinGameMutation({
        gameName: gameID,
        playerID: playerID,
        fabdb: cleanedDeckLink,
        matchup: matchupID
      }).unwrap();
      onMatchupSelected?.(matchupID);
      refetch();
      toast.success(t('GAME_LOBBY.MATCHUP_APPLIED'), {
        position: 'top-center'
      });
    } catch (err) {
      console.warn(err);
      toast.error(t('GAME_LOBBY.SOME_ERROR'), { position: 'top-center' });
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

  const containerRef = useRef<HTMLElement>(null);
  const layoutKey = [
    filteredMatchups
      .map((matchup) => `${matchup.name}|${matchup.preferredTurnOrder}`)
      .join('\n'),
    selectedMatchupId,
    suggestedMatchupId,
    i18n.language
  ].join('\n');
  useLandscapeMatchupColumns(containerRef, layoutKey);

  if (sortedMatchups.length > 0) {
    return (
      <article className={styles.matchupContainer} ref={containerRef}>
        <>
          <h4>{t('GAME_LOBBY.MATCHUPS')}</h4>
          <input
            id="matchup-search"
            name="matchup-search"
            type="text"
            aria-label={`${t('BASE.SEARCH')} ${t('GAME_LOBBY.MATCHUPS')}`}
            placeholder={t('BASE.SEARCH')}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          {filteredMatchups.map((matchup, ix) => {
            const isSelected = selectedMatchupId === matchup.matchupId;
            const isSuggested =
              !selectedMatchupId && suggestedMatchupId === matchup.matchupId;
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
                    {(isSelected || isSuggested || turnOrderIndicator) && (
                      <span className={styles.matchupBadges}>
                        {isSelected && (
                          <span className={styles.selectedBadge}>
                            {t('GAME_LOBBY.SELECTED')}
                          </span>
                        )}
                        {isSuggested && (
                          <span className={styles.suggestedBadge}>
                            {t('GAME_LOBBY.SUGGESTED')}
                          </span>
                        )}
                        {turnOrderIndicator && (
                          <span className={styles.turnOrderBadge}>
                            {turnOrderIndicator}
                          </span>
                        )}
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

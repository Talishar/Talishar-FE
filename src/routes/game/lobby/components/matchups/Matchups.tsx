import { useAppSelector } from 'app/Hooks';
import { RootState } from 'app/Store';
import { useJoinGameMutation } from 'features/api/apiSlice';
import { getGameInfo } from 'features/game/GameSlice';
import { Matchup, LegalHero } from 'interface/API/GetLobbyRefresh.php';
import React, { useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import { toast } from 'react-hot-toast';
import { shallowEqual } from 'react-redux';
import { HEROES_OF_RATHE } from 'routes/index/components/filter/constants';
import { generateCroppedImageUrl } from 'utils/cropImages';
import styles from './Matchups.module.css';
import MatchupTooltip from './MatchupTooltip';

// A hero entry that has been resolved from a saved matchup or the legalHeroes
// list. `id` is whichever identifier we have (slug from backend, or card-ID
// from HEROES_OF_RATHE). `class` is empty when sourced from HEROES_OF_RATHE
// alone; populated when sourced from / overridden by backend `legalHeroes`.
type ResolvedHero = { id: string; name: string; class: string };

export interface Matchups {
  refetch: () => void;
  selectedMatchupId?: string | null;
  onMatchupSelected?: (matchupId: string) => void;
  isAutoApplyingMatchup?: boolean;
  onExpandChat?: () => void;
  isBazaarDeck?: boolean;
}

const Matchups = ({
  refetch,
  selectedMatchupId,
  onMatchupSelected,
  isAutoApplyingMatchup = false,
  onExpandChat,
  isBazaarDeck = false,
}: Matchups) => {
  const [isUpdating, setIsUpdating] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [noDataHero, setNoDataHero] = useState<{
    id: string;
    name: string;
    anchorRect: DOMRect;
  } | null>(null);

  const gameLobby = useAppSelector(
    (state: RootState) => state.game.gameLobby,
    shallowEqual
  );
  const { gameID, playerID } = useAppSelector(getGameInfo, shallowEqual);
  const [joinGameMutation] = useJoinGameMutation();

  const handleMatchupClick = async (matchupID: string) => {
    setIsUpdating(true);
    try {
      await joinGameMutation({
        gameName: gameID,
        playerID: playerID,
        fabdb: gameLobby?.myDeckLink ?? '',
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

  // Universe of all known heroes — used for resolveHero() so we can identify
  // a saved matchup as hero-backed even when the hero is banned in the current
  // format (e.g. Verdance saved against a CC deck → still recognized as a hero
  // even though Verdance is a Living Legend banned in CC). Always sources from
  // HEROES_OF_RATHE; backend's legalHeroes is layered on top to attach the
  // class string when available.
  const HERO_BY_NAME = useMemo(() => {
    const map = new Map<string, ResolvedHero>();
    for (const h of HEROES_OF_RATHE) {
      map.set(h.label.toLowerCase(), { id: h.value, name: h.label, class: '' });
    }
    // Layer in backend data when present — gives us the class string and the
    // slug-style id (vs. HEROES_OF_RATHE's card-ID style).
    for (const h of gameLobby?.legalHeroes ?? []) {
      map.set(h.name.toLowerCase(), { id: h.heroId, name: h.name, class: h.class });
    }
    return map;
  }, [gameLobby?.legalHeroes]);

  const HERO_BY_ID = useMemo(() => {
    const map = new Map<string, ResolvedHero>();
    // Card-ID keyed (e.g. "DYN113")
    for (const h of HEROES_OF_RATHE) {
      map.set(h.value, { id: h.value, name: h.label, class: '' });
    }
    // Slug-keyed from backend (e.g. "arakni_huntsman") — overrides where present
    for (const h of gameLobby?.legalHeroes ?? []) {
      map.set(h.heroId, { id: h.heroId, name: h.name, class: h.class });
    }
    return map;
  }, [gameLobby?.legalHeroes]);

  // Resolve a saved matchup to a hero entry if it conceptually targets one.
  // First try matchupId (slug or card ID), then the matchup's display name.
  const resolveHero = (m: { matchupId: string; name?: string | null }): ResolvedHero | null => {
    return (
      HERO_BY_ID.get(m.matchupId) ??
      (m.name ? HERO_BY_NAME.get(m.name.toLowerCase()) : undefined) ??
      null
    );
  };

  // Partition saved matchups into hero-backed (rendered as portrait) vs
  // custom-named (rendered as full-width button).
  //
  // When the backend provides `legalHeroes`, that list is authoritative —
  // hero matchups for heroes NOT in the legal list (e.g. saved against a
  // Living Legend then loaded into a CC deck) are dropped entirely. This
  // protects against deckbuilders that don't validate format bans on their
  // side. When the backend hasn't sent `legalHeroes`, all hero matchups
  // are shown (no ban data available to filter on).
  const { savedHeroMatchups, customMatchups } = useMemo(() => {
    const heroes: { hero: ResolvedHero; matchup: Matchup }[] = [];
    const customs: Matchup[] = [];

    const legalList = gameLobby?.legalHeroes;
    const legalSet =
      legalList && legalList.length > 0
        ? new Set<string>([
            ...legalList.map((h) => h.heroId),
            ...legalList.map((h) => h.name.toLowerCase()),
          ])
        : null;

    for (const m of gameLobby?.matchups ?? []) {
      const hero = resolveHero(m);
      if (hero) {
        if (legalSet) {
          const isLegal =
            legalSet.has(m.matchupId) ||
            (m.name ? legalSet.has(m.name.toLowerCase()) : false);
          if (!isLegal) continue; // banned hero in this format — drop entirely
        }
        heroes.push({ hero, matchup: m });
      } else {
        customs.push(m);
      }
    }
    return { savedHeroMatchups: heroes, customMatchups: customs };
  }, [gameLobby?.matchups, gameLobby?.legalHeroes, HERO_BY_ID, HERO_BY_NAME]);

  // Format-legal heroes that AREN'T already saved (the discovery grid for
  // Bazaar). Sourced exclusively from the backend's `legalHeroes` list —
  // it has already applied the format-tier and ban filters via CardClass()
  // and isBannedInFormat(). When the field isn't present on the response
  // (older backend), the discovery grid simply doesn't render — better than
  // guessing format legality on the FE.
  const unsavedHeroes = useMemo(() => {
    if (!isBazaarDeck) return [];
    const fromBackend = gameLobby?.legalHeroes;
    if (!fromBackend || fromBackend.length === 0) return [];
    const savedHeroIds = new Set(savedHeroMatchups.map((s) => s.hero.id));
    return fromBackend
      .filter((h) => !savedHeroIds.has(h.heroId))
      .map((h) => ({
        matchupId: h.heroId,
        name: h.name,
        class: h.class,
        preferredTurnOrder: null as string | null,
        notes: null as string | null,
        hasData: false,
      }));
  }, [savedHeroMatchups, isBazaarDeck, gameLobby?.legalHeroes]);

  const matchesSearch = (s: string) =>
    s.toLowerCase().includes(searchTerm.toLowerCase());

  // When the opponent's hero is known, sort the saved hero matchups so the one
  // targeting that hero is first (upper-left). Subsequent ordering is preserved.
  const sortedSavedHeroMatchups = useMemo(() => {
    const theirHero = gameLobby?.theirHero?.toLowerCase();
    if (!theirHero || theirHero === 'cardback') return savedHeroMatchups;
    const idx = savedHeroMatchups.findIndex(
      ({ matchup, hero }) =>
        matchup.matchupId.toLowerCase() === theirHero ||
        hero.id.toLowerCase() === theirHero
    );
    if (idx <= 0) return savedHeroMatchups; // not found, or already first
    const reordered = [...savedHeroMatchups];
    const [match] = reordered.splice(idx, 1);
    reordered.unshift(match);
    return reordered;
  }, [savedHeroMatchups, gameLobby?.theirHero]);

  const filteredSavedHeroMatchups = useMemo(
    () => sortedSavedHeroMatchups.filter(({ matchup, hero }) =>
      matchesSearch(matchup.name ?? hero.name)
    ),
    [sortedSavedHeroMatchups, searchTerm]
  );

  const filteredCustomMatchups = useMemo(
    () => customMatchups.filter((m) => matchesSearch(m.name ?? m.matchupId)),
    [customMatchups, searchTerm]
  );

  const filteredUnsavedHeroes = useMemo(
    () => unsavedHeroes.filter((h) => matchesSearch(h.name)),
    [unsavedHeroes, searchTerm]
  );

  // Group by backend-supplied class (e.g. "RUNEBLADE" -> "Runeblade").
  // Heroes whose `class` is empty bucket under "Other" as a safety net —
  // shouldn't happen in normal operation since the backend computes class
  // via CardClass() for every legal hero.
  const groupedMatchups = useMemo(() => {
    const groups: Record<string, typeof filteredUnsavedHeroes> = {};
    for (const h of filteredUnsavedHeroes) {
      const cls = h.class
        ? h.class.charAt(0) + h.class.slice(1).toLowerCase()
        : 'Other';
      if (!groups[cls]) groups[cls] = [];
      groups[cls].push(h);
    }
    return Object.keys(groups)
      .sort((a, b) => {
        if (a === 'Other') return 1;
        if (b === 'Other') return -1;
        return a.localeCompare(b);
      })
      .map((cls) => ({ cls, matchups: groups[cls] }));
  }, [filteredUnsavedHeroes]);

  if ((gameLobby?.matchups ?? []).length === 0) return null;

  return (
    <article className={styles.matchupContainer}>
      <div className={styles.matchupHeader}>
        <h4>Matchups</h4>
        {onExpandChat && (
          <button
            type="button"
            className={styles.chatToggleBtn}
            onClick={onExpandChat}
          >
            ◂ Chat
          </button>
        )}
      </div>
      <input
        type="text"
        placeholder="Search"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className={styles.searchInput}
      />
      {isAutoApplyingMatchup && (
        <p className={styles.autoApplyingStatus}>Applying hero matchup...</p>
      )}
      <div className={styles.groupsWrapper}>
        {(filteredSavedHeroMatchups.length > 0 || filteredCustomMatchups.length > 0) && (
          <div className={styles.classGroup}>
            <p className={styles.groupHeader}>SAVED PROFILES</p>
            {filteredSavedHeroMatchups.length > 0 && (
              <div className={styles.portraitGrid}>
                {filteredSavedHeroMatchups.map(({ hero, matchup }) => {
                  const isSelected = selectedMatchupId === matchup.matchupId;
                  return (
                    <MatchupTooltip key={matchup.matchupId} content={matchup.notes ?? null}>
                      <button
                        type="button"
                        disabled={isUpdating}
                        className={`${styles.portraitCard} ${isSelected ? styles.portraitCardSelected : ''}`}
                        onClick={(e) => {
                          e.preventDefault();
                          handleMatchupClick(matchup.matchupId);
                        }}
                      >
                        <img
                          src={generateCroppedImageUrl(hero.id)}
                          alt={matchup.name ?? hero.name}
                          className={`${styles.portraitImg} ${styles.portraitImgHasData}`}
                          onError={(e) => {
                            (e.target as HTMLImageElement).style.opacity = '0';
                          }}
                        />
                        <div className={styles.portraitOverlay}>
                          <span className={styles.portraitName}>
                            {matchup.name ?? hero.name}
                          </span>
                          {matchup.preferredTurnOrder && (
                            <span className={styles.turnOrderBadge}>
                              {matchup.preferredTurnOrder}
                            </span>
                          )}
                        </div>
                      </button>
                    </MatchupTooltip>
                  );
                })}
              </div>
            )}
            {filteredCustomMatchups.length > 0 && (
              <div className={styles.namedMatchupList}>
                {filteredCustomMatchups.map((m) => {
                  const isSelected = selectedMatchupId === m.matchupId;
                  return (
                    <MatchupTooltip key={m.matchupId} content={m.notes ?? null}>
                      <button
                        type="button"
                        disabled={isUpdating}
                        className={`${styles.namedMatchupItem} ${isSelected ? styles.namedMatchupSelected : ''}`}
                        onClick={(e) => {
                          e.preventDefault();
                          handleMatchupClick(m.matchupId);
                        }}
                      >
                        <span className={styles.namedMatchupName}>
                          {m.name ?? m.matchupId}
                        </span>
                        {m.preferredTurnOrder && (
                          <span className={styles.namedMatchupBadge}>
                            {m.preferredTurnOrder}
                          </span>
                        )}
                      </button>
                    </MatchupTooltip>
                  );
                })}
              </div>
            )}
          </div>
        )}
        {groupedMatchups.map(({ cls, matchups }) => (
          <div key={cls} className={styles.classGroup}>
            <p className={styles.groupHeader}>{cls.toUpperCase()}</p>
            <div className={styles.portraitGrid}>
              {matchups.map((matchup) => {
                const isSelected = selectedMatchupId === matchup.matchupId;
                return (
                  <MatchupTooltip key={matchup.matchupId} content={matchup.notes}>
                    <button
                      type="button"
                      disabled={isUpdating}
                      className={`${styles.portraitCard} ${isSelected ? styles.portraitCardSelected : ''}`}
                      onClick={(e) => {
                        e.preventDefault();
                        if (!matchup.hasData) {
                          const rect = (e.currentTarget as HTMLButtonElement).getBoundingClientRect();
                          setNoDataHero({
                            id: matchup.matchupId,
                            name: matchup.name,
                            anchorRect: rect,
                          });
                          return;
                        }
                        handleMatchupClick(matchup.matchupId);
                      }}
                    >
                      <img
                        src={generateCroppedImageUrl(matchup.matchupId)}
                        alt={matchup.name}
                        className={`${styles.portraitImg} ${matchup.hasData ? styles.portraitImgHasData : ''}`}
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.opacity = '0';
                        }}
                      />
                      <div className={styles.portraitOverlay}>
                        <span className={styles.portraitName}>{matchup.name}</span>
                        {matchup.preferredTurnOrder && (
                          <span className={styles.turnOrderBadge}>
                            {matchup.preferredTurnOrder}
                          </span>
                        )}
                      </div>
                    </button>
                  </MatchupTooltip>
                );
              })}
            </div>
          </div>
        ))}
      </div>
      {noDataHero &&
        createPortal(
          <NoDataPopover
            hero={noDataHero}
            onClose={() => setNoDataHero(null)}
            deckLink={gameLobby?.myDeckLink}
          />,
          document.body
        )}
    </article>
  );
};

const POPOVER_WIDTH = 260;
const POPOVER_GAP = 10;

const FAB_BAZAAR_DECK_PREFIX = 'https://fabbazaar.app/decks/';

const buildMatchupsLink = (deckLink: string | undefined): string | null => {
  if (!deckLink) return null;
  // FaB Bazaar exposes a /matchups subpath; deep-link straight there so the
  // user lands on the matchup-config page for the hero they just clicked.
  if (deckLink.startsWith(FAB_BAZAAR_DECK_PREFIX)) {
    const trimmed = deckLink.split('?')[0].replace(/\/+$/, '');
    return `${trimmed}/matchups`;
  }
  // Other deckbuilders: just open the deck page (we don't know if/where they
  // expose a matchups view).
  return deckLink;
};

const NoDataPopover = ({
  hero,
  onClose,
  deckLink,
}: {
  hero: { id: string; name: string; anchorRect: DOMRect };
  onClose: () => void;
  deckLink?: string;
}) => {
  const { anchorRect } = hero;
  const vw = window.innerWidth;
  const vh = window.innerHeight;

  // Anchor to the left of the hero card by default; flip to right side if no room
  let left = anchorRect.left - POPOVER_WIDTH - POPOVER_GAP;
  let placement: 'left' | 'right' = 'left';
  if (left < 8) {
    left = anchorRect.right + POPOVER_GAP;
    placement = 'right';
  }
  if (left + POPOVER_WIDTH > vw - 8) {
    left = vw - POPOVER_WIDTH - 8;
  }

  // Vertically center on the anchor, but keep within viewport
  let top = anchorRect.top + anchorRect.height / 2;
  const estimatedHeight = 150;
  top = Math.max(8 + estimatedHeight / 2, Math.min(top, vh - 8 - estimatedHeight / 2));

  return (
    <>
      <div className={styles.noDataBackdrop} onClick={onClose} />
      <div
        className={styles.noDataPopover}
        style={{
          top: `${top}px`,
          left: `${left}px`,
          transform: 'translateY(-50%)',
        }}
        data-placement={placement}
      >
        <button
          type="button"
          className={styles.noDataCloseX}
          onClick={onClose}
          aria-label="Close"
        >
          ×
        </button>
        <p className={styles.noDataTitle}>No matchup saved</p>
        <p className={styles.noDataBody}>
          No deck profile against <strong>{hero.name}</strong>. Save one in
          your deckbuilder to auto-apply sideboard adjustments.
        </p>
        {(() => {
          const matchupsHref = buildMatchupsLink(deckLink);
          if (!matchupsHref) return null;
          const isBazaar = matchupsHref.startsWith(FAB_BAZAAR_DECK_PREFIX);
          return (
            <a
              href={matchupsHref}
              target="_blank"
              rel="noopener noreferrer"
              className={styles.noDataLearnLink}
            >
              {isBazaar ? 'Configure matchup ↗' : 'Open deck ↗'}
            </a>
          );
        })()}
      </div>
    </>
  );
};

export default Matchups;

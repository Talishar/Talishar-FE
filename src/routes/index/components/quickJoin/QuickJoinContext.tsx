import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState
} from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from 'app/Hooks';
import { setGameStart } from 'features/game/GameSlice';
import {
  useJoinGameMutation,
  useGetFavoriteDecksQuery,
  useGetBazaarDecksQuery,
  useGetGameListQuery,
  useGetFindMatchStatusQuery,
  useFindMatchMutation
} from 'features/api/apiSlice';
import {
  FindMatchResponse,
  FindMatchStatusResponse
} from 'interface/API/GetFindMatchStatus.php';
import {
  selectMetafyId,
  selectCurrentUserName,
  selectMetafyHash,
  selectMetafyTimestamp
} from 'features/auth/authSlice';
import { generateCroppedImageUrl, getHeroCropFocusX } from 'utils/cropImages';
import { ImageSelectOption } from 'components/ImageSelect';
import { formatDeckLabel, getReadableFormatName } from 'utils/formatUtils';
import { FAB_BAZAAR_DECK_URL_BASE } from 'appConstants';
import useAuth from 'hooks/useAuth';
import { FavoriteDeck } from 'interface/API/GetFavoriteDecks.php';
import { BazaarDeck } from 'interface/API/GetBazaarDecks';
import useRustCounters, {
  requestRustPanelAttention
} from 'hooks/useRustCounters';
import { useTranslation } from 'react-i18next';
import {
  cleanServerMessage,
  describeThrownError,
  ServerError,
  ServerErrorCard,
  toServerError
} from 'utils/serverError';

const isValidDeckUrl = (value: string): boolean => {
  try {
    const url = new URL(value);
    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch {
    return false;
  }
};

const shortenFormat = (format: string): string => {
  if (!format) return '';
  if (format.toLowerCase() === 'classic constructed') return 'CC';
  const readable = getReadableFormatName(format);
  return readable || format;
};

export type JoinAttempt =
  | { ok: true }
  | {
      ok: false;
      error: string;
      cards?: ServerErrorCard[];
      lobbyTaken: boolean;
    };

// Errors about the lobby rather than the deck: Find match tries the next one.
const LOBBY_TAKEN_ERRORS = [
  /already joined/i,
  /kicked from this lobby/i,
  /lobby is looking to play against specific heroes/i,
  /not interested in playing against your hero/i,
  /unable to join this game/i,
  /lobby no longer exists/i
];

interface QuickJoinContextType {
  deckSource: 'talishar' | 'bazaar';
  selectedFavoriteDeck: string;
  selectedFavoriteDeckHero: string | null;
  /** Set ID of the active deck's hero, null for an imported URL or no deck */
  selectedDeckHero: string | null;
  selectedBazaarDeck: string;
  importDeckUrl: string;
  saveDeck: boolean;
  detectedFormat: string | null;
  error: ServerError | null;
  importDeckError: string | null;
  isJoining: boolean;
  hasDeckConfigured: boolean;
  favoriteDeckOptions: ImageSelectOption[];
  isFavoritesLoading: boolean;
  bazaarDeckOptions: ImageSelectOption[];
  isBazaarLoading: boolean;
  bazaarError: string | null;
  metafyHash: string | null;
  isBazaarEnabled: boolean;
  isRustLocked: boolean;
  /** URL-ready fabdb value that accounts for the active deck source */
  effectiveFabdb: string;
  /** Talishar deck key that accounts for the active deck source */
  effectiveFavoriteDecks: string;
  setDeckSource: (v: 'talishar' | 'bazaar') => void;
  setSelectedFavoriteDeck: (v: string) => void;
  setSelectedBazaarDeck: (v: string) => void;
  setImportDeckUrl: (v: string) => void;
  setSaveDeck: (v: boolean) => void;
  setError: (v: ServerError | null) => void;
  quickJoin: (gameName: number) => Promise<void>;
  /** Joins with the active deck (or `fabdb`) and reports failures instead of showing them */
  joinWithDeck: (
    gameName: number,
    options?: { fabdb?: string; findMatch?: boolean }
  ) => Promise<JoinAttempt>;
  /** Format, hero preference and (for precon) hero from the create form, used by Find match */
  setFindMatchCriteria: (
    format: string,
    preference: string,
    hero?: string | null
  ) => void;
  findMatchStatus: FindMatchStatusResponse | undefined;
  isFindMatchFetching: boolean;
  /** One server-side Find match decision for the current criteria */
  findMatchStep: (exclude: number[]) => Promise<FindMatchResponse>;
  cancelFindMatchTicket: (ticket: string) => void;
}

const QuickJoinContext = createContext<QuickJoinContextType | null>(null);

const LS_FAVE_DECK_KEY = 'quickJoin_favoriteDeck';
const LS_IMPORT_URL_KEY = 'quickJoin_importUrl';
const LS_SAVE_DECK_KEY = 'quickJoin_saveDeck';
const LS_DECK_SOURCE_KEY = 'quickJoin_deckSource';
const LS_BAZAAR_DECK_KEY = 'quickJoin_bazaarDeck';

export const QuickJoinProvider = ({
  children
}: {
  children: React.ReactNode;
}) => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const [joinGame] = useJoinGameMutation();
  const { isLoggedIn, isLoading: isAuthLoading } = useAuth();
  const { isRustLocked } = useRustCounters();
  const metafyHash = useAppSelector(selectMetafyHash);
  const metafyTimestamp = useAppSelector(selectMetafyTimestamp);
  const metafyId = useAppSelector(selectMetafyId);
  const currentUserName = useAppSelector(selectCurrentUserName);
  const isBazaarEnabled = true;
  const canResolveBazaarAccess =
    !isAuthLoading && (!isLoggedIn || !!currentUserName);

  const { data: favoritesData, isLoading: isFavoritesQueryLoading } =
    useGetFavoriteDecksQuery(undefined, {
      skip: isAuthLoading || !isLoggedIn || !currentUserName
    });
  const isFavoritesLoading =
    isAuthLoading ||
    (isLoggedIn && !currentUserName) ||
    isFavoritesQueryLoading;

  const [deckSource, setDeckSourceState] = useState<'talishar' | 'bazaar'>(
    () =>
      (localStorage.getItem(LS_DECK_SOURCE_KEY) as 'talishar' | 'bazaar') ??
      'talishar'
  );
  const [selectedFavoriteDeck, setSelectedFavoriteDeckState] = useState<string>(
    () => localStorage.getItem(LS_FAVE_DECK_KEY) ?? ''
  );
  const [selectedBazaarDeck, setSelectedBazaarDeckState] = useState<string>(
    () => localStorage.getItem(LS_BAZAAR_DECK_KEY) ?? ''
  );
  const [importDeckUrl, setImportDeckUrlState] = useState<string>(
    () => localStorage.getItem(LS_IMPORT_URL_KEY) ?? ''
  );
  const [saveDeck, setSaveDeckState] = useState<boolean>(
    () => localStorage.getItem(LS_SAVE_DECK_KEY) === 'true'
  );
  const [detectedFormat, setDetectedFormat] = useState<string | null>(null);
  const [error, setError] = useState<ServerError | null>(null);
  const [importDeckError, setImportDeckError] = useState<string | null>(null);
  const [isJoining, setIsJoining] = useState(false);

  const canFetchBazaar =
    !isAuthLoading &&
    isLoggedIn &&
    deckSource === 'bazaar' &&
    !!metafyId &&
    !!metafyHash &&
    !!metafyTimestamp;
  const {
    data: bazaarData,
    isLoading: isBazaarQueryLoading,
    error: bazaarFetchError
  } = useGetBazaarDecksQuery(
    {
      metafyId: metafyId!,
      metafyHash: metafyHash!,
      metafyTimestamp: metafyTimestamp!
    },
    { skip: !canFetchBazaar }
  );

  const isBazaarLoading =
    isAuthLoading || (isLoggedIn && !currentUserName) || isBazaarQueryLoading;

  const favoriteDeckOptions: ImageSelectOption[] = useMemo(() => {
    if (!favoritesData?.favoriteDecks) return [];
    return [...favoritesData.favoriteDecks].reverse().map((deck) => ({
      value: deck.key,
      label: formatDeckLabel(deck.name, deck.format, {
        shorten: shortenFormat
      }),
      imageUrl: generateCroppedImageUrl(deck.hero),
      imageFocusX: getHeroCropFocusX(deck.hero)
    }));
  }, [favoritesData?.favoriteDecks]);

  const selectedFavoriteDeckHero = useMemo(
    () =>
      favoritesData?.favoriteDecks.find(
        (deck: FavoriteDeck) => deck.key === selectedFavoriteDeck
      )?.hero ?? null,
    [favoritesData?.favoriteDecks, selectedFavoriteDeck]
  );

  const bazaarDeckOptions: ImageSelectOption[] = useMemo(() => {
    if (!bazaarData?.decks) return [];
    return bazaarData.decks.map((deck: BazaarDeck) => ({
      value: deck.id ?? deck.deckId ?? '',
      label: formatDeckLabel(deck.name, deck.format ?? null, {
        shorten: shortenFormat
      }),
      imageUrl: deck.hero ? generateCroppedImageUrl(deck.hero) : undefined,
      imageFocusX: getHeroCropFocusX(deck.hero)
    }));
  }, [bazaarData?.decks]);

  const bazaarError: string | null = useMemo(() => {
    if (!bazaarFetchError) return null;
    if (
      typeof bazaarFetchError === 'object' &&
      'data' in bazaarFetchError &&
      (bazaarFetchError.data as any)?.error
    ) {
      return (bazaarFetchError.data as any).error;
    }
    return 'Failed to load FaB Bazaar decks';
  }, [bazaarFetchError]);

  const selectedBazaarDeckHero = useMemo(
    () =>
      bazaarData?.decks?.find(
        (deck: BazaarDeck) => (deck.id ?? deck.deckId) === selectedBazaarDeck
      )?.hero ?? null,
    [bazaarData?.decks, selectedBazaarDeck]
  );
  const selectedDeckHero =
    deckSource === 'bazaar'
      ? selectedBazaarDeckHero
      : selectedFavoriteDeck
      ? selectedFavoriteDeckHero
      : null;

  const [findMatchCriteria, setFindMatchCriteriaState] = useState<{
    format: string;
    preference: string;
    hero: string | null;
  }>({
    format: '',
    preference: '',
    hero: null
  });
  const setFindMatchCriteria = useCallback(
    (format: string, preference: string, hero: string | null = null) =>
      setFindMatchCriteriaState((prev) =>
        prev.format === format &&
        prev.preference === preference &&
        prev.hero === hero
          ? prev
          : { format, preference, hero }
      ),
    []
  );
  const canCheckFindMatch = !isAuthLoading && isLoggedIn && !!currentUserName;
  const findMatchArgs = useMemo(
    () => ({
      hero: findMatchCriteria.hero ?? selectedDeckHero ?? '',
      preference: findMatchCriteria.preference,
      format: findMatchCriteria.format
    }),
    [selectedDeckHero, findMatchCriteria]
  );
  const {
    currentData: findMatchStatus,
    isFetching: isFindMatchFetching,
    refetch: refetchFindMatchStatus
  } = useGetFindMatchStatusQuery(findMatchArgs, {
    skip: !canCheckFindMatch,
    refetchOnMountOrArgChange: true
  });
  const [findMatch] = useFindMatchMutation();

  // The game list already polls; re-check Find match only when its lobbies change.
  const { data: gameListData } = useGetGameListQuery(undefined, {
    skip: !canCheckFindMatch
  });
  const openGamesKey = useMemo(
    () =>
      (gameListData?.openGames ?? [])
        .map(
          (game) =>
            `${game.gameName}:${game.format}:${game.p1Hero ?? ''}:${
              game.description ?? ''
            }`
        )
        .join('|'),
    [gameListData?.openGames]
  );
  const lastOpenGamesKey = useRef<string | null>(null);
  useEffect(() => {
    if (!canCheckFindMatch || !gameListData) return;
    if (lastOpenGamesKey.current === null) {
      lastOpenGamesKey.current = openGamesKey;
      return;
    }
    if (lastOpenGamesKey.current === openGamesKey) return;
    lastOpenGamesKey.current = openGamesKey;
    refetchFindMatchStatus();
  }, [canCheckFindMatch, gameListData, openGamesKey, refetchFindMatchStatus]);

  const findMatchStep = useCallback(
    async (exclude: number[]): Promise<FindMatchResponse> => {
      try {
        return await findMatch({ ...findMatchArgs, exclude }).unwrap();
      } catch (err) {
        return { error: describeThrownError(err, t('NOTICE.JOIN_FAILED')) };
      }
    },
    [findMatch, findMatchArgs, t]
  );

  const cancelFindMatchTicket = useCallback(
    (ticket: string) => {
      findMatch({ cancel: ticket }).catch(() => undefined);
    },
    [findMatch]
  );

  useEffect(() => {
    if (!selectedFavoriteDeck || !favoritesData?.favoriteDecks) {
      if (!importDeckUrl) setDetectedFormat(null);
      return;
    }
    const found = favoritesData.favoriteDecks.find(
      (deck: FavoriteDeck) => deck.key === selectedFavoriteDeck
    );
    if (found?.format) {
      setDetectedFormat(getReadableFormatName(found.format));
    } else {
      setDetectedFormat(null);
    }
  }, [selectedFavoriteDeck, favoritesData?.favoriteDecks, importDeckUrl]);

  // If FaB Bazaar isn't enabled for this user, reset any stale 'bazaar' value so the
  // disabled tab doesn't get the active class from localStorage.
  useEffect(() => {
    if (canResolveBazaarAccess && !isBazaarEnabled && deckSource === 'bazaar') {
      setDeckSourceState('talishar');
      localStorage.setItem(LS_DECK_SOURCE_KEY, 'talishar');
    }
  }, [canResolveBazaarAccess, isBazaarEnabled, deckSource]);

  const setDeckSource = useCallback((v: 'talishar' | 'bazaar') => {
    setDeckSourceState(v);
    localStorage.setItem(LS_DECK_SOURCE_KEY, v);
    setError(null);
    setImportDeckError(null);
  }, []);

  const setSelectedFavoriteDeck = useCallback((v: string) => {
    setSelectedFavoriteDeckState(v);
    localStorage.setItem(LS_FAVE_DECK_KEY, v);
    if (v) {
      setImportDeckUrlState('');
      localStorage.setItem(LS_IMPORT_URL_KEY, '');
    }
    setError(null);
    setImportDeckError(null);
  }, []);

  const setSelectedBazaarDeck = useCallback((v: string) => {
    setSelectedBazaarDeckState(v);
    localStorage.setItem(LS_BAZAAR_DECK_KEY, v);
    setError(null);
  }, []);

  const setImportDeckUrl = useCallback((v: string) => {
    setImportDeckUrlState(v);
    localStorage.setItem(LS_IMPORT_URL_KEY, v);
    if (v) {
      setSelectedFavoriteDeckState('');
      localStorage.setItem(LS_FAVE_DECK_KEY, '');
      setDetectedFormat(null);
    }
    setError(null);
    setImportDeckError(null);
  }, []);

  useEffect(() => {
    const decks = favoritesData?.favoriteDecks;
    if (!selectedFavoriteDeck || !decks) return;
    if (decks.some((deck: FavoriteDeck) => deck.key === selectedFavoriteDeck))
      return;
    setSelectedFavoriteDeck(decks.length ? decks[decks.length - 1].key : '');
  }, [
    favoritesData?.favoriteDecks,
    selectedFavoriteDeck,
    setSelectedFavoriteDeck
  ]);

  const setSaveDeck = useCallback((v: boolean) => {
    setSaveDeckState(v);
    localStorage.setItem(LS_SAVE_DECK_KEY, String(v));
  }, []);

  const hasDeckConfigured =
    deckSource === 'bazaar'
      ? !!selectedBazaarDeck
      : !!(selectedFavoriteDeck || importDeckUrl.trim());

  const effectiveFabdb = useMemo(() => {
    if (deckSource === 'bazaar' && selectedBazaarDeck) {
      return `${FAB_BAZAAR_DECK_URL_BASE}${selectedBazaarDeck}`;
    }
    return importDeckUrl;
  }, [deckSource, selectedBazaarDeck, importDeckUrl]);

  const effectiveFavoriteDecks =
    deckSource === 'talishar' ? selectedFavoriteDeck : '';

  const joinWithDeck = useCallback(
    async (
      gameName: number,
      options?: { fabdb?: string; findMatch?: boolean }
    ): Promise<JoinAttempt> => {
      try {
        const overrideDeck = options?.fabdb;
        const isBazaar = !overrideDeck && deckSource === 'bazaar';
        const fabdbValue =
          overrideDeck ??
          (isBazaar
            ? `${FAB_BAZAAR_DECK_URL_BASE}${selectedBazaarDeck}`
            : importDeckUrl.trim());
        const favDecksValue =
          overrideDeck || isBazaar ? '' : selectedFavoriteDeck;
        // Only save deck if it's from importDeckUrl (not from favorites or bazaar)
        const shouldSaveDeck =
          !overrideDeck && !isBazaar && saveDeck && importDeckUrl.trim() !== '';

        const response = await joinGame({
          gameName,
          playerID: 2,
          deck: '',
          fabdb: fabdbValue,
          deckTestMode: false,
          decksToTry: '',
          favoriteDeck: shouldSaveDeck,
          favoriteDecks: favDecksValue,
          gameDescription: ''
        }).unwrap();

        if (response.error) {
          const message = cleanServerMessage(response.error);
          return {
            ok: false,
            error: message,
            cards: response.errorCards,
            lobbyTaken: LOBBY_TAKEN_ERRORS.some((pattern) =>
              pattern.test(message)
            )
          };
        }
        if (options?.findMatch && response.gameStarted) {
          return {
            ok: false,
            error: t('FIND_MATCH.LOBBY_TAKEN'),
            lobbyTaken: true
          };
        }

        const authKeyToUse = response.authKey ?? '';
        const playerIDToUse = response.playerID ?? 0;
        // Ensure gameID is always a number (backend might return string)
        const gameIDToUse =
          typeof response.gameName === 'number'
            ? response.gameName
            : parseInt(String(response.gameName ?? 0));

        dispatch(
          setGameStart({
            playerID: playerIDToUse,
            gameID: gameIDToUse,
            authKey: authKeyToUse,
            bazaarDeckId: isBazaar ? selectedBazaarDeck : undefined
          })
        );

        // Reset save deck checkbox after successful join
        setSaveDeck(false);

        navigate(`/game/lobby/${gameIDToUse}`, {
          state: {
            playerID: playerIDToUse,
            authKey: authKeyToUse
          }
        });
        return { ok: true };
      } catch (err) {
        const message = describeThrownError(err, t('NOTICE.JOIN_FAILED'));
        return {
          ok: false,
          error: message,
          lobbyTaken: LOBBY_TAKEN_ERRORS.some((pattern) =>
            pattern.test(message)
          )
        };
      }
    },
    [
      joinGame,
      selectedFavoriteDeck,
      importDeckUrl,
      saveDeck,
      deckSource,
      selectedBazaarDeck,
      dispatch,
      navigate,
      setSaveDeck,
      t
    ]
  );

  const quickJoin = useCallback(
    async (gameName: number) => {
      if (isAuthLoading || !isLoggedIn || !currentUserName) return;
      if (isRustLocked) {
        requestRustPanelAttention();
        return;
      }
      if (
        deckSource === 'talishar' &&
        !selectedFavoriteDeck &&
        !isValidDeckUrl(importDeckUrl.trim())
      ) {
        setError(null);
        setImportDeckError(t('JOIN.INVALID_DECK_URL'));
        return;
      }
      setError(null);
      setImportDeckError(null);
      setIsJoining(true);
      const result = await joinWithDeck(gameName);
      if (!result.ok) setError(toServerError(result.error, result.cards));
      setIsJoining(false);
    },
    [
      isAuthLoading,
      isLoggedIn,
      currentUserName,
      selectedFavoriteDeck,
      importDeckUrl,
      deckSource,
      joinWithDeck,
      isRustLocked,
      t
    ]
  );

  const value: QuickJoinContextType = {
    deckSource,
    selectedFavoriteDeck,
    selectedFavoriteDeckHero,
    selectedDeckHero,
    selectedBazaarDeck,
    importDeckUrl,
    saveDeck,
    detectedFormat,
    error,
    importDeckError,
    isJoining,
    hasDeckConfigured,
    favoriteDeckOptions,
    isFavoritesLoading,
    bazaarDeckOptions,
    isBazaarLoading,
    bazaarError,
    metafyHash,
    isBazaarEnabled,
    isRustLocked,
    effectiveFabdb,
    effectiveFavoriteDecks,
    setDeckSource,
    setSelectedFavoriteDeck,
    setSelectedBazaarDeck,
    setImportDeckUrl,
    setSaveDeck,
    setError,
    quickJoin,
    joinWithDeck,
    setFindMatchCriteria,
    findMatchStatus,
    isFindMatchFetching,
    findMatchStep,
    cancelFindMatchTicket
  };

  return (
    <QuickJoinContext.Provider value={value}>
      {children}
    </QuickJoinContext.Provider>
  );
};

export const useQuickJoin = (): QuickJoinContextType => {
  const ctx = useContext(QuickJoinContext);
  if (!ctx)
    throw new Error('useQuickJoin must be used inside <QuickJoinProvider>');
  return ctx;
};

/** Returns the context value, or null when called outside a <QuickJoinProvider>. */
export const useQuickJoinOptional = (): QuickJoinContextType | null => {
  return useContext(QuickJoinContext);
};

export default QuickJoinContext;

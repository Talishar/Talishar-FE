import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState
} from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from 'app/Hooks';
import { setGameStart } from 'features/game/GameSlice';
import {
  useJoinGameMutation,
  useGetFavoriteDecksQuery,
  useGetBazaarDecksQuery
} from 'features/api/apiSlice';
import { selectCurrentUser, selectMetafyHash } from 'features/auth/authSlice';
import { generateCroppedImageUrl } from 'utils/cropImages';
import { ImageSelectOption } from 'components/ImageSelect';
import { getReadableFormatName } from 'utils/formatUtils';
import { FAB_BAZAAR_DECK_URL_BASE } from 'appConstants';

const shortenFormat = (format: string): string => {
  if (!format) return '';
  if (format.toLowerCase() === 'classic constructed') return 'CC';
  const readable = getReadableFormatName(format);
  return readable || format;
};

const formatDeckLabel = (
  deckName: string,
  format: string | null,
  maxLength: number = 58
): string => {
  const formatStr = format ? ` (${shortenFormat(format)})` : '';
  const combined = `${deckName}${formatStr}`;

  if (combined.length <= maxLength) {
    return combined;
  }

  const availableForName = Math.max(1, maxLength - formatStr.length - 3);
  return `${deckName.substring(0, availableForName)}...${formatStr}`;
};

interface QuickJoinContextType {
  deckSource: 'talishar' | 'bazaar';
  selectedFavoriteDeck: string;
  selectedBazaarDeck: string;
  importDeckUrl: string;
  saveDeck: boolean;
  detectedFormat: string | null;
  error: string | null;
  isJoining: boolean;
  hasDeckConfigured: boolean;
  favoriteDeckOptions: ImageSelectOption[];
  isFavoritesLoading: boolean;
  bazaarDeckOptions: ImageSelectOption[];
  isBazaarLoading: boolean;
  bazaarError: string | null;
  metafyHash: string | null;
  /** URL-ready fabdb value that accounts for the active deck source */
  effectiveFabdb: string;
  /** Talishar deck key that accounts for the active deck source */
  effectiveFavoriteDecks: string;
  setDeckSource: (v: 'talishar' | 'bazaar') => void;
  setSelectedFavoriteDeck: (v: string) => void;
  setSelectedBazaarDeck: (v: string) => void;
  setImportDeckUrl: (v: string) => void;
  setSaveDeck: (v: boolean) => void;
  setError: (v: string | null) => void;
  quickJoin: (gameName: number) => Promise<void>;
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
  const dispatch = useAppDispatch();
  const [joinGame] = useJoinGameMutation();
  const metafyHash = useAppSelector(selectMetafyHash);
  const metafyId = useAppSelector(selectCurrentUser);

  const { data: favoritesData, isLoading: isFavoritesLoading } =
    useGetFavoriteDecksQuery(undefined);

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
  const [error, setError] = useState<string | null>(null);
  const [isJoining, setIsJoining] = useState(false);

  const canFetchBazaar = deckSource === 'bazaar' && !!metafyId && !!metafyHash;
  const {
    data: bazaarData,
    isLoading: isBazaarLoading,
    error: bazaarFetchError
  } = useGetBazaarDecksQuery(
    { metafyId: metafyId!, metafyHash: metafyHash! },
    { skip: !canFetchBazaar }
  );

  const favoriteDeckOptions: ImageSelectOption[] = useMemo(() => {
    if (!favoritesData?.favoriteDecks) return [];
    return favoritesData.favoriteDecks.map((deck) => ({
      value: deck.key,
      label: formatDeckLabel(deck.name, deck.format),
      imageUrl: generateCroppedImageUrl(deck.hero)
    }));
  }, [favoritesData?.favoriteDecks]);

  const bazaarDeckOptions: ImageSelectOption[] = useMemo(() => {
    if (!bazaarData?.decks) return [];
    return bazaarData.decks.map((deck) => ({
      value: deck.deckId,
      label: deck.name
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

  useEffect(() => {
    if (!selectedFavoriteDeck || !favoritesData?.favoriteDecks) {
      if (!importDeckUrl) setDetectedFormat(null);
      return;
    }
    const found = favoritesData.favoriteDecks.find(
      (deck) => deck.key === selectedFavoriteDeck
    );
    if (found?.format) {
      setDetectedFormat(getReadableFormatName(found.format));
    } else {
      setDetectedFormat(null);
    }
  }, [selectedFavoriteDeck, favoritesData?.favoriteDecks, importDeckUrl]);

  const setDeckSource = useCallback((v: 'talishar' | 'bazaar') => {
    setDeckSourceState(v);
    localStorage.setItem(LS_DECK_SOURCE_KEY, v);
    setError(null);
  }, []);

  const setSelectedFavoriteDeck = useCallback((v: string) => {
    setSelectedFavoriteDeckState(v);
    localStorage.setItem(LS_FAVE_DECK_KEY, v);
    if (v) {
      setImportDeckUrlState('');
      localStorage.setItem(LS_IMPORT_URL_KEY, '');
    }
    setError(null);
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
  }, []);

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

  const effectiveFavoriteDecks = deckSource === 'talishar' ? selectedFavoriteDeck : '';

  const quickJoin = useCallback(
    async (gameName: number) => {
      setError(null);
      setIsJoining(true);
      try {
        const isBazaar = deckSource === 'bazaar';
        const fabdbValue = isBazaar
          ? `${FAB_BAZAAR_DECK_URL_BASE}${selectedBazaarDeck}`
          : importDeckUrl.trim();
        const favDecksValue = isBazaar ? '' : selectedFavoriteDeck;
        // Only save deck if it's from importDeckUrl (not from favorites or bazaar)
        const shouldSaveDeck = !isBazaar && saveDeck && importDeckUrl.trim() !== '';

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
          throw response.error;
        }

        console.log('[QuickJoin] JoinGame response:', {
          playerID: response.playerID,
          gameName: response.gameName,
          authKey: response.authKey,
          hasAuthKey: !!response.authKey,
          authKeyLength: response.authKey?.length ?? 0
        });

        const authKeyToUse = response.authKey ?? '';
        const playerIDToUse = response.playerID ?? 0;
        // Ensure gameID is always a number (backend might return string)
        const gameIDToUse =
          typeof response.gameName === 'number'
            ? response.gameName
            : parseInt(String(response.gameName ?? 0));

        console.log('[QuickJoin] About to dispatch setGameStart with:', {
          playerID: playerIDToUse,
          gameID: gameIDToUse,
          gameIDType: typeof gameIDToUse,
          authKey: authKeyToUse,
          authKeyEmpty: authKeyToUse === ''
        });

        dispatch(
          setGameStart({
            playerID: playerIDToUse,
            gameID: gameIDToUse,
            authKey: authKeyToUse
          })
        );

        // Reset save deck checkbox after successful join
        setSaveDeck(false);

        console.log(
          '[QuickJoin] setGameStart dispatched, now navigating to:',
          `/game/lobby/${gameIDToUse}`
        );

        navigate(`/game/lobby/${gameIDToUse}`, {
          state: {
            playerID: playerIDToUse,
            authKey: authKeyToUse
          }
        });
      } catch (err: any) {
        const message =
          typeof err === 'string' ? err : err?.message ?? String(err);
        setError(message);
      } finally {
        setIsJoining(false);
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
      setSaveDeck
    ]
  );

  const value: QuickJoinContextType = {
    deckSource,
    selectedFavoriteDeck,
    selectedBazaarDeck,
    importDeckUrl,
    saveDeck,
    detectedFormat,
    error,
    isJoining,
    hasDeckConfigured,
    favoriteDeckOptions,
    isFavoritesLoading,
    bazaarDeckOptions,
    isBazaarLoading,
    bazaarError,
    metafyHash,
    effectiveFabdb,
    effectiveFavoriteDecks,
    setDeckSource,
    setSelectedFavoriteDeck,
    setSelectedBazaarDeck,
    setImportDeckUrl,
    setSaveDeck,
    setError,
    quickJoin
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

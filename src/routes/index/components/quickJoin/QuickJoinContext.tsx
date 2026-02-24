import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState
} from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch } from 'app/Hooks';
import { setGameStart } from 'features/game/GameSlice';
import { useJoinGameMutation, useGetFavoriteDecksQuery } from 'features/api/apiSlice';
import { generateCroppedImageUrl } from 'utils/cropImages';
import { ImageSelectOption } from 'components/ImageSelect';
import { getReadableFormatName } from 'utils/formatUtils';

const shortenFormat = (format: string): string => {
  if (!format) return '';
  if (format.toLowerCase() === 'classic constructed') return 'CC';
  const readable = getReadableFormatName(format);
  return readable || format;
};

interface QuickJoinContextType {
  selectedFavoriteDeck: string;
  importDeckUrl: string;
  saveDeck: boolean;
  detectedFormat: string | null;
  error: string | null;
  isJoining: boolean;
  hasDeckConfigured: boolean;
  favoriteDeckOptions: ImageSelectOption[];
  isFavoritesLoading: boolean;
  setSelectedFavoriteDeck: (v: string) => void;
  setImportDeckUrl: (v: string) => void;
  setSaveDeck: (v: boolean) => void;
  setError: (v: string | null) => void;
  quickJoin: (gameName: number) => Promise<void>;
}

const QuickJoinContext = createContext<QuickJoinContextType | null>(null);

const LS_FAVE_DECK_KEY = 'quickJoin_favoriteDeck';
const LS_IMPORT_URL_KEY = 'quickJoin_importUrl';
const LS_SAVE_DECK_KEY = 'quickJoin_saveDeck';

export const QuickJoinProvider = ({ children }: { children: React.ReactNode }) => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const [joinGame] = useJoinGameMutation();
  const { data: favoritesData, isLoading: isFavoritesLoading } = useGetFavoriteDecksQuery(undefined);

  const [selectedFavoriteDeck, setSelectedFavoriteDeckState] = useState<string>(
    () => localStorage.getItem(LS_FAVE_DECK_KEY) ?? ''
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

  const favoriteDeckOptions: ImageSelectOption[] = useMemo(() => {
    if (!favoritesData?.favoriteDecks) return [];
    return favoritesData.favoriteDecks.map((deck) => ({
      value: deck.key,
      label: `${deck.name}${deck.format ? ` (${shortenFormat(deck.format)})` : ''}`,
      imageUrl: generateCroppedImageUrl(deck.hero)
    }));
  }, [favoritesData?.favoriteDecks]);

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

  const setSelectedFavoriteDeck = useCallback((v: string) => {
    setSelectedFavoriteDeckState(v);
    localStorage.setItem(LS_FAVE_DECK_KEY, v);
    if (v) {
      setImportDeckUrlState('');
      localStorage.setItem(LS_IMPORT_URL_KEY, '');
    }
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

  const hasDeckConfigured = !!(selectedFavoriteDeck || importDeckUrl.trim());

  const quickJoin = useCallback(
    async (gameName: number) => {
      setError(null);
      setIsJoining(true);
      try {
        const response = await joinGame({
          gameName,
          playerID: 2,
          deck: '',
          fabdb: importDeckUrl.trim() || '',
          deckTestMode: false,
          decksToTry: '',
          favoriteDeck: saveDeck,
          favoriteDecks: selectedFavoriteDeck || '',
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
        const gameIDToUse = typeof response.gameName === 'number' 
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

        console.log('[QuickJoin] setGameStart dispatched, now navigating to:', `/game/lobby/${gameIDToUse}`);

        navigate(`/game/lobby/${gameIDToUse}`, {
          state: { 
            playerID: playerIDToUse,
            authKey: authKeyToUse
          }
        });
      } catch (err: any) {
        const message = typeof err === 'string' ? err : err?.message ?? String(err);
        setError(message);
      } finally {
        setIsJoining(false);
      }
    },
    [joinGame, selectedFavoriteDeck, importDeckUrl, saveDeck, dispatch, navigate]
  );

  const value: QuickJoinContextType = {
    selectedFavoriteDeck,
    importDeckUrl,
    saveDeck,
    detectedFormat,
    error,
    isJoining,
    hasDeckConfigured,
    favoriteDeckOptions,
    isFavoritesLoading,
    setSelectedFavoriteDeck,
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
  if (!ctx) throw new Error('useQuickJoin must be used inside <QuickJoinProvider>');
  return ctx;
};

export default QuickJoinContext;

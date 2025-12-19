import React, { useEffect, useMemo, useState } from 'react';
import { useAppDispatch } from 'app/Hooks';
import {
  useGetFavoriteDecksQuery,
  useJoinGameMutation,
  useGetGameListQuery,
  useGetGameInfoQuery
} from 'features/api/apiSlice';
import { JoinGameAPI } from 'interface/API/JoinGame.php';
import { Link, useNavigate, useParams } from 'react-router-dom';
import styles from './Join.module.css';
import { useKnownSearchParams } from 'hooks/useKnownSearchParams';
import { setGameStart } from 'features/game/GameSlice';
import { toast } from 'react-hot-toast';
import { FaExclamationCircle } from 'react-icons/fa';
import validationSchema from './validationSchema';
import useAuth from 'hooks/useAuth';
import classNames from 'classnames';
import { SubmitHandler, useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { ErrorMessage } from '@hookform/error-message';
import { generateCroppedImageUrl } from 'utils/cropImages';
import { ImageSelect, ImageSelectOption } from 'components/ImageSelect';
import { GAME_FORMAT, isPreconFormat, PRECON_DECKS } from 'appConstants';
import GoogleAdSense from 'components/GoogleAdSense';
import { getReadableFormatName } from 'utils/formatUtils';

// Helper function to extract base format type for matching
// "Open CC", "Competitive CC", "Classic Constructed" all map to "Classic Constructed" base
const getBaseFormatType = (format: string | null): string => {
  if (!format) return '';
  const readable = getReadableFormatName(format).toLowerCase();
  
  // Extract base format by removing qualifiers like "open", "competitive"
  if (readable.includes('living legend') || readable.includes('ll')) return 'living legend';
  if (readable.includes('classic constructed') || readable.includes('cc')) return 'classic constructed';
  if (readable.includes('blitz')) return 'blitz';
  if (readable.includes('silver age') || readable.includes('sage')) return 'silver age';
  if (readable.includes('commoner')) return 'commoner';
  if (readable.includes('clash')) return 'clash';
  if (readable.includes('sealed')) return 'sealed';
  if (readable.includes('draft') || readable.includes('limited')) return 'draft / limited';
  if (readable.includes('precon')) return 'preconstructed decks';
  
  return readable;
};

// Helper function to normalize format for comparison (backend format codes vs deck format names)
const normalizeFormatForComparison = (format: string | null): string => {
  if (!format) return '';
  return getReadableFormatName(format).toLowerCase();
};

// Helper function to shorten format names
const shortenFormat = (format: string): string => {
  if (!format) return '';
  if (format.toLowerCase() === 'classic constructed') return 'CC';
  // Capitalize first letter of other formats
  return format.charAt(0).toUpperCase() + format.slice(1).toLowerCase();
};

const JoinGame = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const [joinGame, joinGameResult] = useJoinGameMutation();
  const { data, isLoading, isSuccess } = useGetFavoriteDecksQuery(undefined);
  const { isLoggedIn } = useAuth();

  let [{ gameName: searchGameName = '0', playerID = '2', authKey = '' }] =
    useKnownSearchParams();

  const { gameID } = useParams();
  const finalGameName = gameID ?? searchGameName;

  // Fetch game list to get the format for this specific game
  const { data: gameListData, isLoading: gameListLoading } = useGetGameListQuery(undefined);

  // Fallback: fetch game info directly if not in public list
  const { data: gameInfoData } = useGetGameInfoQuery(finalGameName, {
    skip: gameListData !== undefined // Only skip if we already have game list data
  });

  const {
    formState: { isSubmitting, errors },
    register,
    handleSubmit,
    setError,
    reset,
    setValue
  } = useForm<JoinGameAPI>({
    mode: 'onBlur',
    resolver: yupResolver(validationSchema)
  });

  const [selectedFavoriteDeck, setSelectedFavoriteDeck] = React.useState<string>('');
  const [selectedPreconDeck, setSelectedPreconDeck] = React.useState<string>(PRECON_DECKS.LINKS[0]);
  const [gameFormat, setGameFormat] = React.useState<string | null>(null);

  const initialValues: JoinGameAPI = useMemo(() => {
    return {
      deck: '',
      fabdb: '',
      deckTestMode: false,
      decksToTry: '',
      favoriteDeck: false,
      favoriteDecks:
        data?.lastUsedDeckIndex !== undefined
          ? data.favoriteDecks.find(
              (deck) => deck.index === data.lastUsedDeckIndex
            )?.key
          : '',
      gameDescription: ''
    };
  }, [isSuccess, isLoggedIn]);

  useEffect(() => {
    reset(initialValues);
    setSelectedFavoriteDeck(initialValues.favoriteDecks || '');
    setSelectedPreconDeck(PRECON_DECKS.LINKS[0]);
    // Only set fabdb to precon deck if format is precon
    if (isPreconFormat(gameFormat)) {
      setValue('fabdb', PRECON_DECKS.LINKS[0]);
    }
  }, [initialValues, reset, gameFormat, setValue]);

  // Update gameFormat when game list loads - find this game in the list
  useEffect(() => {
    if (gameListData) {
      const gameNameStr = finalGameName;
      
      const openGame = gameListData.openGames?.find((g) => String(g.gameName) === gameNameStr);
      const inProgressGame = gameListData.gamesInProgress?.find((g) => String(g.gameName) === gameNameStr);
      const foundGame = openGame || inProgressGame;
      
      if (foundGame?.format) {
        setGameFormat(foundGame.format);
        return; // Found in public list, don't need private API
      }
    }

    // Fallback: use gameInfoData if game not found in public list (private/friends-only game)
    if (gameInfoData?.format) {
      setGameFormat(gameInfoData.format);
    }
  }, [gameListData, gameInfoData, finalGameName]);

  // Sync selectedPreconDeck with form field for precon formats
  useEffect(() => {
    if (isPreconFormat(gameFormat)) {
      setValue('fabdb', selectedPreconDeck);
    }
  }, [selectedPreconDeck, gameFormat, setValue]);

  // Convert favorite decks to ImageSelect options
  const favoriteDeckOptions: ImageSelectOption[] = React.useMemo(() => {
    if (!data?.favoriteDecks) return [];
    const isOpenFormat = gameFormat && getReadableFormatName(gameFormat).toLowerCase().includes('open');
    const baseGameFormat = getBaseFormatType(gameFormat);
    const filtered = data.favoriteDecks
      .filter(deck => {
        // Show all decks for OPEN format
        if (isOpenFormat) return true;
        if (!deck.format) return false;
        const baseDeckFormat = getBaseFormatType(deck.format);
        return baseDeckFormat === baseGameFormat;
      });
    return filtered.map(deck => ({
      value: deck.key,
      label: `${deck.name}${deck.format ? ` (${shortenFormat(deck.format)})` : ''}`,
      imageUrl: generateCroppedImageUrl(deck.hero)
    }));
  }, [data?.favoriteDecks, gameFormat]);

  // Convert precon decks to ImageSelect options
  const preconDeckOptions: ImageSelectOption[] = React.useMemo(() => {
    return PRECON_DECKS.LINKS.map((link, index) => ({
      value: link,
      label: PRECON_DECKS.NAMES[index],
      imageUrl: generateCroppedImageUrl(PRECON_DECKS.HEROES[index])
    }));
  }, []);

  const isPrecon = isPreconFormat(gameFormat);

  // Debug logging
  React.useEffect(() => {
  }, [isPrecon, gameFormat, gameListLoading]);

  const onSubmit: SubmitHandler<JoinGameAPI> = async (values: JoinGameAPI) => {
    values.playerID = parseInt(playerID);
    values.gameName = parseInt(finalGameName);

    try {
      const response = await joinGame(values).unwrap();
      if (response.error) {
        throw response.error;
      } else {
        dispatch(
          setGameStart({
            playerID: response.playerID ?? 0,
            gameID: response.gameName ?? 0,
            authKey: response.authKey ?? ''
          })
        );
        const searchParam = { playerID: String(response.playerID ?? '0') };
        navigate(`/game/lobby/${response.gameName}`, {
          state: { playerID: response.playerID ?? 0 }
        });
      }
    } catch (error) {
      console.warn(error);
      toast.error(String(error), { position: 'top-center' });
      setError('root.serverError', {
        type: 'custom',
        message: `There has been an error while joining the game. Message: ${JSON.stringify(
          error
        )} Please try again`
      });
    }
  };

  return (
    <main className={styles.LoginPageContainer}>
      <article className={styles.formContainer}>
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className={styles.formInner}>
            {isPrecon ? (
              <label>
                Preconstructed Deck
                <ImageSelect
                  id="preconDecks"
                  options={preconDeckOptions}
                  value={selectedPreconDeck}
                  onChange={(value) => {
                    setSelectedPreconDeck(value);
                    setValue('fabdb', value);
                  }}
                  placeholder="Select a deck"
                  aria-invalid={errors.deck?.message ? 'true' : undefined}
                />
                <input
                  type="hidden"
                  {...register('fabdb')}
                  value={selectedPreconDeck}
                />
                <ErrorMessage
                  errors={errors}
                  name="fabdb"
                  render={({ message }) => <p>{message}</p>}
                />
              </label>
            ) : (
              <>
                {isLoggedIn && !isLoading && (
                  <label>
                    Favorite Deck
                    <ImageSelect
                      id="favoriteDecks"
                      options={favoriteDeckOptions}
                      value={selectedFavoriteDeck}
                      onChange={(value) => {
                        setSelectedFavoriteDeck(value);
                        setValue('favoriteDecks', value);
                      }}
                      placeholder="Select a deck"
                      aria-busy={isLoading}
                      aria-invalid={errors.favoriteDecks?.message ? 'true' : undefined}
                    />
                    <input
                      type="hidden"
                      {...register('favoriteDecks')}
                      value={selectedFavoriteDeck}
                    />
                    <ErrorMessage
                      errors={errors}
                      name="favoriteDecks"
                      render={({ message }) => <p>{message}</p>}
                    />
                  </label>
                )}
                <ErrorMessage
                  errors={errors}
                  name="favoriteDecks"
                  render={({ message }) => (
                    <p className={styles.fieldError}>
                      <FaExclamationCircle /> {message}
                    </p>
                  )}
                />
                <fieldset>
                  <label>
                    Deck Link (URL from <a href="https://FaBrary.net"  target="_blank">FaBrary.net</a>)
                    <input
                      type="text"
                      id="fabdb"
                      aria-label="Deck Link"
                      {...register('fabdb')}
                      aria-invalid={errors.deck?.message ? 'true' : undefined}
                    />
                    <ErrorMessage
                      errors={errors}
                      name="fabdb"
                      render={({ message }) => (
                        <p className={styles.fieldError}>
                          <FaExclamationCircle /> {message}
                        </p>
                      )}
                    />
                  </label>
                  {isLoggedIn && (
                    <label>
                      <input
                        type="checkbox"
                        role="switch"
                        id="favoriteDeck"
                        {...register('favoriteDeck')}
                      />
                      Save Deck to ❤️ Favorites
                    </label>
                  )}
                  <label style={{ marginTop: '1rem' }}>
                    Game Format
                    <input
                      type="text"
                      id="gameFormat"
                      aria-label="Game Format"
                      value={getReadableFormatName(gameFormat || '')}
                      disabled
                      readOnly
                    />
                  </label>
                </fieldset>
              </>
            )}
          </div>
          {!isLoggedIn && (
            <p>
              <small>
                You must be <Link to="/user/login">logged in</Link> to join
                public lobbies.
              </small>
            </p>
          )}
          <button
            type="submit"
            className={styles.buttonClass}
            aria-busy={isSubmitting}
            style={{ marginTop: '27px' }}
          >
            Join Game
          </button>
          {errors.root?.serverError?.message && (
            <div className={styles.fieldError}>
              <FaExclamationCircle /> {errors.root?.serverError?.message}
            </div>
          )}
        </form>
        <hr />
        <button
          style={{ marginTop: '27px' }}
          type="submit"
          className={classNames(styles.buttonClass, 'outline')}
          onClick={(e) => {
            e.stopPropagation;
            navigate(-1);
          }}
        >
          Back
        </button>
      </article>
    </main>
  );
};

export default JoinGame;

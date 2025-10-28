import React, { useEffect, useMemo } from 'react';
import { useAppDispatch } from 'app/Hooks';
import classNames from 'classnames';
import { GAME_FORMAT, GAME_VISIBILITY, AI_DECK, isPreconFormat, PRECON_DECKS } from 'appConstants';
import {
  useCreateGameMutation,
  useGetFavoriteDecksQuery
} from 'features/api/apiSlice';
import { setGameStart } from 'features/game/GameSlice';
import useAuth from 'hooks/useAuth';
import { CreateGameAPI } from 'interface/API/CreateGame.php';
import { toast } from 'react-hot-toast';
import { useNavigate, useSearchParams } from 'react-router-dom';
import styles from './CreateGame.module.css';
import validationSchema from './validationSchema';
import { SubmitHandler, useForm } from 'react-hook-form';
import { ErrorMessage } from '@hookform/error-message';
import { yupResolver } from '@hookform/resolvers/yup';
import { FaExclamationCircle } from 'react-icons/fa';
import { HEROES_OF_RATHE } from '../../index/components/filter/constants';
import { generateCroppedImageUrl } from 'utils/cropImages';
import { ImageSelect, ImageSelectOption } from 'components/ImageSelect';
import GoogleAdSense from 'components/GoogleAdSense';

// Helper function to shorten format names
const shortenFormat = (format: string): string => {
  if (!format) return '';
  if (format.toLowerCase() === 'classic constructed') return 'CC';
  // Capitalize first letter of other formats
  return format.charAt(0).toUpperCase() + format.slice(1).toLowerCase();
};

const CreateGame = () => {
  const { isLoggedIn, isPatron } = useAuth();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { data, isLoading, isSuccess } = useGetFavoriteDecksQuery(undefined);
  const [searchParams, setSearchParams] = useSearchParams();
  const [createGame, createGameResult] = useCreateGameMutation();

  const {
    formState: { isSubmitting, errors },
    register,
    handleSubmit,
    setError,
    reset,
    setValue,
    watch
  } = useForm<CreateGameAPI>({
    mode: 'onBlur',
    resolver: yupResolver(validationSchema)
  });

  const initialValues: CreateGameAPI = useMemo(() => {
    return {
      deck: '',
      fabdb: searchParams.get('fabdb') ?? '',
      deckTestMode: false,
      format:
        searchParams.get('format') ??
        (isLoggedIn
          ? data?.lastFormat !== undefined
            ? data.lastFormat
            : GAME_FORMAT.CLASSIC_CONSTRUCTED
          : GAME_FORMAT.OPEN_CC),
      visibility:
        searchParams.get('visibility') ??
        (isLoggedIn
          ? data?.lastVisibility !== undefined
            ? data.lastVisibility == 1
              ? GAME_VISIBILITY.PUBLIC
              : data.lastVisibility == 2
              ? GAME_VISIBILITY.FRIENDS_ONLY
              : GAME_VISIBILITY.PRIVATE
            : GAME_VISIBILITY.PUBLIC
          : GAME_VISIBILITY.PRIVATE),
      decksToTry: '',
      favoriteDeck: false,
      favoriteDecks:
        data?.lastUsedDeckIndex !== undefined
          ? data.favoriteDecks.find(
              (deck) => deck.index === data.lastUsedDeckIndex
            )?.key
          : '',
      gameDescription: '',
      deckTestDeck: AI_DECK.COMBAT_DUMMY
    };
  }, [isSuccess, isLoggedIn]);

  const [selectedFormat, setSelectedFormat] = React.useState(initialValues.format);
  const [previousFormat, setPreviousFormat] = React.useState<string>(String(initialValues.format || ''));
  const [selectedHeroes, setSelectedHeroes] = React.useState<string[]>([]);
  const [gameDescription, setGameDescription] = React.useState('');
  const [selectedFavoriteDeck, setSelectedFavoriteDeck] = React.useState<string>(initialValues.favoriteDecks || '');
  const [selectedPreconDeck, setSelectedPreconDeck] = React.useState<string>(PRECON_DECKS.LINKS[0]);
  const [isInitialized, setIsInitialized] = React.useState(false);

  const formFormat = watch('format');

  // Debug logging
  React.useEffect(() => {
  }, [selectedFormat, formFormat]);

  // Sync selectedFormat with form field
  React.useEffect(() => {
    setValue('format', selectedFormat);
  }, [selectedFormat, setValue]);

  // Sync selectedPreconDeck with form field for precon formats
  React.useEffect(() => {
    if (isPreconFormat(formFormat || selectedFormat) && isInitialized) {
      setValue('fabdb', selectedPreconDeck);
    }
  }, [selectedPreconDeck, formFormat, selectedFormat, isInitialized, setValue]);

  // Get unique hero names (no duplicates)
  const uniqueHeroes = useMemo(() => {
    const heroNames = new Set(HEROES_OF_RATHE.map(hero => hero.label));
    return Array.from(heroNames).sort();
  }, []);

  const handleFormatChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newFormat = e.target.value;
    const wasPrecon = isPreconFormat(previousFormat);
    const isNewPrecon = isPreconFormat(newFormat);

    setSelectedFormat(newFormat);
    setPreviousFormat(newFormat);

    if (isNewPrecon) {
      setSelectedPreconDeck(PRECON_DECKS.LINKS[0]);
      setValue('fabdb', PRECON_DECKS.LINKS[0]);
    } else if (wasPrecon && !isNewPrecon) {
      // Only clear when switching OUT of precon format
      setValue('fabdb', '');
    }
    // If switching between non-precon formats, don't touch fabdb
  };

  const handleGameDescriptionChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    setGameDescription(value);
    
    if (value !== 'Looking for a specific hero') {
      setSelectedHeroes([]);
      setValue('gameDescription', value);
    } else {
      setValue('gameDescription', 'Looking for a specific hero');
    }
  };

  const handleHeroSelection = (heroName: string, isChecked: boolean) => {
    let newSelectedHeroes: string[];
    
    if (isChecked) {
      // Add hero if not already selected and under limit of 3
      if (selectedHeroes.length < 3 && !selectedHeroes.includes(heroName)) {
        newSelectedHeroes = [...selectedHeroes, heroName];
      } else {
        return; // Don't add if limit reached or already selected
      }
    } else {
      // Remove hero
      newSelectedHeroes = selectedHeroes.filter(hero => hero !== heroName);
    }
    
    setSelectedHeroes(newSelectedHeroes);
    
    // Update the gameDescription field with the formatted string
    if (newSelectedHeroes.length > 0) {
      const heroList = newSelectedHeroes.join(', ');
      setValue('gameDescription', `Looking for ${heroList}`);
    } else {
      setValue('gameDescription', 'Looking for a specific hero');
    }
  };

  useEffect(() => {
    reset(initialValues);
    setGameDescription(initialValues.gameDescription || '');
    setSelectedHeroes([]);
    setSelectedFavoriteDeck(initialValues.favoriteDecks || '');
    setSelectedPreconDeck(PRECON_DECKS.LINKS[0]);
    // Only set fabdb to precon deck if format is precon
    if (isPreconFormat(initialValues.format)) {
      setValue('fabdb', PRECON_DECKS.LINKS[0]);
    }
    setIsInitialized(true);
  }, [initialValues, reset, setValue]);

  // Convert favorite decks to ImageSelect options
  const favoriteDeckOptions: ImageSelectOption[] = React.useMemo(() => {
    if (!data?.favoriteDecks) return [];
    return data.favoriteDecks.map(deck => ({
      value: deck.key,
      label: `${deck.name}${deck.format ? ` (${shortenFormat(deck.format)})` : ''}`,
      imageUrl: generateCroppedImageUrl(deck.hero)
    }));
  }, [data?.favoriteDecks]);

  // Convert precon decks to ImageSelect options
  const preconDeckOptions: ImageSelectOption[] = React.useMemo(() => {
    return PRECON_DECKS.LINKS.map((link, index) => ({
      value: link,
      label: PRECON_DECKS.NAMES[index],
      imageUrl: generateCroppedImageUrl(PRECON_DECKS.HEROES[index])
    }));
  }, []);

  const onSubmit: SubmitHandler<CreateGameAPI> = async (
    values: CreateGameAPI
  ) => {
    try {
      // if you're not logged in you can ONLY make a private game.
      if (!isLoggedIn) values.visibility = GAME_VISIBILITY.PRIVATE;
      values.user = searchParams.get('user') ?? undefined;
      const response = await createGame(values).unwrap();
      if (response.error) {
        throw response.error;
      } else {
        if (!response.playerID || !response.gameName || !response.authKey) {
          throw new Error('A required param is missing');
        }
        dispatch(
          setGameStart({
            playerID: response.playerID ?? 0,
            gameID: response.gameName ?? 0,
            authKey: response.authKey ?? ''
          })
        );
        navigate(`/game/lobby/${response.gameName}`, {
          state: { playerID: response.playerID ?? 0 }
        });
      }
    } catch (error) {
      console.warn(error);
      toast.error(String(error), { position: 'top-center' });
      setError('root.serverError', {
        type: 'custom',
        message: `There has been an error while creating your game. Error: ${JSON.stringify(
          error
        )} Please try again.`
      });
    }
  };

  const buttonClass = classNames(styles.button, 'primary');

  return (
    <div>
      <article className={styles.formContainer}>
        <h3>Create New Game</h3>
        {/*<p className={styles.fieldError}>
          <FaExclamationCircle /> Warning - SOON! an update will be pushed to the live servers. The games in progress will crash and new games will be required.
          </p> */}
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className={styles.formInner}>
            {isLoggedIn && !isLoading && !isPreconFormat(formFormat || selectedFormat) && (
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
                {isPreconFormat(formFormat || selectedFormat) ? (
                  <>
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
                  </>
                ) : (
                  <>
                    Deck Link (URL from <a href="https://FaBrary.net" target="_blank">FaBrary.net</a>)
                    <input
                      type="text"
                      id="fabdb"
                      aria-label="Deck Link"
                      {...register('fabdb')}
                      aria-invalid={errors.deck?.message ? 'true' : undefined}
                    />
                  </>
                )}
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
            </fieldset>
              <label>
                Game Description
                <select
                  id="gameDescription"
                  aria-label="Game Description"
                  {...register('gameDescription')}
                  aria-invalid={
                    errors.gameDescription?.message ? 'true' : undefined
                  }
                  value={gameDescription}
                  onChange={(e) => {
                    handleGameDescriptionChange(e);
                    register('gameDescription').onChange(e);
                  }}
                >
                  <option value="">Default Game #</option>
                  <option value="Looking for best deck in the format">Looking for best deck in the format</option>
                  <option value="Looking for meta heroes">Looking for meta heroes</option>
                  <option value="Looking for a specific hero">Looking for a specific hero</option>
                  <option value="Playing spicy brews">Playing spicy brews</option>
                  <option value="Casual play">Casual play</option>
                  <option value="New player help">New player help</option>
                  <option value="Learning a new hero">Learning a new hero</option>
                </select>
              </label>
              
              {gameDescription === 'Looking for a specific hero' && (
                <div className={styles.heroSelection}>
                  <label>Select Heroes (up to 3):</label>
                  <div className={styles.heroCheckboxes}>
                    {uniqueHeroes.map((heroName) => (
                      <label key={heroName} className={styles.heroCheckbox}>
                        <input
                          type="checkbox"
                          checked={selectedHeroes.includes(heroName)}
                          onChange={(e) => handleHeroSelection(heroName, e.target.checked)}
                          disabled={!selectedHeroes.includes(heroName) && selectedHeroes.length >= 3}
                        />
                        {heroName}
                      </label>
                    ))}
                  </div>
                  {selectedHeroes.length > 0 && (
                    <div className={styles.selectedHeroesPreview}>
                      Preview: Looking for {selectedHeroes.join(', ')}
                    </div>
                  )}
                </div>
              )}
            <label>
              Format
              <select
                id="format"
                aria-label="format"
                {...register('format')}
                aria-invalid={errors.format?.message ? 'true' : undefined}
                onChange={(e) => {
                  handleFormatChange(e);
                  register('format').onChange(e);
                }}
              >
                <optgroup label="Popular Formats">
                  <option value={GAME_FORMAT.CLASSIC_CONSTRUCTED}>Classic Constructed</option>
                  <option value={GAME_FORMAT.SAGE}>Silver Age</option>
                  <option value={GAME_FORMAT.LLCC}>Living Legend</option>
                  <option value={GAME_FORMAT.COMMONER}>Commoner</option>
                </optgroup>
                <optgroup label="Competitive Formats">
                  <option value={GAME_FORMAT.COMPETITIVE_CC}>Competitive Classic Constructed</option>
                  <option value={GAME_FORMAT.COMPETITIVE_BLITZ}>Competitive Blitz</option>
                  <option value={GAME_FORMAT.COMPETITIVE_SAGE}>Competitive Silver Age</option>
                  <option value={GAME_FORMAT.COMPETITIVE_LL}>Competitive Living Legend</option>
                </optgroup>
                <optgroup label="Other Formats">
                  <option value={GAME_FORMAT.BLITZ}>Blitz</option>
                  <option value={GAME_FORMAT.DRAFT}>Draft / Limited</option>
                  <option value={GAME_FORMAT.CLASH}>Clash</option>
                  <option value={GAME_FORMAT.PRECON}>Preconstructed Decks</option>
                </optgroup>
                <optgroup label="Open Formats (No Restrictions)">
                  <option value={GAME_FORMAT.OPEN_BLITZ}>Open Blitz</option>
                  <option value={GAME_FORMAT.OPEN_CC}>Open CC</option>
                  <option value={GAME_FORMAT.OPEN_LL_CC}>Open Living Legend</option>
                </optgroup>
              </select>
            </label>
            <fieldset>
              <label>
                Visibility
                <select
                  id="visibility"
                  aria-label="Visibility"
                  {...register('visibility')}
                  aria-invalid={errors.visibility?.message ? 'true' : undefined}
                >
                  {isLoggedIn && (
                    <option value={GAME_VISIBILITY.PUBLIC}>Public</option>
                  )}
                  <option value={GAME_VISIBILITY.PRIVATE}>Private</option>
                  {isLoggedIn && (
                    <option value={GAME_VISIBILITY.FRIENDS_ONLY}>Friends Only</option>
                  )}
                </select>
              </label>
              <label>
                <input
                  type="checkbox"
                  role="switch"
                  id="deckTestMode"
                  aria-label="Single Player"
                  {...register('deckTestMode')}
                  aria-invalid={
                    errors.deckTestMode?.message ? 'true' : undefined
                  }
                />
                Single Player 🤖
                <div>&nbsp;</div>
              </label>
              {isLoggedIn && (
                <label>
                  AI Deck
                  <select
                    id="deckTestDeck"
                    aria-label="deckTestDeck"
                    {...register('deckTestDeck')}
                    aria-invalid={errors.format?.message ? 'true' : undefined}
                  >
                    <option value={AI_DECK.COMBAT_DUMMY}>Practice Dummy</option>
                    <option value={AI_DECK.IRABLITZ}>
                      Flic Flak Ira (Blitz)
                    </option>
                    <option value={AI_DECK.FAICC}>Fai (CC)</option>
                  </select>
                </label>
              )}
            </fieldset>
          </div>
          <button
            type="submit"
            className={buttonClass}
            disabled={isSubmitting}
            aria-busy={isSubmitting}
          >
            Create Game
          </button>
          {errors.root?.serverError?.message && (
            <div className={styles.fieldError}>
              <FaExclamationCircle /> {errors.root?.serverError?.message}
            </div>
          )}
        </form>
        {/* Google AdSense Ad */}
        <div style={{ marginTop: '20px', textAlign: 'center' }}>
          <GoogleAdSense slot="3126621164" format="auto" />
        </div>
      </article>
    </div>
  );
};

export default CreateGame;

import React, { useEffect, useMemo, useState } from 'react';
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
import { FaExclamationCircle, FaQuestionCircle, FaChevronUp, FaChevronDown } from 'react-icons/fa';
import { HEROES_OF_RATHE, CLASS_OF_RATHE } from '../../index/components/filter/constants';
import { generateCroppedImageUrl } from 'utils/cropImages';
import { ImageSelect, ImageSelectOption } from 'components/ImageSelect';

const getCookie = (name: string): string | null => {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop()?.split(';').shift() || null;
  return null;
};

const setCookie = (name: string, value: string, days: number = 365) => {
  const expires = new Date();
  expires.setTime(expires.getTime() + days * 24 * 60 * 60 * 1000);
  document.cookie = `${name}=${value}; expires=${expires.toUTCString()}; path=/`;
};

const shortenFormat = (format: string): string => {
  if (!format) return '';
  if (format.toLowerCase() === 'classic constructed') return 'CC';
  // Capitalize first letter of other formats
  return format.charAt(0).toUpperCase() + format.slice(1).toLowerCase();
};

const formatDeckLabel = (deckName: string, format: string | null, maxLength: number = 58): string => {
  const formatStr = format ? ` (${shortenFormat(format)})` : '';
  const combined = `${deckName}${formatStr}`;
  
  if (combined.length <= maxLength) {
    return combined;
  }
  
  const availableForName = Math.max(1, maxLength - formatStr.length - 3);
  return `${deckName.substring(0, availableForName)}...${formatStr}`;
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
    // Load game description from localStorage
    const savedGameDescription = localStorage.getItem('lastGameDescription') || '';
    
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
      gameDescription: savedGameDescription,
      deckTestDeck: AI_DECK.COMBAT_DUMMY
    };
  }, [isSuccess, isLoggedIn]);

  const [selectedFormat, setSelectedFormat] = React.useState(initialValues.format);
  const [previousFormat, setPreviousFormat] = React.useState<string>(String(initialValues.format || ''));
  const [selectedHeroes, setSelectedHeroes] = React.useState<string[]>(() => {
    const saved = localStorage.getItem('lastSelectedHeroes');
    return saved ? JSON.parse(saved) : [];
  });
  const [selectedClasses, setSelectedClasses] = React.useState<string[]>(() => {
    const saved = localStorage.getItem('lastSelectedClasses');
    return saved ? JSON.parse(saved) : [];
  });
  const [gameDescription, setGameDescription] = React.useState(() => initialValues.gameDescription || '');
  const [selectedFavoriteDeck, setSelectedFavoriteDeck] = React.useState<string>(initialValues.favoriteDecks || '');
  const [selectedPreconDeck, setSelectedPreconDeck] = React.useState<string>(PRECON_DECKS.LINKS[0]);
  const [isInitialized, setIsInitialized] = React.useState(false);
  const [isExpanded, setIsExpanded] = useState(() => {
    const savedState = getCookie('createGamePanelExpanded');
    return savedState !== 'false'; 
  });

  useEffect(() => {
    setCookie('createGamePanelExpanded', String(isExpanded));
  }, [isExpanded]);

  const formFormat = watch('format');
  const deckTestMode = watch('deckTestMode');

  // Normalize localStorage on mount - extract base option from expanded descriptions
  React.useEffect(() => {
    const stored = localStorage.getItem('lastGameDescription') || '';
    // If it contains hero/class names (has commas), extract the base option
    if (stored && stored.includes(',')) {
      let baseDescription = '';
      const words = stored.split(',').map(w => w.trim());
      const classLabels = CLASS_OF_RATHE.map(classObj => classObj.label);
      const isClassSelection = words.some(word => classLabels.includes(word));
      
      if (stored.startsWith('Looking for ')) {
        baseDescription = isClassSelection ? 'Looking for a specific class' : 'Looking for a specific hero';
      } else if (stored.startsWith('No interest')) {
        baseDescription = 'No interest in playing against specific hero';
      }
      if (baseDescription) {
        localStorage.setItem('lastGameDescription', baseDescription);
      }
    }
  }, []);

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

  // Get unique hero names (no duplicates), filtered by format
  const uniqueHeroes = useMemo(() => {
    const currentFormat = String(formFormat || selectedFormat);
    // LL and CC formats should only show non-young heroes
    const isRestrictedFormat = [
      GAME_FORMAT.CLASSIC_CONSTRUCTED,
      GAME_FORMAT.COMPETITIVE_CC,
      GAME_FORMAT.LLCC,
      GAME_FORMAT.COMPETITIVE_LL,
      GAME_FORMAT.OPEN_CC,
      GAME_FORMAT.OPEN_LL_CC
    ].includes(currentFormat);
    
    const filteredHeroes = isRestrictedFormat
      ? HEROES_OF_RATHE.filter(hero => !hero.young)
      : HEROES_OF_RATHE;
    
    const heroNames = new Set(filteredHeroes.map(hero => hero.label));
    return Array.from(heroNames).sort();
  }, [formFormat, selectedFormat]);

  const uniqueClasses = useMemo(() => {
    const classNames = new Set(CLASS_OF_RATHE.map(classObj => classObj.label));
    return Array.from(classNames).sort();
  }, [])

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
    
    if (value !== 'Looking for a specific hero' && value !== 'Looking for a specific class' && value !== 'No interest in playing against specific hero') {
      setSelectedHeroes([]);
      setSelectedClasses([]);
      setValue('gameDescription', value);
    } 
    else if (value === 'Looking for a specific hero' || value === 'No interest in playing against specific hero' || value === 'Looking for a specific class') {
      setValue('gameDescription', value);
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
    if (newSelectedHeroes.length > 0 && gameDescription === 'No interest in playing against specific hero' || gameDescription === 'Looking for a specific hero') {
      const heroList = newSelectedHeroes.join(', ');
      // Check if current mode is preference or exclusion
      if (gameDescription === 'No interest in playing against specific hero') {
        setValue('gameDescription', `No interest in playing against ${heroList}`);
      } else {
        setValue('gameDescription', `Looking for ${heroList}`);
      }
    } else {
      setValue('gameDescription', initialValues.gameDescription || '');
    }
  };

  const handleClassSelection = (className: string, isChecked: boolean) => {
    let newSelectedClasses: string[];
    
    if (isChecked) {
      if (selectedClasses.length < 3 && !selectedClasses.includes(className)) {
        newSelectedClasses = [...selectedClasses, className];
      } else {
        return; // Don't add if limit reached or already selected
      }
    } else {
      newSelectedClasses = selectedClasses.filter(classNameItem => classNameItem !== className);
    }
    
    setSelectedClasses(newSelectedClasses);
    
    if (newSelectedClasses.length > 0) {
      const classList = newSelectedClasses.join(', ');
      setValue('gameDescription', `Looking for ${classList}`);
    } else {
      setValue('gameDescription', 'Looking for a specific class');
    }
  };

  const clearSelections = () => {
    setSelectedHeroes([]);
    setSelectedClasses([]);
    localStorage.setItem('lastSelectedHeroes', JSON.stringify([]));
    localStorage.setItem('lastSelectedClasses', JSON.stringify([]));
    setGameDescription(gameDescription === 'Looking for a specific hero' ? 'Looking for a specific hero' : gameDescription === 'No interest in playing against specific hero' ? 'No interest in playing against specific hero' : 'Looking for a specific class');
    setValue('gameDescription', gameDescription === 'Looking for a specific hero' ? 'Looking for a specific hero' : gameDescription === 'No interest in playing against specific hero' ? 'No interest in playing against specific hero' : 'Looking for a specific class');
  };

  useEffect(() => {
    reset(initialValues);
    setGameDescription(initialValues.gameDescription || '');
    const savedHeroes = localStorage.getItem('lastSelectedHeroes');
    const savedClasses = localStorage.getItem('lastSelectedClasses');
    if (savedHeroes) {
      setSelectedHeroes(JSON.parse(savedHeroes));
    }
    if (savedClasses) {
      setSelectedClasses(JSON.parse(savedClasses));
    }
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
      label: formatDeckLabel(deck.name, deck.format),
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
      
      // Extract base game description (remove hero/class names)
      let baseGameDescription = values.gameDescription || '';
      if (selectedClasses.length > 0) {
        baseGameDescription = 'Looking for a specific class';
      } else if (selectedHeroes.length > 0) {
        if (gameDescription.startsWith('No interest')) {
          baseGameDescription = 'No interest in playing against specific hero';
        } else {
          baseGameDescription = 'Looking for a specific hero';
        }
      } else if (baseGameDescription.startsWith('Looking for ') && baseGameDescription.includes(',')) {
        if (baseGameDescription.includes('in playing')) {
          baseGameDescription = 'No interest in playing against specific hero';
        } else {
          baseGameDescription = 'Looking for a specific hero';
        }
      } else if (baseGameDescription.startsWith('No interest in playing against') && baseGameDescription.includes(',')) {
        baseGameDescription = 'No interest in playing against specific hero';
      }
      
      // Save the base option and selected heroes/classes to localStorage
      localStorage.setItem('lastGameDescription', baseGameDescription);
      localStorage.setItem('lastSelectedHeroes', JSON.stringify(selectedHeroes));
      localStorage.setItem('lastSelectedClasses', JSON.stringify(selectedClasses));

      
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
        <div className={styles.header}>
          <h3 className={styles.title}>Create New Game</h3>
          <button
            type="button"
            className={styles.toggleButton}
            onClick={() => setIsExpanded(!isExpanded)}
            aria-expanded={isExpanded}
            aria-label={isExpanded ? 'Minimize panel' : 'Expand panel'}
          >
            {isExpanded ? <FaChevronUp size={16} /> : <FaChevronDown size={16} />}
          </button>
        </div>
        {/*<p className={styles.fieldError}>
          <FaExclamationCircle /> Warning - SOON! an update will be pushed to the live servers. The games in progress will crash and new games will be required.
          </p> */}
        {isExpanded && (
          <form onSubmit={handleSubmit(onSubmit)}>
            <div className={styles.formInner}>
            {isLoggedIn && !isLoading && !isPreconFormat(formFormat || selectedFormat) && (
              <label>
                Selected Deck
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
                    Import Deck{''}
                    <span
                      title="URL from FaBrary.net"
                      style={{ cursor: 'help', display: 'inline-flex', alignItems: 'center', marginLeft: '4px' }}
                    >
                      <FaQuestionCircle size={14} />
                    </span>
                    <input
                      type="text"
                      id="fabdb"
                      aria-label="Deck Link - URL from FaBrary.net"
                      placeholder="https://fabrary.net/decks/…"
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
                  <option value="No interest in playing against specific hero">No interest in playing against specific hero</option>
                  <option value="Looking for a specific class">Looking for a specific class</option>
                  <option value="Looking for a quick game">Looking for a quick game</option>
                  <option value="Playing spicy brews">Playing spicy brews</option>
                  <option value="Casual play">Casual play</option>
                  <option value="New player help">New player help</option>
                  <option value="Learning a new hero">Learning a new hero</option>
                </select>
              </label>
              
              {gameDescription === 'Looking for a specific hero' && (
                <div className={styles.heroSelection}>
                  <div className={styles.heroSelectionHeader}>
                    <label>Select Heroes (up to 3):</label>
                    {selectedHeroes.length > 0 && (
                      <a href="#" onClick={(e) => { e.preventDefault(); clearSelections(); }} className={styles.clearSelectionLink}>
                        Clear Selection
                      </a>
                    )}
                  </div>
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
              {gameDescription === 'No interest in playing against specific hero' && (
                <div className={styles.heroSelection}>
                  <div className={styles.heroSelectionHeader}>
                    <label>Select Heroes (up to 3):</label>
                    {selectedHeroes.length > 0 && (
                      <a href="#" onClick={(e) => { e.preventDefault(); clearSelections(); }} className={styles.clearSelectionLink}>
                        Clear Selection
                      </a>
                    )}
                  </div>
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
                      Preview: Not interested in {selectedHeroes.join(', ')}
                    </div>
                  )}
                </div>
              )}
              {gameDescription === 'Looking for a specific class' && (
                <div className={styles.heroSelection}>
                  <div className={styles.heroSelectionHeader}>
                    <label>Select Classes (up to 3):</label>
                    {selectedClasses.length > 0 && (
                      <a href="#" onClick={(e) => { e.preventDefault(); clearSelections(); }} className={styles.clearSelectionLink}>
                        Clear Selection
                      </a>
                    )}
                  </div>
                  <div className={styles.heroCheckboxes}>
                    {uniqueClasses.map((className) => (
                      <label key={className} className={styles.heroCheckbox}>
                        <input
                          type="checkbox"
                          checked={selectedClasses.includes(className)}
                          onChange={(e) => handleClassSelection(className, e.target.checked)}
                          disabled={!selectedClasses.includes(className) && selectedClasses.length >= 3}
                        />
                        {className}
                      </label>
                    ))}
                  </div>
                  {selectedClasses.length > 0 && (
                    <div className={styles.selectedHeroesPreview}>
                      Preview: Looking for {selectedClasses.join(', ')}
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
                </optgroup>
                <optgroup label="Competitive Formats">
                  <option value={GAME_FORMAT.COMPETITIVE_CC}>Competitive Classic Constructed</option>
                  <option value={GAME_FORMAT.COMPETITIVE_SAGE}>Competitive Silver Age</option>
                  <option value={GAME_FORMAT.COMPETITIVE_LL}>Competitive Living Legend</option>
                </optgroup>
                <optgroup label="Future Formats (Play with spoiled cards!)">
                  <option value={GAME_FORMAT.OPEN_CC}>Future Classic Constructed</option>
                  <option value={GAME_FORMAT.OPEN_LL_CC}>Future Living Legend</option>
                  <option value={GAME_FORMAT.OPEN_SAGE}>Future Silver Age</option>
                </optgroup>
                <optgroup label="Other Formats">
                  <option value={GAME_FORMAT.PRECON}>Preconstructed Decks</option>
                  <option value={GAME_FORMAT.BLITZ}>Blitz</option>
                  <option value={GAME_FORMAT.DRAFT}>Draft / Limited</option>
                  <option value={GAME_FORMAT.OPEN}>Open (no restrictions)</option>
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
              {isLoggedIn && deckTestMode && (
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
        )}
      </article>
    </div>
  );
};

export default CreateGame;

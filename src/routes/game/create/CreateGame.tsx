import React, { useEffect, useMemo } from 'react';
import { useAppDispatch } from 'app/Hooks';
import classNames from 'classnames';
import { GAME_FORMAT, GAME_VISIBILITY, AI_DECK } from 'appConstants';
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

const preconDecklinks = [
  "https://fabrary.net/decks/01JRH0631MH5A9JPVGTP3TKJXN", //maxx
  "https://fabrary.net/decks/01JN2DEG4X2V8DVMCWFBWQTTSC", //aurora
  "https://fabrary.net/decks/01JCPPENK52DTRBJZMWQF8S0X2", //jarl
  "https://fabrary.net/decks/01J9822H5PANJAFQVMC4TPK4Z1", //dio
  "https://fabrary.net/decks/01J3GKKSTM773CW7BG3RRJ5FJH", //azalea
  "https://fabrary.net/decks/01J202NH0RG8S0V8WXH1FWB2AH", //boltyn
  "https://fabrary.net/decks/01HWNCK2BYPVKK6701052YYXMZ", //kayo
  "https://fabrary.net/decks/01JVYZ0NCHP49HAP40C23P14E3", //gravy
  "https://fabrary.net/decks/01JZ97KZ5TQV8E0FYMAM0XVNX7", //ira
];

const preconDeckNames = [
  "Maxx, the Hype Nitro",
  "Aurora, Shooting Star",
  "Jarl Vetreiđi",
  "Dash I/O",
  "Azalea, Ace in the Hole",
  "Ser Boltyn, Breaker of Dawn",
  "Kayo, Armed and Dangerous",
  "Gravy Bones, Shipwrecked Looter",
  "Ira, Scarlet Revenger",
];

// Create sorted arrays for the precon decks
const sortedPreconDecks = preconDeckNames
  .map((name, index) => ({ name, link: preconDecklinks[index] }))
  .sort((a, b) => a.name.localeCompare(b.name));

const sortedPreconDeckNames = sortedPreconDecks.map(deck => deck.name);
const sortedPreconDecklinks = sortedPreconDecks.map(deck => deck.link);

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
    setValue
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
        searchParams.get('format') ?? isLoggedIn
          ? data?.lastFormat !== undefined
            ? data.lastFormat
            : GAME_FORMAT.CLASSIC_CONSTRUCTED
          : GAME_FORMAT.OPEN_CC,
      visibility:
        searchParams.get('visibility') ??
        (isLoggedIn
          ? data?.lastVisibility !== undefined && data.lastVisibility == 1
            ? GAME_VISIBILITY.PUBLIC
            : GAME_VISIBILITY.PRIVATE
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

  const handleFormatChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedFormat(e.target.value);
    if (e.target.value === GAME_FORMAT.PRECON) {
      setValue('fabdb', sortedPreconDecklinks[0]);
    }
  };

  useEffect(() => {
    reset(initialValues);
  }, [initialValues, reset]);

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
            {isLoggedIn && !isLoading && (
              <label>
                Favorite Deck
                <select
                  id="favoriteDecks"
                  aria-busy={isLoading}
                  {...register('favoriteDecks')}
                  aria-invalid={
                    errors.favoriteDecks?.message ? 'true' : undefined
                  }
                >
                  {data?.favoriteDecks.map((deck, ix) => (
                    <option value={deck.key} key={deck.index}>
                      {deck.name}
                    </option>
                  ))}
                </select>
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
                {selectedFormat === GAME_FORMAT.PRECON ? (
                  <>
                    Decks
                    <select
                      id="fabdb"
                      aria-label="Decks"
                      {...register('fabdb')}
                      aria-invalid={errors.deck?.message ? 'true' : undefined}
                      defaultValue={sortedPreconDecklinks[0]}
                    >
                      {sortedPreconDecklinks.map((link, index) => (
                        <option key={index} value={link}>
                          {sortedPreconDeckNames[index]}
                        </option>
                      ))}
                    </select>
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
            {isPatron == '1' && (
              <label>
                Game Name
                <input
                  type="text"
                  id="gameDescription"
                  aria-label="Game Name"
                  {...register('gameDescription')}
                  aria-invalid={
                    errors.gameDescription?.message ? 'true' : undefined
                  }
                  placeholder="Defaults to Game#14321542"
                />
              </label>
            )}
            {isPatron != '1' && (
              <div>
                Join our{' '}
                <a href="https://linktr.ee/Talishar" target="_blank">
                  Patreon
                </a>{' '}
                to customize your game name!
                <div>&nbsp;</div>
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
                <option value={GAME_FORMAT.BLITZ}>Blitz</option>
                <option value={GAME_FORMAT.CLASSIC_CONSTRUCTED}>
                  Classic Constructed
                </option>
                <option value={GAME_FORMAT.COMPETITIVE_BLITZ}>
                  Competitive Blitz
                </option>
                <option value={GAME_FORMAT.COMPETITIVE_CC}>
                  Competitive CC
                </option>
                <option value={GAME_FORMAT.DRAFT}>
                  Limited
                </option>
                <option value={GAME_FORMAT.COMMONER}>Commoner</option>
                <option value={GAME_FORMAT.CLASH}>Clash</option>
                <option value={GAME_FORMAT.LLCC}>Living Legend</option>
                {/* <option value={GAME_FORMAT.LLBLITZ}>Living Legend Blitz</option> */}
                <option value={GAME_FORMAT.OPEN_CC}>
                  Open CC (no restrictions!)
                </option>
                <option value={GAME_FORMAT.OPEN_BLITZ}>
                  Open Blitz (no restrictions!)
                </option>
                <option value={GAME_FORMAT.OPEN_LL_CC}>
                  Open Living Legend (no restrictions!)
                </option>
                {/* <option value={GAME_FORMAT.BRAWL}>
                  Brawl
                </option> */}
                <option value={GAME_FORMAT.PRECON}>Preconstructed Decks</option>
                {/* <option value={GAME_FORMAT.OPEN_LL_BLITZ}>
                  Open Living Legend Blitz (no restrictions!)
                </option> */}
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
      </article>
    </div>
  );
};

export default CreateGame;

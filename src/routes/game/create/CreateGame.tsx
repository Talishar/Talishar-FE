import React, { useEffect, useMemo } from 'react';
import { useAppDispatch } from 'app/Hooks';
import classNames from 'classnames';
import { GAME_FORMAT, GAME_VISIBILITY } from 'appConstants';
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

const CreateGame = () => {
  const { isLoggedIn } = useAuth();
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
    reset
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
          : GAME_FORMAT.OPEN_FORMAT,
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
      gameDescription: ''
    };
  }, [isSuccess, isLoggedIn]);

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
        message: `There has been an error while creating your game. Message: ${JSON.stringify(
          error
        )} Please try again`
      });
    }
  };

  const buttonClass = classNames(styles.button, 'primary');

  return (
    <div>
      <article className={styles.formContainer}>
        <h3>Create New Game</h3>
        <p>
          <small>
            Talishar is an open-source, fan-made platform not associated with
            LSS. It may not be a completely accurate representation of the Rules
            as Written. If you have questions about interactions or rulings,
            please contact the judge community for clarification.
          </small>
        </p>
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
                Deck Link:
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
            </fieldset>
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
            <label>
              Format
              <select
                id="format"
                aria-label="format"
                {...register('format')}
                aria-invalid={errors.format?.message ? 'true' : undefined}
              >
                <option value={GAME_FORMAT.BLITZ}>Blitz</option>
                <option value={GAME_FORMAT.CLASSIC_CONSTRUCTED}>
                  Classic Constructed
                </option>
                <option value={GAME_FORMAT.COMPETITIVE_BLITZ}>
                  Request Undo Blitz
                </option>
                <option value={GAME_FORMAT.COMPETITIVE_CC}>
                  Request Undo CC
                </option>
                <option value={GAME_FORMAT.COMMONER}>Commoner</option>
                <option value={GAME_FORMAT.CLASH}>Clash</option>
                <option value={GAME_FORMAT.LLCC}>Living Legend CC</option>
                <option value={GAME_FORMAT.LLBLITZ}>Living Legend Blitz</option>
                <option value={GAME_FORMAT.SEALED}>
                  Sealed (DraftFaB decks only)
                </option>
                <option value={GAME_FORMAT.OPEN_FORMAT}>
                  Open Format (no restrictions!)
                </option>
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
                Single Player
              </label>
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

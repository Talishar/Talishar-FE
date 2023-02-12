import { useAppDispatch } from 'app/Hooks';
import classNames from 'classnames';
import { GAME_FORMAT, GAME_VISIBILITY } from 'constants';
import {
  useCreateGameMutation,
  useGetFavoriteDecksQuery
} from 'features/api/apiSlice';
import { setGameStart } from 'features/game/GameSlice';
import { Field, Form, Formik, FormikHelpers } from 'formik';
import useAuth from 'hooks/useAuth';
import {
  CreateGameAPI,
  CreateGameResponse
} from 'interface/API/CreateGame.php';
import { handleRequest } from 'msw';
import React from 'react';
import { toast } from 'react-hot-toast';
import { FaExclamationCircle } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { skipPartiallyEmittedExpressions } from 'typescript';
import styles from './CreateGame.module.css';

const CreateGame = () => {
  const { isLoggedIn } = useAuth();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { data, isLoading, error } = useGetFavoriteDecksQuery({});
  const [createGame, createGameResult] = useCreateGameMutation();
  const initialValues: CreateGameAPI = {
    deck: '',
    fabdb: '',
    deckTestMode: false,
    format: GAME_FORMAT.CLASSIC_CONSTRUCTED,
    visibility: GAME_VISIBILITY.PRIVATE,
    decksToTry: '',
    favoriteDeck: false,
    favoriteDecks: '',
    gameDescription: ''
  };

  const handleSubmit = async (
    values: CreateGameAPI,
    { setSubmitting }: FormikHelpers<CreateGameAPI>
  ) => {
    console.log('submit values', values);
    setSubmitting(true);
    try {
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
        navigate(`/game/lobby/${response.gameName}`);
      }
    } catch (error) {
      console.warn(error);
      toast.error(String(error), { position: 'top-center' });
    } finally {
      setSubmitting(false);
    }
  };

  const buttonClass = classNames(styles.button, 'primary');
  console.log(createGameResult);
  return (
    <div>
      <article className={styles.formContainer}>
        <h3>Create New Game</h3>
        <Formik initialValues={initialValues} onSubmit={handleSubmit}>
          {({ values, isSubmitting }) => (
            <Form>
              <div className={styles.formInner}>
                {isLoggedIn && (
                  <label>
                    Favorite Deck
                    <select
                      name="login"
                      id="selectFavorite"
                      placeholder="Login"
                      aria-label="Login"
                      aria-busy={isLoading}
                    >
                      {data?.favoriteDecks.map((deck, ix) => (
                        <option value={deck.index} key={deck.key}>
                          {deck.name}
                        </option>
                      ))}
                    </select>
                  </label>
                )}
                <fieldset>
                  <label>
                    Deck Link:
                    <Field
                      type="text"
                      id="fabdb"
                      name="fabdb"
                      aria-label="Deck Link"
                    />
                  </label>
                  {isLoggedIn && (
                    <label>
                      <Field
                        type="checkbox"
                        role="switch"
                        id="favoriteDeck"
                        name="favoriteDeck"
                      />
                      Save Deck to ❤️ Favorites
                    </label>
                  )}
                </fieldset>
                <label>
                  Game Name
                  <Field
                    type="text"
                    id="gameDescription"
                    name="gameDescription"
                    aria-label="Game Name"
                    placeholder="Defaults to Game#14321542"
                  />
                </label>
                <label>
                  Format
                  <Field
                    as="select"
                    name="format"
                    id="format"
                    placeholder={GAME_FORMAT.BLITZ}
                    aria-label="Format"
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
                    <option value={GAME_FORMAT.COMMONER}>Commoner</option>
                    <option value={GAME_FORMAT.CLASH}>Clash</option>
                    <option value={GAME_FORMAT.OPEN_FORMAT}>
                      Open Format (no restrictions!)
                    </option>
                  </Field>
                </label>
                <fieldset>
                  <label>
                    Visibility
                    <Field
                      as="select"
                      name="visibility"
                      id="visibility"
                      placeholder={GAME_VISIBILITY.PUBLIC}
                      aria-label="Visibility"
                    >
                      <option value={GAME_VISIBILITY.PUBLIC}>Public</option>
                      <option value={GAME_VISIBILITY.PRIVATE}>Private</option>
                    </Field>
                  </label>
                  <label>
                    <Field
                      type="checkbox"
                      role="switch"
                      id="deckTestMode"
                      name="deckTestMode"
                      aria-label="Single Player"
                    />
                    Single Player
                  </label>
                </fieldset>
              </div>
              <button
                type="submit"
                className={buttonClass}
                aria-busy={isSubmitting}
              >
                Create Game
              </button>
              {!!createGameResult?.data?.error && (
                <div className={styles.alarm}>
                  <>
                    <FaExclamationCircle /> {createGameResult?.data?.error}
                  </>
                </div>
              )}
            </Form>
          )}
        </Formik>
      </article>
    </div>
  );
};

export default CreateGame;

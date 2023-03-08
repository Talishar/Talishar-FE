import React from 'react';
import { useAppDispatch } from 'app/Hooks';
import classNames from 'classnames';
import { GAME_FORMAT, GAME_VISIBILITY } from 'appConstants';
import {
  useCreateGameMutation,
  useGetFavoriteDecksQuery
} from 'features/api/apiSlice';
import { setGameStart } from 'features/game/GameSlice';
import { Field, Form, Formik, FormikHelpers } from 'formik';
import useAuth from 'hooks/useAuth';
import { CreateGameAPI } from 'interface/API/CreateGame.php';
import { toast } from 'react-hot-toast';
import { FaExclamationCircle } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import styles from './CreateGame.module.css';
import CreateGameErrors from './CreateGameErrors';
import validationSchema from './validationSchema';

const CreateGame = () => {
  const { isLoggedIn } = useAuth();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { data, isLoading } = useGetFavoriteDecksQuery({});
  const [createGame, createGameResult] = useCreateGameMutation();

  const initialValues: CreateGameAPI = {
    deck: '',
    fabdb: '',
    deckTestMode: false,
    format: isLoggedIn
      ? GAME_FORMAT.CLASSIC_CONSTRUCTED
      : GAME_FORMAT.OPEN_FORMAT,
    visibility: isLoggedIn ? GAME_VISIBILITY.PUBLIC : GAME_VISIBILITY.PRIVATE,
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

  const handleSubmit = async (
    values: CreateGameAPI,
    { setSubmitting }: FormikHelpers<CreateGameAPI>
  ) => {
    setSubmitting(true);
    console.log('submitting');
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
        navigate(`/game/lobby/${response.gameName}`, {
          state: { playerID: response.playerID ?? 0 }
        });
      }
    } catch (error) {
      console.warn(error);
      toast.error(String(error), { position: 'top-center' });
    } finally {
      setSubmitting(false);
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
        <Formik
          initialValues={initialValues}
          onSubmit={handleSubmit}
          validationSchema={validationSchema}
          enableReinitialize
        >
          {({ values, isSubmitting, errors, touched }) => (
            <Form>
              <div className={styles.formInner}>
                {isLoggedIn && !isLoading && (
                  <label>
                    Favorite Deck
                    <Field
                      as="select"
                      name="favoriteDecks"
                      id="favoriteDecks"
                      placeholder="Select a favorite deck"
                      aria-busy={isLoading}
                      aria-invalid={
                        (errors.favoriteDecks && touched.favoriteDecks) as
                          | boolean
                          | undefined
                      }
                    >
                      {data?.favoriteDecks.map((deck, ix) => (
                        <option value={deck.key} key={deck.index}>
                          {deck.name}
                        </option>
                      ))}
                    </Field>
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
                      aria-invalid={
                        (errors.fabdb && touched.fabdb) as boolean | undefined
                      }
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
                    aria-invalid={
                      (errors.gameDescription && touched.gameDescription) as
                        | boolean
                        | undefined
                    }
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
                    aria-invalid={
                      (errors.format && touched.format) as boolean | undefined
                    }
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
                      aria-invalid={
                        (errors.visibility && touched.visibility) as
                          | boolean
                          | undefined
                      }
                    >
                      {isLoggedIn && (
                        <option value={GAME_VISIBILITY.PUBLIC}>Public</option>
                      )}
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
                      aria-invalid={
                        (errors.deckTestMode && touched.deckTestMode) as
                          | boolean
                          | undefined
                      }
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
              <CreateGameErrors createGameResult={createGameResult.data} />
            </Form>
          )}
        </Formik>
      </article>
    </div>
  );
};

export default CreateGame;

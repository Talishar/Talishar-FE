import classNames from 'classnames';
import { GAME_FORMAT, GAME_VISIBILITY } from 'constants';
import { useCreateGameMutation } from 'features/api/apiSlice';
import { Field, Form, Formik, FormikHelpers } from 'formik';
import { CreateGameAPI } from 'interface/API/CreateGame.php';
import { handleRequest } from 'msw';
import React from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './CreateGame.module.css';

const CreateGame = () => {
  const navigate = useNavigate();
  const isLoggedIn = false; // TODO: useAuth(); handler or something
  const [createGame, createGameResult] = useCreateGameMutation();
  const initialValues: CreateGameAPI = {
    deck: '',
    fabdb: '',
    deckTestMode: false,
    format: GAME_FORMAT.CLASSIC_CONSTRUCTED,
    visibility: GAME_VISIBILITY.PUBLIC,
    decksToTry: '',
    favoriteDeck: false,
    favoriteDecks: '',
    gameDescription: ''
  };

  const handleSubmit = (
    values: CreateGameAPI,
    { setSubmitting }: FormikHelpers<CreateGameAPI>
  ) => {
    createGame(values);
  };

  const handleButtonClick = (e: React.MouseEvent<HTMLElement>) => {
    e.preventDefault();
    console.log('click mcclickerson');
    // navigate('/game/join/');
  };

  const buttonClass = classNames(styles.button, 'primary');

  return (
    <div>
      <article>
        <h3>Create New Game</h3>
        <h1>DOES NOT WORK GO TO REGULAR SITE TO PLAY ETC</h1>
        <h3>
          {createGameResult.error}
          {JSON.stringify(createGameResult.status)}
        </h3>
        <Formik initialValues={initialValues} onSubmit={handleSubmit}>
          {({ values }) => (
            <Form>
              <div className={styles.formContainer}>
                {!!isLoggedIn && (
                  <label>
                    Favorite Deck
                    <select
                      name="login"
                      id="selectFavorite"
                      placeholder="Login"
                      aria-label="Login"
                    >
                      <option>One</option>
                      <option>Two</option>
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
                  <label>
                    <Field
                      type="checkbox"
                      role="switch"
                      id="favoriteDeck"
                      name="favoriteDeck"
                    />
                    Save Deck to ❤️ Favorites
                  </label>
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
                <label>
                  Visibility
                  <Field
                    as="select"
                    name="visibility"
                    id="selectvisibility"
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
                  <br />
                </label>
              </div>
              <button type="submit" className={buttonClass}>
                Create Game
              </button>
            </Form>
          )}
        </Formik>
      </article>
    </div>
  );
};

export default CreateGame;

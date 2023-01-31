import { useAppDispatch } from 'app/Hooks';
import { GAME_FORMAT, GAME_VISIBILITY } from 'constants';
import { useJoinGameMutation } from 'features/api/apiSlice';
import { Formik, Form, Field } from 'formik';
import { JoinGameAPI } from 'interface/API/JoinGame.php';
import React from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './Join.module.css';

const JoinGame = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const isLoggedIn = false; // TODO: useAuth(); handler or something
  const [createGame, createGameResult] = useJoinGameMutation();
  const initialValues: JoinGameAPI = {
    deck: '',
    fabdb: '',
    deckTestMode: false,
    decksToTry: '',
    favoriteDeck: false,
    favoriteDecks: '',
    gameDescription: ''
  };

  const handleSubmit = () => {
    console.log('trying to join game');
  };

  return (
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
          <button type="submit" className={styles.buttonClass}>
            Create Game
          </button>
        </Form>
      )}
    </Formik>
  );
};

export default JoinGame;

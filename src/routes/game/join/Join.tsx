import React, { useState } from 'react';
import { useAppDispatch } from 'app/Hooks';
import { useJoinGameMutation } from 'features/api/apiSlice';
import { Formik, Form, Field, FormikHelpers } from 'formik';
import { JoinGameAPI } from 'interface/API/JoinGame.php';
import { useNavigate, useParams } from 'react-router-dom';
import styles from './Join.module.css';
import { useKnownSearchParams } from 'hooks/useKnownSearchParams';
import { setGameStart } from 'features/game/GameSlice';
import { toast } from 'react-hot-toast';

const JoinGame = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const [joinGame, joinGameResult] = useJoinGameMutation();
  const isLoggedIn = false; // TODO: useAuth(); handler or something

  let [{ gameName = '0', playerID = '2', authKey = '' }] =
    useKnownSearchParams();

  const { gameID } = useParams();
  gameName = gameID ?? gameName;

  const initialValues: JoinGameAPI = {
    deck: '',
    fabdb: '',
    deckTestMode: false,
    decksToTry: '',
    favoriteDeck: false,
    favoriteDecks: '',
    gameDescription: ''
  };

  const handleSubmit = async (
    values: JoinGameAPI,
    { setSubmitting }: FormikHelpers<JoinGameAPI>
  ) => {
    values.playerID = parseInt(playerID);
    values.gameName = parseInt(gameName);

    try {
      setSubmitting(true);
      const response = await joinGame(values).unwrap();
      if (response.error) {
        console.warn('error happened when trying to join');
        return;
      } else {
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
      toast.error(String(error));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className={styles.LoginPageContainer}>
      <article className={styles.formContainer}>
        <Formik initialValues={initialValues} onSubmit={handleSubmit}>
          {({ values, isSubmitting }) => (
            <Form>
              <div className={styles.form}>
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
              </div>
              <button
                type="submit"
                className={styles.buttonClass}
                aria-busy={isSubmitting}
              >
                Join Game
              </button>
            </Form>
          )}
        </Formik>
        <hr />
        <h2>Instructions</h2>
        <p>
          Choose a deck and click submit. You will be taken to the game lobby.
          Once in the game lobby, the player who win the dice roll choose if the
          go first. Then the host can start the game. Have Fun!
        </p>
      </article>
    </main>
  );
};

export default JoinGame;

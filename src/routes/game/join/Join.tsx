import React, { useState } from 'react';
import { useAppDispatch } from 'app/Hooks';
import {
  useGetFavoriteDecksQuery,
  useJoinGameMutation
} from 'features/api/apiSlice';
import { Formik, Form, Field, FormikHelpers } from 'formik';
import { JoinGameAPI } from 'interface/API/JoinGame.php';
import { Link, useNavigate, useParams } from 'react-router-dom';
import styles from './Join.module.css';
import { useKnownSearchParams } from 'hooks/useKnownSearchParams';
import { setGameStart } from 'features/game/GameSlice';
import { toast } from 'react-hot-toast';
import { FaExclamationCircle } from 'react-icons/fa';
import CreateGameErrors from '../create/CreateGameErrors';
import validationSchema from './validationSchema';
import useAuth from 'hooks/useAuth';
import classNames from 'classnames';

const JoinGame = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const [joinGame, joinGameResult] = useJoinGameMutation();
  const { data, isLoading } = useGetFavoriteDecksQuery(undefined);
  const { isLoggedIn } = useAuth();

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
    favoriteDecks:
      data?.lastUsedDeckIndex !== undefined
        ? data.favoriteDecks.find(
            (deck) => deck.index === data.lastUsedDeckIndex
          )?.key
        : '',
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
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className={styles.LoginPageContainer}>
      <article className={styles.formContainer}>
        <Formik
          initialValues={initialValues}
          onSubmit={handleSubmit}
          validationSchema={validationSchema}
        >
          {({ isSubmitting }) => (
            <Form>
              <div className={styles.form}>
                {isLoggedIn && !isLoading && (
                  <label>
                    Favorite Deck
                    <Field
                      as="select"
                      name="favoriteDecks"
                      id="favoriteDecks"
                      placeholder="Select a favorite deck"
                      aria-busy={isLoading}
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
              >
                Join Game
              </button>
              <CreateGameErrors createGameResult={joinGameResult.data} />
            </Form>
          )}
        </Formik>
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

import classNames from 'classnames';
import { Formik } from 'formik';
import React from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './CreateGame.module.css';

const CreateGame = () => {
  const navigate = useNavigate();
  const initialValues = {
    Wibble: '1'
  };
  const clickSubmitOptionsHandler = () => {
    console.log('click create game');
  };

  const handleButtonClick = (e: React.MouseEvent<HTMLElement>) => {
    e.preventDefault();
    console.log('click mcclickerson');
    navigate('/game/join/');
  };

  const buttonClass = classNames(styles.button, 'primary');
  return (
    <div>
      <article>
        <h3>Create New Game</h3>
        <h1>DOES NOT WORK GO TO REGULAR SITE TO PLAY ETC</h1>
        <Formik
          initialValues={initialValues}
          onSubmit={clickSubmitOptionsHandler}
        >
          {({ values }) => (
            <form>
              <div className={styles.formContainer}>
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
                <fieldset>
                  <label>
                    Deck Link:
                    <input
                      type="text"
                      id="deckLink"
                      name="deckLink"
                      aria-label="Deck Link"
                    />
                  </label>
                  <label>
                    <input
                      type="checkbox"
                      role="switch"
                      id="remember"
                      name="remember"
                    />
                    Save Deck to ❤️ Favorites
                  </label>
                </fieldset>
                <label>
                  Game Name
                  <input
                    type="text"
                    id="deckLink"
                    name="deckLink"
                    aria-label="Deck Link"
                    placeholder="Defaults to Game#14321542"
                  />
                </label>
                <label>
                  Format
                  <select
                    name="format"
                    id="selectFormat"
                    placeholder="Format"
                    aria-label="Format"
                  >
                    <option>Blitz</option>
                    <option>Classic Constructed</option>
                    <option>Competitive Blitz</option>
                    <option>Competitive CC</option>
                    <option>Commoner</option>
                    <option>Clash</option>
                    <option>Open Format (no restrictions!)</option>
                  </select>
                </label>
                <label>
                  Visibility
                  <select
                    name="format"
                    id="selectFormat"
                    placeholder="Format"
                    aria-label="Format"
                  >
                    <option>Public</option>
                    <option>Private</option>
                  </select>
                </label>
                <label>
                  <input
                    type="checkbox"
                    role="switch"
                    id="deckTestMode"
                    name="deckTestMode"
                  />
                  Single Player
                  <br />
                </label>
              </div>
              <button
                type="submit"
                className={buttonClass}
                onClick={handleButtonClick}
              >
                Create Game
              </button>
            </form>
          )}
        </Formik>
      </article>
    </div>
  );
};

export default CreateGame;

import { Formik } from 'formik';
import React from 'react';

const CreateGame = () => {
  const initialValues = {
    Wibble: '1'
  };
  const clickSubmitOptionsHandler = () => {
    console.log('click mcclickerson');
  };

  return (
    <div>
      <article>
        <h3>Create New Game</h3>
        <Formik
          initialValues={initialValues}
          onSubmit={clickSubmitOptionsHandler}
        >
          {({ values }) => (
            <form>
              <div>
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
              <button type="submit" className="primary">
                Login
              </button>
            </form>
          )}
        </Formik>
      </article>
    </div>
  );
};

export default CreateGame;

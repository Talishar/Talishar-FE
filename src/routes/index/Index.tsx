import { useGetGameListQuery } from 'features/api/apiSlice';
import React from 'react';

const Index = () => {
  const { data, isLoading, error } = useGetGameListQuery({});
  console.log(isLoading);
  console.log(error);
  return (
    <div>
      <h2>HELLO TALISHAR LOADMING</h2>
      <div>
        <div className="grid">
          <div>
            <hgroup>
              <h1>Sign in</h1>
              <h2>A minimalist layout for Login pages</h2>
            </hgroup>
            <form>
              <input
                type="text"
                name="login"
                placeholder="Login"
                aria-label="Login"
              />
              <input
                type="password"
                name="password"
                placeholder="Password"
                aria-label="Password"
              />
              <fieldset>
                <label>
                  <input
                    type="checkbox"
                    role="switch"
                    id="remember"
                    name="remember"
                  />
                  Remember me
                </label>
              </fieldset>
              <button type="submit" className="contrast">
                Login
              </button>
            </form>
          </div>
          <div></div>
        </div>
        {isLoading ? <div aria-busy="true">Loading!</div> : null}
        {error ? <div>ERROR!</div> : null}
        {data != undefined && data.gamesInProgress != undefined
          ? data.gamesInProgress.map((entry: any, ix: number) => {
              console.log(entry);
              return (
                <div key={ix}>
                  <div>
                    {data.p1Hero} V {data.p2Hero}
                  </div>
                  <div>{data.gameName}</div>
                </div>
              );
            })
          : null}
      </div>
    </div>
  );
};

export default Index;

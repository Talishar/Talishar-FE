import React, { PropsWithChildren } from 'react';
import { render } from '@testing-library/react';
import type { RenderOptions } from '@testing-library/react';
import type { PreloadedState } from '@reduxjs/toolkit';
import { Provider } from 'react-redux';
import { AppStore, RootState, setupStore } from '../src/app/Store';
import { OfflineTestingGameState } from '../src/features/game/InitialGameState';
import '../src/index.css';
import { MemoryRouter } from 'react-router-dom';

// This type interface extends the default options for render from RTL, as well
// as allows the user to specify other things such as initialState, store.
interface ExtendedRenderOptions extends Omit<RenderOptions, 'queries'> {
  store?: AppStore;
  children: React.ReactNode;
}

export const Wrapper: React.FC<ExtendedRenderOptions> = ({
  children,
  store
}) => {
  console.log(OfflineTestingGameState);
  store = setupStore({ game: OfflineTestingGameState });
  return (
    <>
      <Provider store={store}>
        <MemoryRouter>
          <div className="wrapped">{children}</div>
        </MemoryRouter>
      </Provider>
    </>
  );
};

export default Wrapper;

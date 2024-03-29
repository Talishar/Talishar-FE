import React from 'react';
import { Provider } from 'react-redux';
import { store } from 'app/Store';
import { createRoot } from 'react-dom/client';
import ChainLinks from './ChainLinks';

it('renders without crashing', () => {
  const div = document.createElement('div');
  const root = createRoot(div);
  root.render(
    <Provider store={store}>
      <ChainLinks />
    </Provider>
  );
  const display = document.querySelector('div');
  expect(display).toMatchInlineSnapshot('null');
});

import React from 'react';
import { Provider } from 'react-redux';
import { store } from '../../../../app/Store';
import { createRoot } from 'react-dom/client';
import MiddleRow from './MiddleRow';

it('renders without crashing isPlayer true', () => {
  const div = document.createElement('div');
  const root = createRoot(div);
  root.render(
    <Provider store={store}>
      <MiddleRow isPlayer />
    </Provider>
  );
});

it('renders without crashing isPlayer false', () => {
  const div = document.createElement('div');
  const root = createRoot(div);
  root.render(
    <Provider store={store}>
      <MiddleRow isPlayer={false} />
    </Provider>
  );
});

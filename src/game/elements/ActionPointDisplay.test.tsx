import React from 'react';
import { Provider } from 'react-redux';
import { store } from '../../app/Store';
import { createRoot } from 'react-dom/client';
import ActionPointDisplay from './ActionPointDisplay';

it('renders without crashing with isPlayer true', () => {
  const div = document.createElement('div');
  const root = createRoot(div);
  root.render(
    <Provider store={store}>
      <ActionPointDisplay isPlayer />
    </Provider>
  );
});

it('renders without crashing with isPlayer false', () => {
  const div = document.createElement('div');
  const root = createRoot(div);
  root.render(
    <Provider store={store}>
      <ActionPointDisplay isPlayer={false} />
    </Provider>
  );
});

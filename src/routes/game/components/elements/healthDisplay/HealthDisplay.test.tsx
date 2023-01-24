import React from 'react';
import { Provider } from 'react-redux';
import { store } from 'app/Store';
import { createRoot } from 'react-dom/client';
import HealthDisplay from './HealthDisplay';

it('renders without crashing iaPlayer true', () => {
  const div = document.createElement('div');
  const root = createRoot(div);
  root.render(
    <Provider store={store}>
      <HealthDisplay isPlayer />
    </Provider>
  );
});

it('renders without crashing iaPlayer false', () => {
  const div = document.createElement('div');
  const root = createRoot(div);
  root.render(
    <Provider store={store}>
      <HealthDisplay isPlayer={false} />
    </Provider>
  );
});

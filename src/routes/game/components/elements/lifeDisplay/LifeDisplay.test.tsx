import React from 'react';
import { Provider } from 'react-redux';
import { store } from 'app/Store';
import { createRoot } from 'react-dom/client';
import LifeDisplay from './LifeDisplay';

it('renders without crashing iaPlayer true', () => {
  const div = document.createElement('div');
  const root = createRoot(div);
  root.render(
    <Provider store={store}>
      <LifeDisplay isPlayer />
    </Provider>
  );
});

it('renders without crashing iaPlayer false', () => {
  const div = document.createElement('div');
  const root = createRoot(div);
  root.render(
    <Provider store={store}>
      <LifeDisplay isPlayer={false} />
    </Provider>
  );
});

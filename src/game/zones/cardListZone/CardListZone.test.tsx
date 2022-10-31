import React from 'react';
import { Provider } from 'react-redux';
import { store } from '../../../app/Store';
import { createRoot } from 'react-dom/client';
import CardListZone from './CardListZone';

it('renders without crashing isPlayer true', () => {
  const div = document.createElement('div');
  const root = createRoot(div);
  root.render(
    <Provider store={store}>
      <CardListZone />
    </Provider>
  );
});

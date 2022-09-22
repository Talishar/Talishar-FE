import React from 'react';
import CardDisplay from './CardDisplay';
import { Provider } from 'react-redux';
import { store } from '../../app/Store';
import { createRoot } from 'react-dom/client';

it('renders without crashing', () => {
  const div = document.createElement('div');
  const root = createRoot(div);
  root.render(
    <Provider store={store}>
      <CardDisplay />
    </Provider>
  );
});

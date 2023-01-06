import React from 'react';
import { Provider } from 'react-redux';
import { store } from '../../../app/Store';
import { createRoot } from 'react-dom/client';
import PlayerHandCard from './PlayerHandCard';

it('renders without crashing', () => {
  const div = document.createElement('div');
  const root = createRoot(div);
  root.render(
    <Provider store={store}>
      <PlayerHandCard handSize={0} cardIndex={0} />
    </Provider>
  );
});

it('renders a card', () => {
  const div = document.createElement('div');
  const root = createRoot(div);
  root.render(
    <Provider store={store}>
      <PlayerHandCard
        handSize={0}
        cardIndex={0}
        card={{ cardNumber: 'WTR001' }}
      />
    </Provider>
  );
});

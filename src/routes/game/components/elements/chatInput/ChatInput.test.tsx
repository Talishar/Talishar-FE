import React from 'react';
import { Provider } from 'react-redux';
import { store } from 'app/Store';
import { createRoot } from 'react-dom/client';
import ChatInput from './ChatInput';
import { BrowserRouter } from 'react-router-dom';

it('renders without crashing', () => {
  const div = document.createElement('div');
  const root = createRoot(div);
  root.render(
    <BrowserRouter>
      <Provider store={store}>
        <ChatInput />
      </Provider>
    </BrowserRouter>
  );
});

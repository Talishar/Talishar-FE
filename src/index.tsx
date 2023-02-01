import React from 'react';
import { createRoot } from 'react-dom/client';
import { Provider } from 'react-redux';
import { store } from './app/Store';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import reportWebVitals from './reportWebVitals';
import Index from './routes/index/Index';
import { ErrorPage } from 'errorPage';
import Play from 'routes/game/play/Play';
import './index.scss';
import { Toaster } from 'react-hot-toast';
import Join from 'routes/game/join/Join';
import Sideboard from 'routes/game/sideboard/Sideboard';

// Because we *must* have a root else the site won't work at all.
// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
const container = document.getElementById('root')!;
const root = createRoot(container);

export const router = createBrowserRouter([
  {
    path: '/',
    element: <Index />,
    errorElement: <ErrorPage />
  },
  {
    path: '/game/play',
    element: <Play />
  },
  {
    path: '/game/play/:gameName',
    element: <Play />
  },
  {
    path: '/game/join/:gameName',
    element: <Join />
  },
  {
    path: '/game/lobby/:gameName',
    element: <Sideboard />
  }
]);

root.render(
  <Provider store={store}>
    <Toaster
      position="top-left"
      toastOptions={{
        style: {
          background: '#004225',
          color: '#fffdd0',
          border: '1px solid #fffdd0',
          padding: '0.5rem'
        }
      }}
    />
    <RouterProvider router={router} />
  </Provider>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();

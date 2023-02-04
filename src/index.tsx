import { createRoot } from 'react-dom/client';
import { Provider } from 'react-redux';
import { store } from './app/Store';
import reportWebVitals from './reportWebVitals';
import './index.scss';
import { Toaster } from 'react-hot-toast';
import { router } from 'routes';
import { RouterProvider } from 'react-router-dom';

// Because we *must* have a root else the site won't work at all.
// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
const container = document.getElementById('root')!;
const root = createRoot(container);

root.render(
  <Provider store={store}>
    <Toaster
      position="top-left"
      toastOptions={{
        style: {
          background: 'var(--secondary)',
          color: 'var(--secondary-inverse)',
          border: '1px solid var(--secondary-inverse)',
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

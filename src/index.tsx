import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { Provider } from 'react-redux';
import { store } from './app/Store';
import reportWebVitals from './reportWebVitals';
import { CookiesProvider } from 'react-cookie';
import './index.scss';
import { Toaster } from 'react-hot-toast';
import { router } from 'routes';
import { RouterProvider } from 'react-router-dom';
import CookieConsent from 'components/CookieConsent';
import { initializeAdSense } from 'utils/adsenseInit';

// Initialize AdSense if user has already consented
initializeAdSense();

// Because we *must* have a root else the site won't work at all.
// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
const container = document.getElementById('root')!;
const root = createRoot(container);

root.render(
  <StrictMode>
    <CookiesProvider>
      <Provider store={store}>
        <Toaster
          position="top-left"
          toastOptions={{
            style: {
              background: 'var(--dark-red)',
              color: 'var(--white)',
              border: '1px solid var(--primary)',
              padding: '0.5rem',
              wordBreak: 'break-word',
              maxWidth: '100vh', 
              overflow: 'hidden', 
              textOverflow: 'ellipsis', 
              userSelect: 'none',
              msUserSelect: 'none',
              WebkitUserSelect: 'none',
              MozUserSelect: 'none',
            }
          }}
        />
        <style>{`
          div[role="status"]:first-of-type {
            margin-top: 70px !important;
          }
        `}</style>
        <RouterProvider router={router} />
      </Provider>
    </CookiesProvider>
  </StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();

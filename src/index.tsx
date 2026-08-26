import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { Provider } from 'react-redux';
import { store } from './app/Store';
import reportWebVitals from './reportWebVitals';
import { CookiesProvider } from 'react-cookie';
import { appCookies } from 'utils/cookieStore';
import './index.scss';
import { router } from 'routes';
import { RouterProvider } from 'react-router-dom';
import { ThemeProvider } from './themes/ThemeContext';
import {
  observeLongTasks,
  reportPerformanceMetric
} from 'utils/performanceMetrics';
import { attemptAssetRecovery } from 'utils/assetRecovery';

import './i18n';

window.addEventListener('vite:preloadError', (event) => {
  if (attemptAssetRecovery()) event.preventDefault();
});

// Because we *must* have a root else the site won't work at all.
// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
const container = document.getElementById('root')!;
const root = createRoot(container);

root.render(
  <StrictMode>
    <CookiesProvider cookies={appCookies}>
      <ThemeProvider>
        <Provider store={store}>
          <RouterProvider router={router} />
        </Provider>
      </ThemeProvider>
    </CookiesProvider>
  </StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals((metric) => {
  reportPerformanceMetric({
    name: metric.name,
    value: metric.value,
    rating: metric.rating,
    id: metric.id
  });
});

observeLongTasks();

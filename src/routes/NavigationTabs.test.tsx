import { act, render, screen, waitFor } from '@testing-library/react';
import { transferableAbortController } from 'node:util';
import { Suspense } from 'react';
import { Provider } from 'react-redux';
import { createMemoryRouter, RouterProvider } from 'react-router-dom';
import { vi } from 'vitest';
import { setupStore } from 'app/Store';
import { apiSlice } from 'features/api/apiSlice';
import { learnTab, NavigationTabs, playTab } from './NavigationTabs';

vi.mock('./index/Index', () => ({ default: () => <main>Play content</main> }));
vi.mock('./about/About', () => ({ default: () => null }));
vi.mock('hooks/useAdScript', () => ({ default: () => undefined }));
vi.mock('hooks/useSupporterStatus', () => ({
  default: () => ({ showAds: false })
}));

it('warms the Learn data after Play renders and reuses it on navigation', async () => {
  // The data router uses Node's Request, which needs a Node AbortSignal.
  const controller = transferableAbortController();
  vi.stubGlobal('AbortController', controller.constructor);
  vi.stubGlobal('AbortSignal', controller.signal.constructor);

  let runIdleCallback: IdleRequestCallback | undefined;
  vi.stubGlobal('requestIdleCallback', (callback: IdleRequestCallback) => {
    runIdleCallback = callback;
    return 1;
  });
  vi.stubGlobal('cancelIdleCallback', vi.fn());
  const guides = {
    guides: [],
    meta: { pagination: { current_page: 1, per_page: 20, total_pages: 1 } }
  };
  const guidesUrl = '/api/GetMetafyGuides.php?page=1&per_page=20';
  const fetchMock = vi.spyOn(window, 'fetch').mockImplementation(async (url) =>
    String(url) === guidesUrl
      ? new Response(JSON.stringify(guides))
      : new Response(null, { status: 404 })
  );
  const guideRequests = () =>
    fetchMock.mock.calls.filter(([url]) => String(url) === guidesUrl);
  const store = setupStore();
  const router = createMemoryRouter([
    {
      element: <NavigationTabs />,
      children: [
        { path: '/', element: <playTab.Page /> },
        { path: '/learn', element: <learnTab.Page /> }
      ]
    }
  ]);
  const view = render(
    <Provider store={store}>
      <Suspense fallback={null}>
        <RouterProvider router={router} future={{ v7_startTransition: true }} />
      </Suspense>
    </Provider>
  );

  try {
    expect(await screen.findByText('Play content')).toBeVisible();
    expect(guideRequests()).toHaveLength(0);
    await waitFor(() => expect(runIdleCallback).toBeDefined());
    act(() => runIdleCallback?.({ didTimeout: false, timeRemaining: () => 50 }));
    await waitFor(() => {
      expect(
        apiSlice.endpoints.getMetafyGuides.select(1)(store.getState()).data
      ).toEqual(guides);
    });
    expect(guideRequests()).toHaveLength(1);

    await import('./learn/Learn');
    await act(() => router.navigate('/learn'));
    expect(
      screen.getByRole('heading', { level: 1, name: /learn/i })
    ).toBeInTheDocument();
    expect(screen.getByText('No guides available at this time.')).toBeVisible();
    expect(guideRequests()).toHaveLength(1);
  } finally {
    view.unmount();
    store.dispatch(apiSlice.util.resetApiState());
    fetchMock.mockRestore();
    vi.unstubAllGlobals();
  }
});

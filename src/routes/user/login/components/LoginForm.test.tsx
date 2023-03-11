import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { Route, Routes } from 'react-router-dom';
import { renderWithProviders } from 'utils/TestUtils';
import { rest } from 'msw';

class ResizeObserver {
  observe() {
    // do nothing
  }
  unobserve() {
    // do nothing
  }
  disconnect() {
    // do nothing
  }
}

window.ResizeObserver = ResizeObserver;

import { LoginForm } from './LoginForm';

it('links to password recovery', async () => {
  renderWithProviders(
    <Routes>
      <Route index element={<LoginForm />} />
      <Route
        path="password-recovery"
        element={<span>password-recovery page</span>}
      />
    </Routes>
  );
  userEvent.click(screen.getByText('Forgotten Password?'));
  await screen.findByText('password-recovery page');
});

it('links to signup', async () => {
  renderWithProviders(
    <Routes>
      <Route index element={<LoginForm />} />
      <Route path="signup" element={<span>signup page</span>} />
    </Routes>
  );
  userEvent.click(screen.getByText('Sign Up'));
  await screen.findByText('signup page');
});

// TODO: Animation errors here
it.skip('shows an error message when failing to login', async () => {
  renderWithProviders(<LoginForm />);

  userEvent.type(screen.getByPlaceholderText('bravo'), 'testUserId');
  userEvent.type(screen.getByPlaceholderText('********'), 'testPassword');
  userEvent.click(screen.getByText('Submit'));

  await waitFor(() => {
    expect(screen.getByText('Submit')).toHaveAttribute('aria-busy', 'true');
    expect(screen.getByText('Submit')).toBeDisabled();
  });

  await waitFor(() => {
    expect(screen.getByText('Submit')).toHaveAttribute('aria-busy', 'false');
    expect(screen.getByText('Submit')).not.toBeDisabled();
  });

  expect(screen.getByText('Incorrect username or password.')).toBeVisible();
});

// TODO: add happy path test (need to modify msw)

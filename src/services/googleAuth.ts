const STATE_KEY = 'googleOAuthState';

export const GOOGLE_CLIENT_ID: string =
  (import.meta as any).env?.VITE_GOOGLE_CLIENT_ID || '';

export const getGoogleRedirectUri = (): string =>
  (import.meta as any).env?.VITE_GOOGLE_LOGIN_REDIRECT_URI ||
  `${window.location.origin}/auth/google-signup`;

export const startGoogleLogin = () => {
  const bytes = new Uint8Array(16);
  crypto.getRandomValues(bytes);
  const state = Array.from(bytes, (b) => b.toString(16).padStart(2, '0')).join(
    ''
  );
  try {
    sessionStorage.setItem(STATE_KEY, state);
  } catch {
    // ignore
  }
  const params = new URLSearchParams({
    client_id: GOOGLE_CLIENT_ID,
    redirect_uri: getGoogleRedirectUri(),
    response_type: 'code',
    scope: 'openid email profile',
    prompt: 'select_account',
    state
  });
  window.location.href = `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
};

export const consumeGoogleState = (state: string | null): boolean => {
  let expected: string | null = null;
  try {
    expected = sessionStorage.getItem(STATE_KEY);
    sessionStorage.removeItem(STATE_KEY);
  } catch {
    return false;
  }
  return !!state && !!expected && state === expected;
};

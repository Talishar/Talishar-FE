export const isSessionExpired = (error: unknown) =>
  typeof error === 'object' &&
  error !== null &&
  'status' in error &&
  (error as { status: unknown }).status === 401;

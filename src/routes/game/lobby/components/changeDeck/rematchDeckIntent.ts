const STORAGE_KEY = 'rematchDeckChange';
const MAX_AGE_MS = 10 * 60 * 1000;

export const markRematchDeckChange = (gameID: number) => {
  try {
    sessionStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ gameID, at: Date.now() })
    );
  } catch {
    // storage unavailable
  }
};

export const consumeRematchDeckChange = (gameID: number): boolean => {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return false;
    const { gameID: storedID, at } = JSON.parse(raw);
    if (storedID !== gameID) return false;
    sessionStorage.removeItem(STORAGE_KEY);
    return Date.now() - Number(at) < MAX_AGE_MS;
  } catch {
    return false;
  }
};

export interface ServerErrorCard {
  id: string;
  name: string;
  pitch: number;
}

export interface ServerError {
  title: string;
  cards?: ServerErrorCard[];
}

const LEADING_SYMBOLS = /^[\s⚠️]+/;

export const cleanServerMessage = (message: string): string =>
  message.replace(LEADING_SYMBOLS, '').trim();

// With `cards` the message ends in the same list as text, so only its lead-in is kept.
export const toServerError = (
  message: string,
  cards?: ServerErrorCard[] | null
): ServerError => {
  const text = cleanServerMessage(message);
  if (!cards || cards.length === 0) return { title: text };
  const listStart = text.indexOf(': ');
  return { title: listStart > 0 ? text.slice(0, listStart) : text, cards };
};

const RTK_STATUS = /^[A-Z_]+_ERROR$/;

// Turns whatever a create/join mutation threw into one readable line.
// The mutations reject with only the RTK status (500, "FETCH_ERROR"), which the fallback replaces.
export const describeThrownError = (
  error: unknown,
  fallback: string
): string => {
  if (typeof error === 'string') {
    const text = cleanServerMessage(error);
    return text === '' || RTK_STATUS.test(text) ? fallback : text;
  }
  if (error instanceof Error) return error.message || fallback;
  if (error && typeof error === 'object') {
    const data = (error as { data?: unknown }).data;
    const dataError =
      data && typeof data === 'object'
        ? (data as { error?: unknown }).error
        : undefined;
    if (typeof dataError === 'string' && dataError !== '') {
      return cleanServerMessage(dataError);
    }
    const message = (error as { message?: unknown }).message;
    if (typeof message === 'string' && message !== '') return message;
  }
  return fallback;
};

import { CHAT_WHEEL } from 'constants/chatMessages';

const RECENTS_KEY = 'talishar_chat_recents';
const MAX_RECENTS = 5;

const isQuickChatKey = (value: unknown): value is number =>
  typeof value === 'number' && Number.isInteger(value) && CHAT_WHEEL.has(value);

export function getQuickChatRecents(storage: Storage = localStorage): number[] {
  try {
    const parsed: unknown = JSON.parse(storage.getItem(RECENTS_KEY) ?? '[]');
    if (!Array.isArray(parsed)) return [];

    return Array.from(new Set(parsed.filter(isQuickChatKey))).slice(
      0,
      MAX_RECENTS
    );
  } catch {
    return [];
  }
}

export function addQuickChatRecent(
  key: number,
  storage: Storage = localStorage
): number[] {
  if (!isQuickChatKey(key)) return getQuickChatRecents(storage);

  const recents = [
    key,
    ...getQuickChatRecents(storage).filter((recentKey) => recentKey !== key)
  ].slice(0, MAX_RECENTS);

  try {
    storage.setItem(RECENTS_KEY, JSON.stringify(recents));
  } catch {
    // Storage can be unavailable or full; the in-memory UI can still update.
  }

  return recents;
}

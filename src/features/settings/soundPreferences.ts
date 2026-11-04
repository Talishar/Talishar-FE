export type GameSound = 'priority' | 'shuffle' | 'handReorder' | 'playerJoined';

export const SOUND_VOLUME_COOKIE = 'soundVolume';
export const SOUND_VOLUME_MIN = 0.05;
export const SOUND_VOLUME_MAX = 1;

export const SOUND_DISABLE_COOKIES: Record<GameSound, string> = {
  priority: 'disablePrioritySound',
  shuffle: 'disableShuffleSound',
  handReorder: 'disableHandReorderSound',
  playerJoined: 'disablePlayerJoinedSound'
};

export const BASE_VOLUME: Record<GameSound, number> = {
  priority: 1,
  shuffle: 0.5,
  handReorder: 0.5,
  playerJoined: 1
};

export const parseSoundVolume = (raw: unknown) => {
  const value = Number(raw);
  if (
    raw === undefined ||
    raw === null ||
    raw === '' ||
    !Number.isFinite(value) ||
    value <= 0
  )
    return SOUND_VOLUME_MAX;
  return Math.min(SOUND_VOLUME_MAX, Math.max(SOUND_VOLUME_MIN, value));
};

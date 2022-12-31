// For dev env use local proxy, on production connect directly to server.
export const GAME_LIMIT_LIVE = 10000;
export const GAME_LIMIT_BETA = 1000;

export const API_URL_BETA = import.meta.env.DEV
  ? `/api/beta/`
  : 'https://beta.talishar.net/game/';
export const API_URL_LIVE = import.meta.env.DEV
  ? `/api/live/`
  : 'https://talishar.net/game/';
export const API_URL_DEV = import.meta.env.DEV
  ? `/api/dev/`
  : 'https://talishar.net/game/';

// what playmat is the default
export const DEFAULT_PLAYMAT = `Default`;

// How long in ms for a click versus 'long press'
// TODO: make this user definable
export const LONG_PRESS_TIMER = 250;

// BE query enums:
export const PLAYER_OPTIONS = 'mySettings';
export const END_GAME_STATS = 'myStatsPopup';
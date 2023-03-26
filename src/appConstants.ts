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

// in pixels
export const BREAKPOINT_SMALL = 576;
export const BREAKPOINT_MEDIUM = 768;
export const BREAKPOINT_LARGE = 992;
export const BREAKPOINT_EXTRA_LARGE = 1200;

// How long in ms for a click versus 'long press'
// TODO: make this user definable
export const LONG_PRESS_TIMER = 250;

// BE query enums:
export const PLAYER_OPTIONS = 'mySettings';
export const END_GAME_STATS = 'myStatsPopup';

// Process Input Enums
export const PROCESS_INPUT = {
  PLAY_EQUIPMENT_ABILITY: 3,
  ADD_TO_ARSENAL: 4,
  PLAY_FROM_ARSENAL: 5,
  PITCH_DECK: 6,
  NUMBER_INPUT: 7,
  OPT_CHOOSE_TOP_OR_BOTTOM: 9,
  ITEM_ABILITY: 10,
  CHOOSE: 18,
  BUTTON_INPUT: 17,
  MULTI_CHOOSE: 19,
  YES_NO: 20,
  COMBAT_CHAIN_ABILITY: 21,
  AURA_ABILITY: 22,
  CHOOSE_CARD: 23,
  ALLY_ABILITY: 24,
  LANDMARK_ABILITY: 25,
  CHANGE_SETTING: 26,
  PLAY_FROM_HAND: 27,
  PAY_OR_DISCARD: 28,
  CHOOSE_TOP_OPPONENT: 29,
  NAME_CARD: 30,
  REORDER_LAYERS: 33,
  PASS: 99,
  BREAK_COMBAT_CHAIN: 100,
  PASS_BLOCK_AND_REACTIONS: 101,
  TOGGLE_EQUIPMENT_ACTIVE: 102,
  TOGGLE_PERMANENT_ACTIVE: 103,
  TOGGLE_OPPONENT_PERMANENT_ACTIVE: 104,

  UNDO: 10000,
  CANCEL_BLOCKS: 10001,
  REVERT_TO_PRIOR_TURN: 10003,

  // Manual Mode
  ADD_ACTION_POINT: 10002,
  SUBTRACT_ACTION_POINT: 10004,
  ADD_1_HP_SELF: 10006,
  SUBTRACT_1_HP_SELF: 10005,
  ADD_1_HP_OPPOENNT: 10008,
  SUBTRACT_1_HP_OPPONENT: 10007,
  DRAW_CARD_SELF: 10009,
  DRAW_CARD_OPPONENT: 10010,
  ADD_CARD_TO_HAND_SELF: 10011,
  ADD_RESOURCE_TO_POOL_SELF: 10012,
  ADD_RESOURCE_TO_POOL_OPPONENT: 10013,
  REMOVE_RESOURCE_FROM_POOL_OPPONENT: 10014,
  REMOVE_RESOURCE_FROM_POOL_SELF: 10015,

  // End game options
  QUICK_REMATCH: 100000,
  MAIN_MENU: 100001,
  CONCEDE_GAME: 100002,
  REPORT_BUG: 100003,
  FULL_REMATCH: 100004,
  CURRENT_PLAYER_INACTIVE: 100005,
  CURRENT_PLAYER_ACTIVE: 100006,
  CLAIM_VICTORY_OVER_INACTIVE_OPPONENT: 100007,
  RATING_THUMBS_UP: 100008,
  RATING_THUMBS_DOWN: 100009,
  GRANT_BADGE: 100010,
  ROGUELIKE_RESUME_ADVENTURE: 100011,
  CREATE_REPLAY: 100012,
  ALLOW_SPECTATORS: 100013
};

// Default shortcut inputs
export const DEFAULT_SHORTCUTS = {
  TOGGLE_OPTIONS_MENU: 'KeyM',
  PASS_TURN: 'Space',
  CLOSE_WINDOW: 'Escape'
};

export const GAME_FORMAT = {
  CLASSIC_CONSTRUCTED: 'cc',
  COMPETITIVE_CC: 'compcc',
  BLITZ: 'blitz',
  COMPETITIVE_BLITZ: 'compblitz',
  OPEN_FORMAT: 'livinglegendscc',
  COMMONER: 'commoner',
  CLASH: 'clash'
};

export const URL_END_POINT = {
  GET_GAME_LIST: 'APIs/GetGameList.php',
  CREATE_GAME: 'APIs/CreateGame.php',
  SUBMIT_CHAT: 'SubmitChat.php',
  GET_POPUP: 'GetPopupAPI.php',
  GAME_STATE_POLL: 'GetNextTurn3.php?',
  PROCESS_INPUT: 'ProcessInput2.php?',
  PROCESS_INPUT_POST: 'ProcessInputAPI.php',
  PARSE_GAME_FILE: 'APIs/ParseGameFile.php',
  CHOOSE_FIRST_PLAYER: 'APIs/ChooseFirstPlayer.php',
  GET_FAVORITE_DECKS: 'APIs/GetFavoriteDecks.php',
  GET_LOBBY_INFO: 'APIs/GetLobbyInfo.php',
  GET_LOBBY_REFRESH: 'APIs/GetLobbyRefresh.php',
  JOIN_GAME: 'APIs/JoinGame.php',
  SUBMIT_SIDEBOARD: 'APIs/SubmitSideboard.php',
  USER_PROFILE: 'APIs/UserProfileAPI.php',
  START_GAME_LEGACY: 'Start.php',
  LOGIN: 'AccountFiles/PasswordLoginAPI.php',
  LOGIN_WITH_COOKIE: 'AccountFiles/TryLoginAPI.php',
  LOGOUT: `AccountFiles/LogoutUserAPI.php`,
  SIGNUP: `AccountFiles/SignupAPI.php`,
  FORGOT_PASSWORD: `AccountFiles/PasswordResetRequestAPI.php`
};

export const GAME_VISIBILITY = {
  PUBLIC: 'public',
  PRIVATE: 'private'
};

export const ADD_DECK_TO_FAVORITES = {
  TRUE: 1,
  FALSE: 0
};

export const ZONE = {
  HAND: 'HAND',
  HERO: 'HERO',
  ALLIES: 'ALLIES',
  EQUIPMENT: 'EQUIPMENT',
  ITEMS: 'ITEMS',
  ARSENAL: 'ARSENAL',
  AURAS: 'AURAS',
  PERMANENTS: 'PERMANENTS',
  LANDMARKS: 'LANDMARKS'
};

export const QUERY_STATUS = {
  SUCCESS: 'success',
  FAILED: 'failed',
  LOADING: 'loading',
  IDLE: 'idle'
};

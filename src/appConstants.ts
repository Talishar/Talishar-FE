// For dev env use local proxy, on production connect directly to server.
export const GAME_LIMIT_LIVE = 1000000;
export const GAME_LIMIT_BETA = 1000;

export const CLOUD_IMAGES_URL = 'https://images.talishar.net/public';

export const BACKEND_URL = import.meta.env.DEV
  ? '/api/'
  : `https://${import.meta.env.VITE_BACKEND_URL}/${
      import.meta.env.VITE_BACKEND_DIRECTORY
    }/`;

export const ROGUELIKE_URL = import.meta.env.DEV
  ? '/roguelike/'
  : `https://${import.meta.env.VITE_ROGUELIKE_URL}/${
      import.meta.env.VITE_ROGUELIKE_DIRECTORY
    }/`;

export const DATADOLL_URL = import.meta.env.DEV
  ? '/datadoll/'
  : `https://${import.meta.env.VITE_DATADOLL_URL}/`;

// what playmat is the default
export const DEFAULT_PLAYMAT = `Default`;

// in pixels
export const BREAKPOINT_SMALL = 576;
export const BREAKPOINT_MEDIUM = 768;
export const BREAKPOINT_LARGE = 992;
export const BREAKPOINT_EXTRA_LARGE = 1200;

// How long in ms for a click versus 'long press'
// TODO: make this user definable
export const LONG_PRESS_TIMER = 200;

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
  PLAY_FROM_BANISH: 14,
  PLAY_FROM_THEIR_BANISH: 15,
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
  PLAY_FROM_DECK: 35,
  PASS: 99,
  BREAK_COMBAT_CHAIN: 100,
  PASS_BLOCK_AND_REACTIONS: 101,
  TOGGLE_EQUIPMENT_ACTIVE: 102,
  TOGGLE_PERMANENT_ACTIVE: 103,
  TOGGLE_OPPONENT_PERMANENT_ACTIVE: 104,
  SKIP_ALL_RUNECHANTS: 105,

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
  REMOVE_ARSENAL_FROM_SELF: 10016,

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
  ALLOW_SPECTATORS: 100013,
  REPORT_PLAYER: 100014,
  ENABLE_CHAT: 100015,
  CONFIRM_UNDO: 100016,
  DECLINE_UNDO: 100017,
  CONFIRM_THIS_TURN_UNDO: 100018,
  CONFIRM_LAST_TURN_UNDO: 100019,
  DECLINE_CHAT: 100020
};

// Default shortcut inputs
export const DEFAULT_SHORTCUTS = {
  TOGGLE_OPTIONS_MENU: 'KeyM',
  PASS_TURN: 'Space',
  CLOSE_WINDOW: 'Escape',
  UNDO: 'KeyU',
  UNDOALT: 'KeyZ',
  TOGGLE_MANUAL_MODE: 'KeyN'
};

export const GAME_FORMAT = {
  CLASSIC_CONSTRUCTED: 'cc',
  COMPETITIVE_CC: 'compcc',
  BLITZ: 'blitz',
  COMPETITIVE_BLITZ: 'compblitz',
  OPEN_CC: 'openformatcc',
  COMMONER: 'commoner',
  CLASH: 'clash',
  SEALED: 'sealed',
  DRAFT: 'draft',
  LLCC: 'llcc',
  //LLBLITZ: 'llblitz',
  OPEN_BLITZ: 'openformatblitz',
  OPEN_LL_CC: 'openformatllcc',
  BRAWL: 'brawl',
  PRECON: 'precon',
  COMPETITIVE_LL: "compllcc",
  SAGE: "sage",
  COMPETITIVE_SAGE: "compsage"
  //OPEN_LL_BLITZ: 'openformatllblitz'
};

export const GAME_FORMAT_NUMBER = {
  CLASSIC_CONSTRUCTED: '0',
  COMPETITIVE_CC: '1',
  BLITZ: '2',
  COMPETITIVE_BLITZ: '3',
  OPEN_CC: '4',
  COMMONER: '5',
  CLASH: '-1',
  SEALED: '6',
  DRAFT: '7',
  LLCC: '8',
  //LLBLITZ: '9',
  OPEN_BLITZ: '10',
  OPEN_LL_CC: '11',
  //OPEN_LL_BLITZ: '12'
  PRECON: '-2',
  COMPETITIVE_LL: '13',
  SAGE: '14',
  COMPETITIVE_SAGE: '15'
};

// Create a mapping from number format to string format for normalization
const FORMAT_NUMBER_TO_STRING: { [key: string]: string } = Object.entries(GAME_FORMAT_NUMBER).reduce(
  (acc, [key, value]) => {
    const stringKey = key as keyof typeof GAME_FORMAT;
    if (stringKey in GAME_FORMAT) {
      acc[value] = GAME_FORMAT[stringKey];
    }
    return acc;
  },
  {} as { [key: string]: string }
);

/**
 * Normalizes format values to their string representation (GAME_FORMAT values)
 * Handles both string formats ('precon') and number formats ('-2')
 */
export const normalizeFormat = (format: string | number | null | undefined): string | null => {
  if (!format) return null;
  const formatStr = String(format);
  // If it's a number format, convert to string format
  return FORMAT_NUMBER_TO_STRING[formatStr] || formatStr;
};

/**
 * Checks if a format is preconstructed, handling both string and number formats
 */
export const isPreconFormat = (format: string | number | null | undefined): boolean => {
  const normalized = normalizeFormat(format);
  return normalized === GAME_FORMAT.PRECON;
};

export const AI_DECK = {
  COMBAT_DUMMY: 'Dummy',
  IRABLITZ: 'Ira',
  FAICC: 'FaiCC'
};

export const URL_END_POINT = {
  GET_GAME_LIST: 'APIs/GetGameList.php',
  CREATE_GAME: 'APIs/CreateGame.php',
  SUBMIT_CHAT: 'SubmitChat.php',
  GET_POPUP: 'GetPopupAPI.php',
  GAME_STATE_POLL: 'GetNextTurn.php?',
  PROCESS_INPUT: 'ProcessInput.php?',
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
  FORGOT_PASSWORD: `AccountFiles/PasswordResetRequestAPI.php`,
  RESET_PASSWORD: `AccountFiles/ResetPassword.php`,
  GET_COSMETICS: `APIs/GetCosmetics.php`,
  DELETE_DECK: `APIs/DeleteDeckAPI.php`,
  PATREON_LOGIN: `AccountFiles/PatreonLoginAPI.php`,
  LOAD_BUG_REPORT: `LoadBugReport.php`,
  SUBMIT_LOBBY_INPUT: 'APIs/SubmitLobbyInput.php',
  BLOCK_USER: 'include/BlockUser.php',
  GET_MOD_PAGE_DATA: 'APIs/GetModPageData.php',
  BAN_PLAYER: 'BanPlayer.php',
  CLOSE_GAME: 'CloseGame.php'
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

export const PLAYMATS = [
  'aria',
  'demonastery',
  'metrix',
  'misteria',
  'pits',
  'savage',
  'solana',
  'volcor',
  'Bare-Fangs-AHS',
  'Erase-Face-AHS',
  'Dusk-Till-Dawn-AHS',
  'Exude-Confidence-AHS',
  'Command-and-Conquer-AHS',
  'Swarming-Gloomveil-AHS',
  'FindCenter'
];

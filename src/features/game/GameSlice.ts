import {
  createAsyncThunk,
  createSlice,
  PayloadAction,
  createSelector,
  current,
  original,
  type Draft
} from '@reduxjs/toolkit';
import { preserveIdentities } from 'utils/PreserveIdentities';
import InitialGameState from './InitialGameState';
import GameStaticInfo, { AltArt } from '../GameStaticInfo';
import { Card } from '../Card';
import { BACKEND_URL, ROGUELIKE_URL, URL_END_POINT } from 'appConstants';
import Button from '../Button';
import GameState from '../GameState';
import Player from '../Player';
import {
  GetLobbyRefresh,
  GetLobbyRefreshResponse
} from 'interface/API/GetLobbyRefresh.php';
import { RootState } from 'app/Store';
import {
  deleteGameAuthKey,
  loadGameAuthKey,
  saveGameAuthKey,
  loadGamePlayerID
} from 'utils/LocalKeyManagement';
import { parseBackendJson } from 'utils/parseBackendResponse';
import isEqual from 'react-fast-compare';
import { CardStack } from '../../routes/game/components/zones/permanentsZone/PermanentsZone';
import { reportPerformanceMetric } from 'utils/performanceMetrics';

const CHAT_RE = /<span[^>]*>(.*?):\s<\/span>/;

const processInputParams = (gameInfo: GameStaticInfo): URLSearchParams =>
  new URLSearchParams({
    gameName: String(gameInfo.gameID),
    playerID: String(gameInfo.playerID),
    authKey: String(gameInfo.authKey)
  });

const sendProcessInput = async (
  label: string,
  gameInfo: GameStaticInfo,
  queryParams: URLSearchParams,
  extraQuery = ''
): Promise<void> => {
  const startedAt = performance.now();
  const baseURL = gameInfo.isRoguelike ? ROGUELIKE_URL : BACKEND_URL;
  const queryURL = `${baseURL}${URL_END_POINT.PROCESS_INPUT}`;

  let response: Response;
  try {
    response = await fetch(queryURL + queryParams.toString() + extraQuery, {
      method: 'GET',
      headers: {},
      credentials: 'include'
    });
  } catch (e) {
    console.error(
      `[${label}] Network error:`,
      e,
      '| params:',
      Object.fromEntries(queryParams)
    );
    throw e;
  }

  const data = await response.text();
  reportPerformanceMetric({
    name: 'game-action-response',
    value: performance.now() - startedAt
  });
  if (!response.ok || data.startsWith('Invalid')) {
    console.error(
      `[${label}] Backend error:`,
      data,
      '| params:',
      Object.fromEntries(queryParams)
    );
    throw new Error(`${label} failed (HTTP ${response.status}): ${data}`);
  }
};

export const gameLobby = createAsyncThunk(
  'gameLobby/getLobby',
  async (params: {
    game: GameStaticInfo;
    signal: AbortSignal | undefined;
    lastUpdate: number;
  }) => {
    const queryURL = `${BACKEND_URL}${URL_END_POINT.GET_LOBBY_REFRESH}`;

    const requestBody = {
      gameName: params.game.gameID,
      playerID: params.game.playerID,
      authKey: params.game.authKey,
      lastUpdate: params.lastUpdate
    } as GetLobbyRefresh;

    let data: string;
    try {
      const response = await fetch(queryURL, {
        method: 'POST',
        headers: {},
        credentials: 'include',
        signal: params.signal,
        body: JSON.stringify(requestBody)
      });
      data = (await response.text()).trim();
    } catch (e) {
      // An aborted poll is routine (game switch, unmount), not a failure.
      if (params.signal?.aborted) return;
      throw e;
    }
    if (data === '0') return;

    const parsedData = parseBackendJson(data) as GetLobbyRefreshResponse;
    if (Object.keys(parsedData).length === 0) return;
    return parsedData;
  }
);

export const playCard = createAsyncThunk(
  'game/playCard',
  async (params: { cardParams: Card; cardIndex?: number }, { getState }) => {
    const { game } = getState() as { game: GameState };

    const playNo =
      params.cardParams.actionDataOverride != ''
        ? params.cardParams.actionDataOverride
        : params.cardIndex;

    const queryParams = processInputParams(game.gameInfo);
    queryParams.set('mode', String(params.cardParams.action));
    queryParams.set('cardID', String(playNo));

    await sendProcessInput('playCard', game.gameInfo, queryParams);
  }
);

export const submitButton = createAsyncThunk(
  'game/submitButton',
  async (params: { button: Button }, { getState }) => {
    const { game } = getState() as { game: GameState };

    const queryParams = processInputParams(game.gameInfo);
    queryParams.set('mode', String(params.button.mode ?? ''));
    if (params.button.buttonInput !== undefined)
      queryParams.set('buttonInput', String(params.button.buttonInput));
    if (params.button.inputText !== undefined)
      queryParams.set('inputText', String(params.button.inputText));
    if (params.button.cardID !== undefined)
      queryParams.set('cardID', String(params.button.cardID));
    if (params.button.numMode !== undefined)
      queryParams.set('numMode', String(params.button.numMode));

    await sendProcessInput('submitButton', game.gameInfo, queryParams);
  }
);

export const submitMultiButton = createAsyncThunk(
  'game/submitMultiButton',
  async (params: { mode?: number; extraParams: string }, { getState }) => {
    if (params.mode === undefined) return;
    const { game } = getState() as { game: GameState };

    const queryParams = processInputParams(game.gameInfo);
    queryParams.set('mode', String(params.mode));

    await sendProcessInput(
      'submitMultiButton',
      game.gameInfo,
      queryParams,
      params.extraParams
    );
  }
);

const STICKY_PLAYER_FIELDS = [
  'Name',
  'isPatron',
  'isContributor',
  'isPvtVoidPatron',
  'metafyTiers'
] as const;

const FALLBACK_GAME_INFO_FIELDS = [
  'gameGUID',
  'roguelikeGameID',
  'isPrivate',
  'isReplay',
  'isOpponentAI',
  'gameFormat',
  'deckLink',
  'canCustomizeDeck',
  'deckCardBackId',
  'deckPlaymatId'
] as const;

const mergePlayer = (prev: Player, incoming: Player | undefined): Player => {
  const merged = { ...prev, ...incoming };
  for (const field of STICKY_PLAYER_FIELDS) {
    if (prev[field] !== undefined) {
      (merged[field] as Player[typeof field]) = prev[field];
    }
  }
  return preserveIdentities(prev, merged);
};

function mergeReceivedGameState(
  state: Draft<GameState>,
  prevGame: GameState,
  payload: GameState
): void {
  state.isUpdateInProgress = false;
  state.isPlayerInputInProgress = false;
  state.isFullRematch = payload.isFullRematch ?? false;
  const incomingTurnPhase = payload.turnPhase?.turnPhase;
  if (incomingTurnPhase === 'OVER') {
    state.hasGameEnded = true;
  } else if (incomingTurnPhase !== undefined && incomingTurnPhase !== 'YESNO') {
    state.hasGameEnded = false;
  }

  state.playerOne = mergePlayer(prevGame.playerOne, payload.playerOne);
  state.playerTwo = mergePlayer(prevGame.playerTwo, payload.playerTwo);

  state.activeChainLink = preserveIdentities(
    prevGame.activeChainLink,
    payload.activeChainLink
  );
  state.activeLayers = preserveIdentities(
    prevGame.activeLayers,
    payload.activeLayers
  );
  state.oldCombatChain = preserveIdentities(
    prevGame.oldCombatChain,
    payload.oldCombatChain
  );

  {
    const prevChatLog = state.chatLog ?? [];
    let prevLen = 0;
    for (let i = 0; i < prevChatLog.length; i++) {
      if (prevChatLog[i].length > 0) prevLen++;
    }
    const incoming = payload.chatLog ?? [];
    if (!state.showChatModal && prevLen > 0) {
      let nonEmptySeen = 0;
      let newPlayerChats = 0;
      for (let i = 0; i < incoming.length; i++) {
        const message = incoming[i];
        if (message.length === 0) continue;
        nonEmptySeen++;
        if (nonEmptySeen > prevLen && CHAT_RE.test(message)) newPlayerChats++;
      }
      if (newPlayerChats > 0) {
        state.unreadChatCount = (state.unreadChatCount ?? 0) + newPlayerChats;
      }
    }
  }

  state.chatLog = preserveIdentities(prevGame.chatLog, payload.chatLog);
  state.opponentIsTyping = payload.opponentIsTyping ?? false;
  state.opponentPresence = payload.opponentPresence ?? null;
  state.amIActivePlayer = payload.amIActivePlayer;
  state.turnPlayer = payload.turnPlayer;
  state.otherPlayer = payload.otherPlayer;
  state.turnPhase = preserveIdentities(prevGame.turnPhase, payload.turnPhase);
  state.playerInputPopUp = preserveIdentities(
    prevGame.playerInputPopUp,
    payload.playerInputPopUp
  );

  const newLastPlayed = preserveIdentities(
    prevGame.gameDynamicInfo.lastPlayed,
    payload.gameDynamicInfo.lastPlayed
  );
  state.gameDynamicInfo.lastPlayed = newLastPlayed;
  if (
    newLastPlayed &&
    newLastPlayed.cardNumber !== 'CardBack' &&
    !newLastPlayed.cardNumber.startsWith('CB')
  ) {
    const prev = state.gameDynamicInfo.recentlyPlayed ?? [];
    if (prev[0]?.cardNumber !== newLastPlayed.cardNumber) {
      state.gameDynamicInfo.recentlyPlayed = [newLastPlayed, ...prev].slice(
        0,
        10
      );
    }
  }
  state.gameDynamicInfo.lastUpdate = payload.gameDynamicInfo.lastUpdate;
  state.gameDynamicInfo.turnNo = payload.gameDynamicInfo.turnNo;
  state.gameDynamicInfo.clock = payload.gameDynamicInfo.clock;
  state.gameDynamicInfo.spectatorCount =
    payload.gameDynamicInfo.spectatorCount ?? 0;
  state.gameDynamicInfo.spectatorNames = preserveIdentities(
    prevGame.gameDynamicInfo.spectatorNames,
    payload.gameDynamicInfo.spectatorNames ?? []
  );
  state.gameDynamicInfo.playerInventory = preserveIdentities(
    prevGame.gameDynamicInfo.playerInventory,
    payload.gameDynamicInfo.playerInventory
  );

  state.hasPriority = payload.hasPriority;
  state.priorityPlayer = payload.priorityPlayer;
  state.chatEnabled = payload.chatEnabled;
  state.playerPrompt = preserveIdentities(
    prevGame.playerPrompt,
    payload.playerPrompt
  );
  state.canPassPhase = payload.canPassPhase;
  // events deliberately NOT identity-preserved: identical consecutive
  // event arrays are distinct occurrences (e.g. the same animation twice)
  state.events = payload.events;
  state.landmark = preserveIdentities(prevGame.landmark, payload.landmark);

  for (const field of FALLBACK_GAME_INFO_FIELDS) {
    const incoming = payload.gameInfo[field];
    if (incoming !== undefined && incoming !== null) {
      (state.gameInfo[field] as GameStaticInfo[typeof field]) = incoming;
    }
  }
  state.gameInfo.altArts = preserveIdentities(
    prevGame.gameInfo.altArts,
    payload.gameInfo.altArts ?? prevGame.gameInfo.altArts
  );
  state.gameInfo.opponentAltArts = preserveIdentities(
    prevGame.gameInfo.opponentAltArts,
    payload.gameInfo.opponentAltArts ?? prevGame.gameInfo.opponentAltArts
  );

  state.aiHasInfiniteHP = payload.aiHasInfiniteHP ?? false;
  state.practiceDummyWeaponPower = payload.practiceDummyWeaponPower ?? 4;
  state.opponentInactive = payload.opponentInactive ?? false;
  state.inactivityDeadline =
    payload.inactivityDeadline ?? state.inactivityDeadline;
  state.serverTimeOffset = payload.serverTimeOffset ?? state.serverTimeOffset;
  state.preventPassPrompt = payload.preventPassPrompt;
}

type PopupStateKey = 'damagePopups' | 'healingPopups' | 'actionPointPopups';
type FloatingPopup = { id: string; amount: number };

//Damage, healing and action point popups
const createPopupReducers = (key: PopupStateKey) => ({
  add: {
    reducer: (
      state: Draft<GameState>,
      action: PayloadAction<{ isPlayer: boolean; amount: number; id: string }>
    ) => {
      const popups = (state[key] ??= { playerOne: [], playerTwo: [] });
      const side = action.payload.isPlayer ? 'playerOne' : 'playerTwo';
      popups[side].push({
        id: action.payload.id,
        amount: action.payload.amount
      });
    },
    prepare: (payload: { isPlayer: boolean; amount: number }) => ({
      payload: { ...payload, id: `${Date.now()}-${Math.random()}` }
    })
  },
  remove: (
    state: Draft<GameState>,
    action: PayloadAction<{ isPlayer: boolean; id: string }>
  ) => {
    const popups = state[key];
    if (!popups) return;
    const side = action.payload.isPlayer ? 'playerOne' : 'playerTwo';
    popups[side] = popups[side].filter(
      (popup: FloatingPopup) => popup.id !== action.payload.id
    );
  }
});

const damagePopupReducers = createPopupReducers('damagePopups');
const healingPopupReducers = createPopupReducers('healingPopups');
const actionPointPopupReducers = createPopupReducers('actionPointPopups');

type RevealKind =
  | 'clashReveal'
  | 'heroTransform'
  | 'arsenalFlip'
  | 'arsenalDestroy';

type RevealPayload = { playerId: number | null; cardNumber: string };

const createRevealReducer =
  (kind: RevealKind) =>
  (state: Draft<GameState>, action: PayloadAction<RevealPayload>) => {
    const p1Card = `${kind}P1Card` as const;
    const p2Card = `${kind}P2Card` as const;

    if (action.payload.playerId === null) {
      state[p1Card] = '';
      state[p2Card] = '';
      return;
    }

    state[action.payload.playerId === 1 ? p1Card : p2Card] =
      action.payload.cardNumber;
    state[`${kind}Trigger` as const] += 1;
  };

export const gameSlice = createSlice({
  name: 'game',
  initialState: InitialGameState,
  // The `reducers` field lets us define reducers and generate associated actions
  reducers: {
    setPopUp: (
      state,
      action: PayloadAction<{
        cardNumber: string;
        xCoord?: number;
        yCoord?: number;
        isOpponent?: boolean;
      }>
    ) => {
      state.popup = {
        popupOn: true,
        xCoord: action.payload.xCoord,
        yCoord: action.payload.yCoord,
        popupCard: { cardNumber: action.payload.cardNumber },
        isOpponent: action.payload.isOpponent
      };
    },
    clearPopUp: (state) => {
      state.popup = { popupOn: false, popupCard: undefined };
    },
    setPlayCardMessage: (state) => {
      state.playCardMessage = {
        popUpOn: true,
        message: 'Release to play this card'
      };
    },
    clearPlayCardMessage: (state) => {
      state.playCardMessage = { popUpOn: false };
    },
    setCardListFocus: (
      state,
      action: PayloadAction<{
        cardList?: Card[];
        name?: string;
      }>
    ) => {
      state.cardListFocus = {
        active: true,
        cardList: action.payload.cardList,
        originalCardList: action.payload.cardList,
        name: action.payload.name,
        apiCall: false,
        isSorted: false
      };
    },
    setCardListLoadFocus: (
      state,
      action: PayloadAction<{
        name?: string;
        query?: string;
      }>
    ) => {
      state.cardListFocus = {
        active: true,
        name: action.payload.name,
        apiQuery: action.payload.query,
        apiCall: true,
        isSorted: false
      };
    },
    clearCardListFocus: (state) => {
      state.cardListFocus = undefined;
    },
    toggleCardListSort: (state) => {
      if (state.cardListFocus && state.cardListFocus.cardList) {
        // If originalCardList doesn't exist, set it now (for API-based popups)
        if (!state.cardListFocus.originalCardList) {
          state.cardListFocus.originalCardList = state.cardListFocus.cardList;
        }

        const isSorted = state.cardListFocus.isSorted;
        if (isSorted) {
          // Revert to original order
          state.cardListFocus.cardList = state.cardListFocus.originalCardList;
          state.cardListFocus.isSorted = false;
        } else {
          // Sort the cards
          const isCardBack = (cardNumber: string) =>
            cardNumber.toLowerCase() === 'cardback';
          const sortedCardList = [...state.cardListFocus.cardList].sort(
            (a, b) => {
              const aBack = isCardBack(a.cardNumber);
              const bBack = isCardBack(b.cardNumber);
              if (aBack && bBack) return 0;
              if (aBack) return 1;
              if (bBack) return -1;
              return b.cardNumber.localeCompare(a.cardNumber);
            }
          );
          state.cardListFocus.cardList = sortedCardList;
          state.cardListFocus.isSorted = true;
        }
      }
    },
    addDamagePopup: damagePopupReducers.add,
    removeDamagePopup: damagePopupReducers.remove,
    addHealingPopup: healingPopupReducers.add,
    removeHealingPopup: healingPopupReducers.remove,
    addActionPointPopup: actionPointPopupReducers.add,
    removeActionPointPopup: actionPointPopupReducers.remove,
    openOptionsMenu: (state) => {
      state.optionsMenu = { active: true };
    },
    closeOptionsMenu: (state) => {
      state.optionsMenu = { active: false };
    },
    openInventory: (state) => {
      state.inventoryOpen = true;
    },
    closeInventory: (state) => {
      state.inventoryOpen = false;
    },
    // sets game information if any
    setGameStart: (
      state,
      action: PayloadAction<{
        playerID: number;
        gameID: number;
        authKey: string;
        username?: string;
        bazaarDeckId?: string;
      }>
    ) => {
      state.isFullRematch = false;
      state.hasGameEnded = false;
      const previousGameID = state.gameInfo.gameID;
      const newGameID =
        typeof action.payload.gameID === 'string'
          ? parseInt(action.payload.gameID)
          : action.payload.gameID;

      // Check if this is a NEW game or a RECONNECTION to the same game
      const isNewGame = previousGameID !== newGameID;

      // Always update gameID
      state.gameInfo.gameID = newGameID;

      // Handle playerID
      if (isNewGame) {
        // NEW GAME: Always use provided playerID from action, never use storage
        state.gameInfo.playerID = action.payload.playerID;
      } else {
        // RECONNECTION to same game: Keep existing playerID if valid, else try storage, finally use provided
        if (state.gameInfo.playerID && state.gameInfo.playerID !== 0) {
          // Keep existing playerID
        } else {
          const storedPlayerID = loadGamePlayerID(newGameID);
          state.gameInfo.playerID =
            storedPlayerID > 0 && storedPlayerID !== 3
              ? storedPlayerID
              : action.payload.playerID;
        }
      }

      // Handle authKey
      if (isNewGame) {
        // NEW GAME: Always use provided authKey if available, never use old storage
        // Clear any stale authKey from previous game
        if (previousGameID > 0) {
          deleteGameAuthKey(previousGameID);
        }

        if (state.gameInfo.playerID === 3) {
          state.gameInfo.authKey = 'spectator';
        } else if (action.payload.authKey !== '') {
          // Save new authKey to storage with username
          saveGameAuthKey(
            newGameID,
            action.payload.authKey,
            state.gameInfo.playerID,
            action.payload.username
          );
          state.gameInfo.authKey = action.payload.authKey;
        } else {
          // No authKey provided for new game (shouldn't happen, but handle gracefully)
          state.gameInfo.authKey = '';
        }
      } else {
        // RECONNECTION to same game: Prefer provided authKey, fall back to stored/existing
        if (action.payload.authKey !== '') {
          // Update with fresh authKey from server with username
          saveGameAuthKey(
            newGameID,
            action.payload.authKey,
            state.gameInfo.playerID,
            action.payload.username
          );
          state.gameInfo.authKey = action.payload.authKey;
        } else if (!state.gameInfo.authKey || state.gameInfo.authKey === '') {
          // Try to load from storage if we don't have one
          if (state.gameInfo.playerID === 3) {
            state.gameInfo.authKey = 'spectator';
          } else {
            const storedAuthKey = loadGameAuthKey(newGameID);
            state.gameInfo.authKey = storedAuthKey || '';
          }
        }
        // else: keep existing authKey
      }

      state.gameDynamicInfo.lastUpdate = 0;
      state.playerOne = {};
      state.playerTwo = {};
      state.activeLayers = undefined;
      state.activeChainLink = undefined;

      if (isNewGame) {
        state.gameLobby = undefined;
        state.isUpdateInProgress = false;
        state.gameInfo.bazaarDeckId = action.payload.bazaarDeckId ?? undefined;
        // Clear recently played history from previous game
        state.gameDynamicInfo.recentlyPlayed = [];
      }

      return state;
    },
    // for main menu, zero out all active game info.
    clearGameInfo: (state) => {
      // Only delete auth key if we have a valid game ID
      if (state.gameInfo.gameID > 0) {
        deleteGameAuthKey(state.gameInfo.gameID);
      }
      state.gameInfo.gameID = 0;
      state.gameInfo.playerID = 0;
      state.gameInfo.authKey = '';
      state.gameDynamicInfo.lastUpdate = 0;
      return state;
    },
    setSpectatorCameraView: (state, action: PayloadAction<number>) => {
      state.spectatorCameraView = action.payload;
    },
    removeCardFromHand: (state, action: PayloadAction<{ card: Card }>) => {
      state.playerOne.Hand = state.playerOne?.Hand?.filter(
        (cardObj) =>
          cardObj.actionDataOverride != action.payload.card.actionDataOverride
      );
    },
    showChainLinkSummary: (
      state,
      action: PayloadAction<{
        chainLink?: number;
        view?: 'dialog' | 'preview' | 'all';
      }>
    ) => {
      state.chainLinkSummary = {
        show: true,
        index: action?.payload.chainLink ?? -1,
        view: action?.payload.view ?? 'dialog'
      };
    },
    hideChainLinkSummary: (state) => {
      state.chainLinkSummary = {};
    },
    setIsUpdateInProgressFalse: (state) => {
      state.isUpdateInProgress = false;
    },
    hideActiveLayer: (state) => {
      state.activeLayers = { ...state.activeLayers, active: false };
    },
    showActiveLayer: (state) => {
      state.activeLayers = { ...state.activeLayers, active: true };
    },
    clearGetLobbyRefresh: (state) => {
      state.gameLobby = undefined;
      state.gameDynamicInfo.lastUpdate = 0;
    },
    toggleShowModals: (state) => {
      state.showModals = !state.showModals;
    },
    toggleChatModal: (state) => {
      state.showChatModal = !state.showChatModal;
      if (state.showChatModal) {
        state.unreadChatCount = 0;
      }
    },
    enableModals: (state) => {
      state.showModals = true;
    },
    setIsRoguelike: (state, action: PayloadAction<boolean>) => {
      state.gameInfo.isRoguelike = action.payload;
    },
    setHeroInfo: (
      state,
      action: PayloadAction<{
        heroName?: string;
        yourHeroCardNumber?: string;
        opponentHeroName?: string;
        opponentHeroCardNumber?: string;
      }>
    ) => {
      if (action.payload.heroName !== undefined) {
        state.gameInfo.heroName = action.payload.heroName;
      }
      if (action.payload.yourHeroCardNumber !== undefined) {
        state.gameInfo.yourHeroCardNumber = action.payload.yourHeroCardNumber;
      }
      if (action.payload.opponentHeroName !== undefined) {
        state.gameInfo.opponentHeroName = action.payload.opponentHeroName;
      }
      if (action.payload.opponentHeroCardNumber !== undefined) {
        state.gameInfo.opponentHeroCardNumber =
          action.payload.opponentHeroCardNumber;
      }
    },
    markHeroIntroAsShown: (state) => {
      state.gameInfo.hasShownHeroIntro = true;
    },
    setLobbyAltArts: (state, action: PayloadAction<AltArt[]>) => {
      state.gameInfo.altArts = action.payload;
    },
    setDeckCosmetics: (
      state,
      action: PayloadAction<{
        cardBackId: string;
        playmatId: string;
        cardBack: string;
        playmat: string;
      }>
    ) => {
      state.gameInfo.deckCardBackId = action.payload.cardBackId;
      state.gameInfo.deckPlaymatId = action.payload.playmatId;
      state.playerOne.Playmat = action.payload.playmat;
      if (state.playerOne.CardBack) {
        state.playerOne.CardBack.cardNumber = action.payload.cardBack;
      } else {
        state.playerOne.CardBack = { cardNumber: action.payload.cardBack };
      }
    },
    disableModals: (state) => {
      state.showModals = false;
    },
    setShuffling: (
      state,
      action: PayloadAction<{ playerId: number | null; isShuffling: boolean }>
    ) => {
      state.shufflingPlayerId = action.payload.playerId;
      state.isShuffling = action.payload.isShuffling;
    },
    setAddBotDeck: (
      state,
      action: PayloadAction<{ playerId: number | null; cardNumber: string }>
    ) => {
      state.addBotDeckPlayerId = action.payload.playerId;
      state.addBotDeckCard = action.payload.cardNumber;
    },
    setClashReveal: createRevealReducer('clashReveal'),
    setHeroTransform: createRevealReducer('heroTransform'),
    setArsenalFlip: createRevealReducer('arsenalFlip'),
    setArsenalDestroy: createRevealReducer('arsenalDestroy'),
    setReplayStart: (
      state,
      action: PayloadAction<{
        playerID: number;
        gameID: number;
        authKey: string;
        username?: string;
        replayNumber?: number;
      }>
    ) => {
      state.isFullRematch = false;
      state.hasGameEnded = false;
      state.gameInfo.gameID = action.payload.gameID;
      if (action.payload.replayNumber !== undefined) {
        state.gameInfo.replayNumber = action.payload.replayNumber;
      }
      state.gameInfo.playerID = state.gameInfo.playerID
        ? state.gameInfo.playerID
        : action.payload.playerID;
      //If We don't currently have an Auth Key
      if (!state.gameInfo.authKey) {
        //And the payload is giving us an auth key
        if (state.gameInfo.playerID == 3) state.gameInfo.authKey = 'spectator';
        else if (action.payload.authKey !== '') {
          saveGameAuthKey(
            action.payload.gameID,
            action.payload.authKey,
            action.payload.playerID,
            action.payload.username
          );
          state.gameInfo.authKey = action.payload.authKey;
        }
        //Else try to set from local storage
        else {
          state.gameInfo.authKey = loadGameAuthKey(state.gameInfo.gameID);
        }
      }
      state.gameDynamicInfo.lastUpdate = 0;
      state.playerOne = {};
      state.playerTwo = {};
      state.activeLayers = undefined;
      state.activeChainLink = undefined;

      return state;
    },
    setOpponentTyping: (state, action: PayloadAction<boolean>) => {
      state.opponentIsTyping = action.payload;
    },
    setOpponentPresence: (
      state,
      action: PayloadAction<GameState['opponentPresence']>
    ) => {
      state.opponentPresence = action.payload ?? null;
    },
    // Receive game state directly from SSE (no HTTP round-trip needed)
    receiveGameState: (state, action: PayloadAction<GameState>) => {
      if (action.payload === undefined) {
        return state;
      }
      const prevGame = (original(state) ?? current(state)) as GameState;
      mergeReceivedGameState(state, prevGame, action.payload);
      return state;
    }
  },
  // The `extraReducers` field lets the slice handle actions defined elsewhere,
  // including actions generated by createAsyncThunk or in other slices.
  extraReducers: (builder) => {
    // playCard
    builder.addCase(playCard.pending, (state, action) => {
      // player input in progress
      state.isPlayerInputInProgress = true;
      state.playerInputRequestId = action.meta.requestId;
      return state;
    });
    builder.addCase(playCard.fulfilled, (state) => {
      // The next SSE game-state update clears isPlayerInputInProgress.
      state.isPlayerInputInProgress = false;
      return state;
    });
    builder.addCase(playCard.rejected, (state) => {
      state.isPlayerInputInProgress = false;
      return state;
    });

    // submitButton
    builder.addCase(submitButton.pending, (state, action) => {
      // player input in progress
      state.isPlayerInputInProgress = true;
      state.playerInputRequestId = action.meta.requestId;
      return state;
    });
    builder.addCase(submitButton.fulfilled, (state) => {
      state.isPlayerInputInProgress = false;
      return state;
    });
    builder.addCase(submitButton.rejected, (state) => {
      state.isPlayerInputInProgress = false;
      return state;
    });

    builder.addCase(submitMultiButton.pending, (state, action) => {
      // player input in progress
      state.isPlayerInputInProgress = true;
      state.playerInputRequestId = action.meta.requestId;
      return state;
    });
    builder.addCase(submitMultiButton.fulfilled, (state) => {
      state.isPlayerInputInProgress = false;
      return state;
    });
    builder.addCase(submitMultiButton.rejected, (state) => {
      state.isPlayerInputInProgress = false;
      return state;
    });

    // gameLobby
    builder.addCase(gameLobby.fulfilled, (state, action) => {
      if (action.payload === undefined) {
        return state;
      }
      if (action.meta.arg.game.gameID !== state.gameInfo.gameID) {
        return state;
      }
      state.isUpdateInProgress = false;
      state.isPlayerInputInProgress = false;

      if (action.payload.lastUpdate !== undefined) {
        state.gameDynamicInfo.lastUpdate = action.payload.lastUpdate;
      }

      if (action.payload.theirHero === undefined) {
        if (state.gameLobby === undefined) {
          state.gameLobby = action.payload;
        } else {
          Object.assign(state.gameLobby, action.payload);
        }
      } else {
        state.gameInfo.isPrivateLobby =
          action.payload.isPrivateLobby ?? state.gameInfo.isPrivateLobby;
        state.chatLog = action.payload.gameLog?.split('<br>');
        state.playerTwo.Name = action.payload.theirName;

        // gameInfo
        state.gameLobby = action.payload;

        state.chatEnabled = action.payload.chatEnabled ?? false;
        state.opponentIsTyping = action.payload.opponentIsTyping ?? false;
        state.opponentPresence = null;
      }

      // set isFullRematch to false
      state.isFullRematch = false;
      state.hasGameEnded = false;

      return state;
    });
    builder.addCase(gameLobby.pending, (state) => {
      state.isUpdateInProgress = true;
      return state;
    });
    builder.addCase(gameLobby.rejected, (state) => {
      state.isUpdateInProgress = false;
      return state;
    });
  }
});

// export const {} = gameSlice.actions;

export default gameSlice.reducer;

const { actions } = gameSlice;
export const {
  setPopUp,
  setGameStart,
  clearPopUp,
  setCardListFocus,
  setCardListLoadFocus,
  clearCardListFocus,
  toggleCardListSort,
  removeCardFromHand,
  openOptionsMenu,
  closeOptionsMenu,
  openInventory,
  closeInventory,
  showChainLinkSummary,
  hideChainLinkSummary,
  hideActiveLayer,
  showActiveLayer,
  setIsUpdateInProgressFalse,
  clearGetLobbyRefresh,
  clearGameInfo,
  toggleShowModals,
  toggleChatModal,
  enableModals,
  disableModals,
  setIsRoguelike,
  setHeroInfo,
  markHeroIntroAsShown,
  setLobbyAltArts,
  setDeckCosmetics,
  setShuffling,
  setAddBotDeck,
  setClashReveal,
  setHeroTransform,
  setArsenalFlip,
  setArsenalDestroy,
  setReplayStart,
  setOpponentTyping,
  setOpponentPresence,
  addDamagePopup,
  removeDamagePopup,
  addHealingPopup,
  removeHealingPopup,
  addActionPointPopup,
  removeActionPointPopup,
  setSpectatorCameraView,
  receiveGameState
} = actions;

export const getGameInfo = (state: RootState) => state.game.gameInfo;

const selectPlayerOnePermanents = (state: RootState) =>
  state.game.playerOne.Permanents;
const selectPlayerTwoPermanents = (state: RootState) =>
  state.game.playerTwo.Permanents;

const buildPermanentsAsStack = (
  permanents: Card[] | undefined
): CardStack[] => {
  const cards = permanents || [];
  if (cards.length === 0) return [];

  const result: CardStack[] = [];
  const byCardNumber = new Map<string, number[]>();
  let idIndex = 0;

  for (const currentCard of [...cards].sort((a, b) =>
    a.cardNumber.localeCompare(b.cardNumber)
  )) {
    if (currentCard.cardNumber === 'EVR070') {
      result.push({
        card: currentCard,
        count: 1,
        id: `${currentCard.cardNumber}-${idIndex++}`
      });
      continue;
    }

    const curNormalized = { ...currentCard, actionDataOverride: '' };
    const candidates = byCardNumber.get(currentCard.cardNumber);
    let matched = false;

    if (candidates) {
      for (const idx of candidates) {
        if (
          isEqual(
            { ...result[idx].card, actionDataOverride: '' },
            curNormalized
          )
        ) {
          result[idx].count++;
          matched = true;
          break;
        }
      }
    }

    if (!matched) {
      const idx = result.length;
      if (candidates) {
        candidates.push(idx);
      } else {
        byCardNumber.set(currentCard.cardNumber, [idx]);
      }
      result.push({
        card: currentCard,
        count: 1,
        id: `${currentCard.cardNumber}-${idIndex++}`
      });
    }
  }

  return result;
};

const selectPlayerOnePermanentsAsStack = createSelector(
  [selectPlayerOnePermanents],
  (permanents) => buildPermanentsAsStack(permanents)
);

const selectPlayerTwoPermanentsAsStack = createSelector(
  [selectPlayerTwoPermanents],
  (permanents) => buildPermanentsAsStack(permanents)
);

export const selectPermanentsAsStack = (
  state: RootState,
  isPlayer: boolean
): CardStack[] => {
  return isPlayer
    ? selectPlayerOnePermanentsAsStack(state)
    : selectPlayerTwoPermanentsAsStack(state);
};

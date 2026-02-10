import { createAsyncThunk, createSlice, PayloadAction, createSelector } from '@reduxjs/toolkit';
import ParseGameState from '../../app/ParseGameState';
import InitialGameState from './InitialGameState';
import GameStaticInfo from '../GameStaticInfo';
import { Card } from '../Card';
import { BACKEND_URL, ROGUELIKE_URL, URL_END_POINT } from 'appConstants';
import Button from '../Button';
import { toast } from 'react-hot-toast';
import GameState from '../GameState';
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
import isEqual from 'react-fast-compare';
import { CardStack } from '../../routes/game/components/zones/permanentsZone/PermanentsZone';

/**
 * Sanitizes HTML content by removing all HTML tags.
 * Applies the regex replacement repeatedly until no more replacements occur
 * to prevent bypassing via nested/overlapping tag patterns.
 */
const sanitizeHtmlTags = (input: string): string => {
  let previous;
  let result = input;
  do {
    previous = result;
    result = result.replace(/<[^>]*>/g, '');
  } while (result !== previous);
  return result;
};

export const nextTurn = createAsyncThunk(
  'game/nextTurn',
  async (
    params: {
      game: GameStaticInfo;
      signal: AbortSignal | undefined;
      lastUpdate: number;
    },
    { getState }
  ) => {
    const queryURL = params.game.isRoguelike
      ? `${ROGUELIKE_URL}${URL_END_POINT.GAME_STATE_POLL}`
      : `${BACKEND_URL}${URL_END_POINT.GAME_STATE_POLL}`;
    const queryParams = new URLSearchParams({
      gameName: String(params.game.gameID),
      playerID: String(params.game.playerID),
      authKey: String(params.game.authKey),
      lastUpdate: String(params.lastUpdate)
    });

    let waitingForJSONResponse = true;
    while (waitingForJSONResponse) {
      try {
        const response = await fetch(queryURL + queryParams, {
          method: 'POST',
          headers: {},
          credentials: 'include',
          signal: params.signal,
          body: JSON.stringify(queryParams)
        });
        let data = await response.text();
        if (data.toString().trim() === '0') {
          continue;
        }
        waitingForJSONResponse = false;
        data = data.toString().trim();
        const indexOfBraces = data.indexOf('{');
        if (indexOfBraces === -1) {
          // No JSON object found - backend returned an error message or non-JSON response
          const errorMessage = sanitizeHtmlTags(data);
          toast.error(`Backend Error: ${errorMessage}`);
          
          // Check for fatal errors that should end the game
          if (errorMessage.includes('game no longer exists') || errorMessage.includes('does not exist')) {
            // Return special error marker that will be handled by the rejected handler
            throw new Error(`GAME_NOT_FOUND: ${errorMessage}`);
          }
          
          return console.error(`Backend returned non-JSON response: ${data}`);
        }
        if (indexOfBraces !== 0) {
          const warningMessage = sanitizeHtmlTags(data.substring(0, indexOfBraces));
          toast.error(`Backend Warning: ${warningMessage}`);          
          console.warn(data.substring(0, indexOfBraces));
          data = data.substring(indexOfBraces);
        }
        const parsedData = JSON.parse(data);
        const gs = ParseGameState(parsedData);
        return gs;
      } catch (e) {
        if (params.signal?.aborted) {
          return;
        }
        waitingForJSONResponse = false;
        // Re-throw to trigger rejected handler
        throw e;
      }
    }
  }
);

export const gameLobby = createAsyncThunk(
  'gameLobby/getLobby',
  async (
    params: {
      game: GameStaticInfo;
      signal: AbortSignal | undefined;
      lastUpdate: number;
    },
    { getState }
  ) => {
    const queryURL = `${BACKEND_URL}${URL_END_POINT.GET_LOBBY_REFRESH}`;

    const requestBody = {
      gameName: params.game.gameID,
      playerID: params.game.playerID,
      authKey: params.game.authKey,
      lastUpdate: params.lastUpdate
    } as GetLobbyRefresh;

    let waitingForJSONResponse = true;
    while (waitingForJSONResponse) {
      try {
        const response = await fetch(queryURL, {
          method: 'POST',
          headers: {},
          credentials: 'include',
          signal: params.signal,
          body: JSON.stringify(requestBody)
        });

        let data = await response.text();
        if (data.toString().trim() === '0') {
          continue;
        }
        waitingForJSONResponse = false;
        data = data.toString().trim();
        const indexOfBraces = data.indexOf('{');
        if (indexOfBraces === -1) {
          // No JSON object found - backend returned an error message or non-JSON response
          toast.error(`Backend Error: ${sanitizeHtmlTags(data)}`);
          return console.error(`Backend returned non-JSON response: ${data}`);
        }
        if (indexOfBraces !== 0) {
          data = data.substring(indexOfBraces);
        }
        const parsedData = JSON.parse(data) as GetLobbyRefreshResponse;
        return parsedData;
      } catch (e) {
        if (params.signal?.aborted) {
          return;
        }
        waitingForJSONResponse = false;
        return console.error(e);
      }
    }
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
    const gameInfo = game.gameInfo;

    const queryURL = gameInfo.isRoguelike
      ? `${ROGUELIKE_URL}${URL_END_POINT.PROCESS_INPUT}`
      : `${BACKEND_URL}${URL_END_POINT.PROCESS_INPUT}`;
    const queryParams = new URLSearchParams({
      gameName: String(gameInfo.gameID),
      playerID: String(gameInfo.playerID),
      authKey: String(gameInfo.authKey),
      mode: String(params.cardParams.action),
      cardID: String(playNo)
    });

    try {
      const response = await fetch(queryURL + queryParams, {
        method: 'GET',
        headers: {},
        credentials: 'include'
      });
      const data = await response.text();
      return;
    } catch (e) {
      console.error(e);
    }
  }
);

export const submitButton = createAsyncThunk(
  'game/submitButton',
  async (params: { button: Button }, { getState }) => {
    const { game } = getState() as { game: GameState };
    const gameInfo = game.gameInfo;
    const queryURL = gameInfo.isRoguelike
      ? `${ROGUELIKE_URL}${URL_END_POINT.PROCESS_INPUT}`
      : `${BACKEND_URL}${URL_END_POINT.PROCESS_INPUT}`;
    const queryParams = new URLSearchParams({
      gameName: String(gameInfo.gameID),
      playerID: String(gameInfo.playerID),
      authKey: String(gameInfo.authKey),
      mode: String(params.button.mode),
      buttonInput: String(params.button.buttonInput),
      inputText: String(params.button.inputText),
      cardID: String(params.button.cardID),
      numMode: String(params.button.numMode ?? '')
    });
    try {
      const response = await fetch(queryURL + queryParams, {
        method: 'GET',
        headers: {},
        credentials: 'include'
      });
      const data = await response.text();
      return;
    } catch (e) {
      console.error(e);
    }
  }
);

export const submitMultiButton = createAsyncThunk(
  'game/submitButton',
  async (params: { mode?: number; extraParams: string }, { getState }) => {
    const { game } = getState() as { game: GameState };
    const gameInfo = game.gameInfo;
    const queryURL = gameInfo.isRoguelike
      ? `${ROGUELIKE_URL}${URL_END_POINT.PROCESS_INPUT}`
      : `${BACKEND_URL}${URL_END_POINT.PROCESS_INPUT}`;
    const queryParams = new URLSearchParams({
      gameName: String(gameInfo.gameID),
      playerID: String(gameInfo.playerID),
      authKey: String(gameInfo.authKey),
      mode: String(params.mode)
    });
    const queryParamsString =
      queryURL + queryParams.toString() + params.extraParams;
    try {
      const response = await fetch(queryParamsString, {
        method: 'GET',
        headers: {},
        credentials: 'include'
      });
      const data = await response.text();
      return;
    } catch (e) {
      console.error(e);
    }
  }
);

export const submitInactivityMessage = createAsyncThunk(
  'game/submitInactivityMessage',
  async (params: { playerID: number; inactivePlayer: number }, { getState }) => {
    const { game } = getState() as { game: GameState };
    const gameInfo = game.gameInfo;
    
    const queryURL = 'SubmitInactivityMessage.php';
    const queryParams = new URLSearchParams({
      gameName: String(gameInfo.gameID),
      playerID: String(params.playerID),
      authKey: String(gameInfo.authKey),
      inactivePlayer: String(params.inactivePlayer)
    });

    try {
      await fetch(`${BACKEND_URL}${queryURL}?${queryParams.toString()}`, {
        method: 'GET',
        headers: {},
        credentials: 'include'
      });
    } catch (e) {
      console.error('Error submitting inactivity message:', e);
    }
  }
);

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
          const sortedCardList = [...state.cardListFocus.cardList].sort((a, b) => b.cardNumber.localeCompare(a.cardNumber));
          state.cardListFocus.cardList = sortedCardList;
          state.cardListFocus.isSorted = true;
        }
      }
    },
    addDamagePopup: (
      state,
      action: PayloadAction<{
        isPlayer: boolean;
        amount: number;
      }>
    ) => {
      const id = `${Date.now()}-${Math.random()}`;
      const popup = { id, amount: action.payload.amount };
      if (action.payload.isPlayer) {
        if (!state.damagePopups) {
          state.damagePopups = { playerOne: [], playerTwo: [] };
        }
        state.damagePopups.playerOne.push(popup);
      } else {
        if (!state.damagePopups) {
          state.damagePopups = { playerOne: [], playerTwo: [] };
        }
        state.damagePopups.playerTwo.push(popup);
      }
    },
    removeDamagePopup: (
      state,
      action: PayloadAction<{
        isPlayer: boolean;
        id: string;
      }>
    ) => {
      if (!state.damagePopups) return;
      if (action.payload.isPlayer) {
        state.damagePopups.playerOne = state.damagePopups.playerOne.filter(
          (p) => p.id !== action.payload.id
        );
      } else {
        state.damagePopups.playerTwo = state.damagePopups.playerTwo.filter(
          (p) => p.id !== action.payload.id
        );
      }
    },
    addHealingPopup: (
      state,
      action: PayloadAction<{
        isPlayer: boolean;
        amount: number;
      }>
    ) => {
      const id = `${Date.now()}-${Math.random()}`;
      const popup = { id, amount: action.payload.amount };
      if (action.payload.isPlayer) {
        if (!state.healingPopups) {
          state.healingPopups = { playerOne: [], playerTwo: [] };
        }
        state.healingPopups.playerOne.push(popup);
      } else {
        if (!state.healingPopups) {
          state.healingPopups = { playerOne: [], playerTwo: [] };
        }
        state.healingPopups.playerTwo.push(popup);
      }
    },
    removeHealingPopup: (
      state,
      action: PayloadAction<{
        isPlayer: boolean;
        id: string;
      }>
    ) => {
      if (!state.healingPopups) return;
      if (action.payload.isPlayer) {
        state.healingPopups.playerOne = state.healingPopups.playerOne.filter(
          (p) => p.id !== action.payload.id
        );
      } else {
        state.healingPopups.playerTwo = state.healingPopups.playerTwo.filter(
          (p) => p.id !== action.payload.id
        );
      }
    },
    addActionPointPopup: (
      state,
      action: PayloadAction<{
        isPlayer: boolean;
        amount: number;
      }>
    ) => {
      const id = `${Date.now()}-${Math.random()}`;
      const popup = { id, amount: action.payload.amount };
      if (action.payload.isPlayer) {
        if (!state.actionPointPopups) {
          state.actionPointPopups = { playerOne: [], playerTwo: [] };
        }
        state.actionPointPopups.playerOne.push(popup);
      } else {
        if (!state.actionPointPopups) {
          state.actionPointPopups = { playerOne: [], playerTwo: [] };
        }
        state.actionPointPopups.playerTwo.push(popup);
      }
    },
    removeActionPointPopup: (
      state,
      action: PayloadAction<{
        isPlayer: boolean;
        id: string;
      }>
    ) => {
      if (!state.actionPointPopups) return;
      if (action.payload.isPlayer) {
        state.actionPointPopups.playerOne = state.actionPointPopups.playerOne.filter(
          (p) => p.id !== action.payload.id
        );
      } else {
        state.actionPointPopups.playerTwo = state.actionPointPopups.playerTwo.filter(
          (p) => p.id !== action.payload.id
        );
      }
    },
    openOptionsMenu: (state) => {
      state.optionsMenu = { active: true };
    },
    closeOptionsMenu: (state) => {
      state.optionsMenu = { active: false };
    },
    // sets game information if any
    setGameStart: (
      state,
      action: PayloadAction<{
        playerID: number;
        gameID: number;
        authKey: string;
        username?: string;
      }>
    ) => {
      state.isFullRematch = false;
      const previousGameID = state.gameInfo.gameID;
      const newGameID = action.payload.gameID;
      
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
          state.gameInfo.playerID = (storedPlayerID > 0 && storedPlayerID !== 3) ? storedPlayerID : action.payload.playerID;
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
          saveGameAuthKey(newGameID, action.payload.authKey, state.gameInfo.playerID, action.payload.username);
          state.gameInfo.authKey = action.payload.authKey;
        } else {
          // No authKey provided for new game (shouldn't happen, but handle gracefully)
          state.gameInfo.authKey = '';
        }
      } else {
        // RECONNECTION to same game: Prefer provided authKey, fall back to stored/existing
        if (action.payload.authKey !== '') {
          // Update with fresh authKey from server with username
          saveGameAuthKey(newGameID, action.payload.authKey, state.gameInfo.playerID, action.payload.username);
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

      // Initialize inactivity timer
      if (isNewGame) {
        // NEW GAME: Start fresh timer
        state.inactivityWarning = {
          lastActionTime: Date.now(),
          firstWarningShown: false,
          secondWarningShown: false
        };
      } else {
        // RECONNECTION to same game: Keep existing timer if present
        if (!state.inactivityWarning) {
          state.inactivityWarning = {
            lastActionTime: Date.now(),
            firstWarningShown: false,
            secondWarningShown: false
          };
        }
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
      action: PayloadAction<{ chainLink?: number }>
    ) => {
      state.chainLinkSummary = {
        show: true,
        index: action?.payload.chainLink ?? -1
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
    },
    toggleShowModals: (state) => {
      state.showModals = !state.showModals;
    },
    toggleChatModal: (state) => {
      state.showChatModal = !state.showChatModal;
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
        state.gameInfo.opponentHeroCardNumber = action.payload.opponentHeroCardNumber;
      }
    },
    markHeroIntroAsShown: (state) => {
      state.gameInfo.hasShownHeroIntro = true;
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
    setReplayStart: (
      state,
      action: PayloadAction<{
        playerID: number;
        gameID: number;
        authKey: string;
        username?: string;
      }>
    ) => {
      state.isFullRematch = false;
      state.gameInfo.gameID = action.payload.gameID;
      state.gameInfo.playerID = !!state.gameInfo.playerID
        ? state.gameInfo.playerID
        : action.payload.playerID;
      //If We don't currently have an Auth Key
      if (!state.gameInfo.authKey) {
        //And the payload is giving us an auth key
        if (state.gameInfo.playerID == 3) state.gameInfo.authKey = 'spectator';
        else if (action.payload.authKey !== '') {
          saveGameAuthKey(action.payload.gameID, action.payload.authKey, action.payload.playerID, action.payload.username);
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
    updateActionTimestamp: (state) => {
      if (!state.inactivityWarning) {
        state.inactivityWarning = {
          lastActionTime: Date.now(),
          firstWarningShown: false,
          secondWarningShown: false
        };
      } else {
        state.inactivityWarning.lastActionTime = Date.now();
        state.inactivityWarning.firstWarningShown = false;
        state.inactivityWarning.secondWarningShown = false;
      }
    },
    setFirstWarningShown: (state, action: PayloadAction<boolean>) => {
      if (!state.inactivityWarning) {
        state.inactivityWarning = {
          lastActionTime: Date.now(),
          firstWarningShown: action.payload,
          secondWarningShown: false
        };
      } else {
        state.inactivityWarning.firstWarningShown = action.payload;
      }
    },
    setSecondWarningShown: (state, action: PayloadAction<boolean>) => {
      if (!state.inactivityWarning) {
        state.inactivityWarning = {
          lastActionTime: Date.now(),
          firstWarningShown: false,
          secondWarningShown: action.payload,
          secondWarningStartTime: action.payload ? Date.now() : undefined
        };
      } else {
        state.inactivityWarning.secondWarningShown = action.payload;
        // Set timestamp when warning is first shown
        if (action.payload) {
          state.inactivityWarning.secondWarningStartTime = Date.now();
        }
      }
      
      // Add inactivity message to chat log when second warning triggers
      if (action.payload && state.chatLog) {
        const playerID = state.gameInfo.playerID;
        const inactivePlayer = state.hasPriority ? playerID : (playerID === 1 ? 2 : 1);
        state.chatLog.push(`⌛Player ${inactivePlayer} is inactive.`);
      }
    },
    resetInactivityTimer: (state) => {
      if (!state.inactivityWarning) {
        state.inactivityWarning = {
          lastActionTime: Date.now(),
          firstWarningShown: false,
          secondWarningShown: false
        };
      } else {
        state.inactivityWarning.lastActionTime = Date.now();
        state.inactivityWarning.firstWarningShown = false;
        state.inactivityWarning.secondWarningShown = false;
      }
      // Save to localStorage (safely)
      if (typeof window !== 'undefined' && window.localStorage) {
        try {
          const gameID = state.gameInfo.gameID;
          if (gameID > 0 && state.inactivityWarning) {
            localStorage.setItem(
              `talishar_inactivity_${gameID}`,
              JSON.stringify(state.inactivityWarning)
            );
          }
        } catch (e) {
          // Silently fail
        }
      }
    },
    stillHereButtonClicked: (state) => {
      // Reset the inactivity timer when button is clicked
      if (!state.inactivityWarning) {
        state.inactivityWarning = {
          lastActionTime: Date.now(),
          firstWarningShown: false,
          secondWarningShown: false
        };
      } else {
        state.inactivityWarning.lastActionTime = Date.now();
        state.inactivityWarning.firstWarningShown = false;
        state.inactivityWarning.secondWarningShown = false;
        state.inactivityWarning.secondWarningStartTime = undefined;
      }
      // Chat message is sent via submitChat API, not added here
    },
    // Receive game state directly from SSE (no HTTP round-trip needed)
    receiveGameState: (state, action: PayloadAction<GameState>) => {
      if (action.payload === undefined) {
        return state;
      }
      state.isUpdateInProgress = false;
      state.isPlayerInputInProgress = false;
      state.isFullRematch = action.payload.isFullRematch ?? false;

      // Preserve player metadata when merging game state updates (patron/metafy status, names)
      const playerOneMetadata = {
        Name: state.playerOne.Name,
        isPatron: state.playerOne.isPatron,
        isContributor: state.playerOne.isContributor,
        isPvtVoidPatron: state.playerOne.isPvtVoidPatron,
        metafyTiers: state.playerOne.metafyTiers
      };
      const playerTwoMetadata = {
        Name: state.playerTwo.Name,
        isPatron: state.playerTwo.isPatron,
        isContributor: state.playerTwo.isContributor,
        isPvtVoidPatron: state.playerTwo.isPvtVoidPatron,
        metafyTiers: state.playerTwo.metafyTiers
      };
      state.playerOne = { ...state.playerOne, ...action.payload.playerOne };
      state.playerTwo = { ...state.playerTwo, ...action.payload.playerTwo };
      // Restore metadata from previous state to prevent flickering
      if (playerOneMetadata.Name !== undefined) state.playerOne.Name = playerOneMetadata.Name;
      if (playerOneMetadata.isPatron !== undefined) state.playerOne.isPatron = playerOneMetadata.isPatron;
      if (playerOneMetadata.isContributor !== undefined) state.playerOne.isContributor = playerOneMetadata.isContributor;
      if (playerOneMetadata.isPvtVoidPatron !== undefined) state.playerOne.isPvtVoidPatron = playerOneMetadata.isPvtVoidPatron;
      if (playerOneMetadata.metafyTiers !== undefined) state.playerOne.metafyTiers = playerOneMetadata.metafyTiers;
      if (playerTwoMetadata.Name !== undefined) state.playerTwo.Name = playerTwoMetadata.Name;
      if (playerTwoMetadata.isPatron !== undefined) state.playerTwo.isPatron = playerTwoMetadata.isPatron;
      if (playerTwoMetadata.isContributor !== undefined) state.playerTwo.isContributor = playerTwoMetadata.isContributor;
      if (playerTwoMetadata.isPvtVoidPatron !== undefined) state.playerTwo.isPvtVoidPatron = playerTwoMetadata.isPvtVoidPatron;
      if (playerTwoMetadata.metafyTiers !== undefined) state.playerTwo.metafyTiers = playerTwoMetadata.metafyTiers;

      state.activeChainLink = action.payload.activeChainLink;
      state.activeLayers = action.payload.activeLayers;
      state.oldCombatChain = action.payload.oldCombatChain;
      state.chatLog = action.payload.chatLog;
      state.opponentIsTyping = action.payload.opponentIsTyping ?? false;
      state.amIActivePlayer = action.payload.amIActivePlayer;
      state.turnPlayer = action.payload.turnPlayer;
      state.otherPlayer = action.payload.otherPlayer;
      state.turnPhase = action.payload.turnPhase;
      state.playerInputPopUp = action.payload.playerInputPopUp;

      // gameInfo
      state.gameDynamicInfo.lastPlayed = action.payload.gameDynamicInfo.lastPlayed;
      state.gameDynamicInfo.lastUpdate = action.payload.gameDynamicInfo.lastUpdate;
      state.gameDynamicInfo.turnNo = action.payload.gameDynamicInfo.turnNo;
      state.gameDynamicInfo.clock = action.payload.gameDynamicInfo.clock;
      state.gameDynamicInfo.spectatorCount = action.payload.gameDynamicInfo.spectatorCount ?? 0;
      state.gameDynamicInfo.spectatorNames = action.payload.gameDynamicInfo.spectatorNames ?? [];
      state.gameDynamicInfo.playerInventory = action.payload.gameDynamicInfo.playerInventory;
      state.hasPriority = action.payload.hasPriority;
      state.priorityPlayer = action.payload.priorityPlayer;
      state.chatEnabled = action.payload.chatEnabled;

      state.playerPrompt = action.payload.playerPrompt;
      state.canPassPhase = action.payload.canPassPhase;
      state.events = action.payload.events;
      state.landmark = action.payload.landmark;

      state.gameInfo.roguelikeGameID =
        action.payload.gameInfo.roguelikeGameID ??
        state.gameInfo.roguelikeGameID;

      state.gameInfo.altArts =
        action.payload.gameInfo.altArts ?? state.gameInfo.altArts;

      state.gameInfo.opponentAltArts =
        action.payload.gameInfo.opponentAltArts ?? state.gameInfo.opponentAltArts;

      state.gameInfo.isPrivate =
        action.payload.gameInfo.isPrivate ?? state.gameInfo.isPrivate;

      state.gameInfo.isReplay =
        action.payload.gameInfo.isReplay ?? state.gameInfo.isReplay;

      state.gameInfo.isOpponentAI =
        action.payload.gameInfo.isOpponentAI ?? state.gameInfo.isOpponentAI;

      state.aiHasInfiniteHP = action.payload.aiHasInfiniteHP ?? false;

      state.opponentActivity = action.payload.opponentActivity ?? state.opponentActivity ?? 0;

      state.preventPassPrompt = action.payload.preventPassPrompt;

      // Reset inactivity timer when we get a new game state
      if (!state.inactivityWarning) {
        state.inactivityWarning = {
          lastActionTime: Date.now(),
          firstWarningShown: false,
          secondWarningShown: false
        };
      } else {
        state.inactivityWarning.lastActionTime = Date.now();
        state.inactivityWarning.firstWarningShown = false;
        state.inactivityWarning.secondWarningShown = false;
      }

      return state;
    },
  },
  // The `extraReducers` field lets the slice handle actions defined elsewhere,
  // including actions generated by createAsyncThunk or in other slices.
  extraReducers: (builder) => {
    // nextTurn
    builder.addCase(nextTurn.fulfilled, (state, action) => {
      if (action.payload === undefined) {
        return state;
      }
      state.isUpdateInProgress = false;
      state.isPlayerInputInProgress = false;
      state.isFullRematch = action.payload.isFullRematch ?? false;

      // Preserve player metadata when merging game state updates (patron/metafy status, names)
      const playerOneMetadata = {
        Name: state.playerOne.Name,
        isPatron: state.playerOne.isPatron,
        isContributor: state.playerOne.isContributor,
        isPvtVoidPatron: state.playerOne.isPvtVoidPatron,
        metafyTiers: state.playerOne.metafyTiers
      };
      const playerTwoMetadata = {
        Name: state.playerTwo.Name,
        isPatron: state.playerTwo.isPatron,
        isContributor: state.playerTwo.isContributor,
        isPvtVoidPatron: state.playerTwo.isPvtVoidPatron,
        metafyTiers: state.playerTwo.metafyTiers
      };
      state.playerOne = { ...state.playerOne, ...action.payload.playerOne };
      state.playerTwo = { ...state.playerTwo, ...action.payload.playerTwo };
      // Restore metadata from previous state to prevent flickering
      if (playerOneMetadata.Name !== undefined) state.playerOne.Name = playerOneMetadata.Name;
      if (playerOneMetadata.isPatron !== undefined) state.playerOne.isPatron = playerOneMetadata.isPatron;
      if (playerOneMetadata.isContributor !== undefined) state.playerOne.isContributor = playerOneMetadata.isContributor;
      if (playerOneMetadata.isPvtVoidPatron !== undefined) state.playerOne.isPvtVoidPatron = playerOneMetadata.isPvtVoidPatron;
      if (playerOneMetadata.metafyTiers !== undefined) state.playerOne.metafyTiers = playerOneMetadata.metafyTiers;
      if (playerTwoMetadata.Name !== undefined) state.playerTwo.Name = playerTwoMetadata.Name;
      if (playerTwoMetadata.isPatron !== undefined) state.playerTwo.isPatron = playerTwoMetadata.isPatron;
      if (playerTwoMetadata.isContributor !== undefined) state.playerTwo.isContributor = playerTwoMetadata.isContributor;
      if (playerTwoMetadata.isPvtVoidPatron !== undefined) state.playerTwo.isPvtVoidPatron = playerTwoMetadata.isPvtVoidPatron;
      if (playerTwoMetadata.metafyTiers !== undefined) state.playerTwo.metafyTiers = playerTwoMetadata.metafyTiers;

      state.activeChainLink = action.payload.activeChainLink;
      state.activeLayers = action.payload.activeLayers;
      state.oldCombatChain = action.payload.oldCombatChain;
      state.chatLog = action.payload.chatLog;
      state.opponentIsTyping = action.payload.opponentIsTyping ?? false;
      state.amIActivePlayer = action.payload.amIActivePlayer;
      state.turnPlayer = action.payload.turnPlayer;
      state.otherPlayer = action.payload.otherPlayer;
      state.turnPhase = action.payload.turnPhase;
      state.playerInputPopUp = action.payload.playerInputPopUp;

      // gameInfo
      state.gameDynamicInfo.lastPlayed = action.payload.gameDynamicInfo.lastPlayed;
      state.gameDynamicInfo.lastUpdate = action.payload.gameDynamicInfo.lastUpdate;
      state.gameDynamicInfo.turnNo = action.payload.gameDynamicInfo.turnNo;
      state.gameDynamicInfo.clock = action.payload.gameDynamicInfo.clock;
      state.gameDynamicInfo.spectatorCount = action.payload.gameDynamicInfo.spectatorCount ?? 0;
      state.gameDynamicInfo.spectatorNames = action.payload.gameDynamicInfo.spectatorNames ?? [];
      state.gameDynamicInfo.playerInventory = action.payload.gameDynamicInfo.playerInventory;
      state.hasPriority = action.payload.hasPriority;
      state.priorityPlayer = action.payload.priorityPlayer;
      state.chatEnabled = action.payload.chatEnabled;

      state.playerPrompt = action.payload.playerPrompt;
      state.canPassPhase = action.payload.canPassPhase;
      state.events = action.payload.events;
      state.landmark = action.payload.landmark;

      state.gameInfo.roguelikeGameID =
        action.payload.gameInfo.roguelikeGameID ??
        state.gameInfo.roguelikeGameID;

      state.gameInfo.altArts =
        action.payload.gameInfo.altArts ?? state.gameInfo.altArts;

      state.gameInfo.opponentAltArts =
        action.payload.gameInfo.opponentAltArts ?? state.gameInfo.opponentAltArts;

      state.gameInfo.isPrivate =
        action.payload.gameInfo.isPrivate ?? state.gameInfo.isPrivate;

      state.gameInfo.isReplay =
        action.payload.gameInfo.isReplay ?? state.gameInfo.isReplay;

      state.gameInfo.isOpponentAI =
        action.payload.gameInfo.isOpponentAI ?? state.gameInfo.isOpponentAI;

      state.aiHasInfiniteHP = action.payload.aiHasInfiniteHP ?? false;

      state.opponentActivity = action.payload.opponentActivity ?? state.opponentActivity ?? 0;

      state.preventPassPrompt = action.payload.preventPassPrompt;

      // Don't reset inactivity warning on every game state update
      // It should only reset when the CURRENT player takes an action
      // (handled by playCard.fulfilled and submitButton.fulfilled)
      
      // Reset inactivity timer when we get a new game state
      // This ensures both players' timers reset whenever ANY action happens
      if (!state.inactivityWarning) {
        state.inactivityWarning = {
          lastActionTime: Date.now(),
          firstWarningShown: false,
          secondWarningShown: false
        };
      } else {
        state.inactivityWarning.lastActionTime = Date.now();
        state.inactivityWarning.firstWarningShown = false;
        state.inactivityWarning.secondWarningShown = false;
      }

      return state;
    });
    builder.addCase(nextTurn.pending, (state, action) => {
      state.isUpdateInProgress = true;
      return state;
    });
    builder.addCase(nextTurn.rejected, (state, action) => {
      state.isUpdateInProgress = false;
      
      // Check if this was a "game not found" error
      const errorMessage = action.error?.message || '';
      if (errorMessage.includes('GAME_NOT_FOUND')) {
        console.error('Game not found on server, marking for navigation');
        window.sessionStorage.setItem('gameNotFound', String(state.gameInfo.gameID));
      }
      
      return state;
    });

    // playCard
    builder.addCase(playCard.pending, (state) => {
      // player input in progress
      state.isPlayerInputInProgress = true;
      return state;
    });
    builder.addCase(playCard.fulfilled, (state) => {
      // Update inactivity timestamp when card is played
      if (!state.inactivityWarning) {
        state.inactivityWarning = {
          lastActionTime: Date.now(),
          firstWarningShown: false,
          secondWarningShown: false
        };
      } else {
        state.inactivityWarning.lastActionTime = Date.now();
        state.inactivityWarning.firstWarningShown = false;
        state.inactivityWarning.secondWarningShown = false;
      }
      // not setting isPlayerInput to false because the
      // 'nextTurn' builder will set to true.
      return state;
    });
    builder.addCase(playCard.rejected, (state) => {
      state.isPlayerInputInProgress = false;
      return state;
    });

    // submitButton
    builder.addCase(submitButton.pending, (state) => {
      // player input in progress
      state.isPlayerInputInProgress = true;
      return state;
    });
    builder.addCase(submitButton.fulfilled, (state) => {
      // Update inactivity timestamp when button is submitted
      if (!state.inactivityWarning) {
        state.inactivityWarning = {
          lastActionTime: Date.now(),
          firstWarningShown: false,
          secondWarningShown: false
        };
      } else {
        state.inactivityWarning.lastActionTime = Date.now();
        state.inactivityWarning.firstWarningShown = false;
        state.inactivityWarning.secondWarningShown = false;
      }
      return state;
    });
    builder.addCase(submitButton.rejected, (state) => {
      state.isPlayerInputInProgress = false;
      return state;
    });

    // nextTurn
    builder.addCase(gameLobby.fulfilled, (state, action) => {
      if (action.payload === undefined) {
        return state;
      }
      state.isUpdateInProgress = false;
      state.isPlayerInputInProgress = false;

      state.gameInfo.isPrivateLobby =
        action.payload.isPrivateLobby ?? state.gameInfo.isPrivateLobby;
      state.gameDynamicInfo.lastUpdate = action.payload.lastUpdate;
      state.chatLog = action.payload.gameLog?.split('<br>');
      state.playerTwo.Name = action.payload.theirName;

      // gameInfo
      state.gameLobby = action.payload;

      // set isFullRematch to false
      state.isFullRematch = false;

      state.chatEnabled = action.payload.chatEnabled ?? false;

      return state;
    });
    builder.addCase(gameLobby.pending, (state, action) => {
      state.isUpdateInProgress = true;
      return state;
    });
    builder.addCase(gameLobby.rejected, (state, action) => {
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
  setShuffling,
  setAddBotDeck,
  setReplayStart,
  updateActionTimestamp,
  setFirstWarningShown,
  setSecondWarningShown,
  resetInactivityTimer,
  stillHereButtonClicked,
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

const selectPlayerOnePermanents = (state: RootState) => state.game.playerOne.Permanents;
const selectPlayerTwoPermanents = (state: RootState) => state.game.playerTwo.Permanents;

// Memoized selector factories for player one and player two
const selectPlayerOnePermanentsAsStack = createSelector(
  [selectPlayerOnePermanents],
  (permanents: Card[] | undefined) => {
    const cards = permanents || [];
    let initialCardStack: CardStack[] = [];
    let idIndex = 0;
    return [...cards]
      .sort((a, b) => a.cardNumber.localeCompare(b.cardNumber))
      .reduce((accumulator, currentCard) => {
        if (currentCard.cardNumber === 'EVR070') {
          accumulator.push({
            card: currentCard,
            count: 1,
            id: `${currentCard.cardNumber}-${idIndex++}`
          });
          return accumulator;
        }
        const cardCopy = { ...currentCard };
        const storedADO = currentCard.actionDataOverride;
        cardCopy.actionDataOverride = '';
        let isInAccumulator = false;
        let index = 0;

        for (const [ix, cardStack] of accumulator.entries()) {
          cardCopy.actionDataOverride = cardStack.card.actionDataOverride;
          if (isEqual(cardStack.card, cardCopy)) {
            isInAccumulator = true;
            index = ix;
            break;
          }
        }
        if (isInAccumulator) {
          accumulator[index].count = accumulator[index].count + 1;
          return accumulator;
        }
        accumulator.push({
          card: currentCard,
          count: 1,
          id: `${currentCard.cardNumber}-${idIndex++}`
        });
        cardCopy.actionDataOverride = storedADO;
        return accumulator;
      }, initialCardStack);
  }
);

const selectPlayerTwoPermanentsAsStack = createSelector(
  [selectPlayerTwoPermanents],
  (permanents: Card[] | undefined) => {
    const cards = permanents || [];
    let initialCardStack: CardStack[] = [];
    let idIndex = 0;
    return [...cards]
      .sort((a, b) => a.cardNumber.localeCompare(b.cardNumber))
      .reduce((accumulator, currentCard) => {
        if (currentCard.cardNumber === 'EVR070') {
          accumulator.push({
            card: currentCard,
            count: 1,
            id: `${currentCard.cardNumber}-${idIndex++}`
          });
          return accumulator;
        }
        const cardCopy = { ...currentCard };
        const storedADO = currentCard.actionDataOverride;
        cardCopy.actionDataOverride = '';
        let isInAccumulator = false;
        let index = 0;

        for (const [ix, cardStack] of accumulator.entries()) {
          cardCopy.actionDataOverride = cardStack.card.actionDataOverride;
          if (isEqual(cardStack.card, cardCopy)) {
            isInAccumulator = true;
            index = ix;
            break;
          }
        }
        if (isInAccumulator) {
          accumulator[index].count = accumulator[index].count + 1;
          return accumulator;
        }
        accumulator.push({
          card: currentCard,
          count: 1,
          id: `${currentCard.cardNumber}-${idIndex++}`
        });
        cardCopy.actionDataOverride = storedADO;
        return accumulator;
      }, initialCardStack);
  }
);

export const selectPermanentsAsStack = (state: RootState, isPlayer: boolean): CardStack[] => {
  return isPlayer ? selectPlayerOnePermanentsAsStack(state) : selectPlayerTwoPermanentsAsStack(state);
};

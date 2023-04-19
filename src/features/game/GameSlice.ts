import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';
import ParseGameState from '../../app/ParseGameState';
import InitialGameState from './InitialGameState';
import GameStaticInfo from '../GameStaticInfo';
import { Card } from '../Card';
import {
  API_URL_BETA,
  API_URL_LIVE,
  API_URL_DEV,
  GAME_LIMIT_LIVE,
  GAME_LIMIT_BETA,
  URL_END_POINT
} from 'appConstants';
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
  saveGameAuthKey
} from 'utils/LocalKeyManagement';

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
    const queryURL =
      params.game.gameID > GAME_LIMIT_LIVE
        ? `${API_URL_LIVE}${URL_END_POINT.GAME_STATE_POLL}`
        : params.game.gameID > GAME_LIMIT_BETA
        ? `${API_URL_BETA}${URL_END_POINT.GAME_STATE_POLL}`
        : `${API_URL_DEV}${URL_END_POINT.GAME_STATE_POLL}`;
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
        if (indexOfBraces !== 0) {
          toast.error(`Backend Warning:\n${data.substring(0, indexOfBraces)}`);
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
        return console.error(e);
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
    const queryURL =
      params.game.gameID > GAME_LIMIT_LIVE
        ? `${API_URL_LIVE}${URL_END_POINT.GET_LOBBY_REFRESH}`
        : params.game.gameID > GAME_LIMIT_BETA
        ? `${API_URL_BETA}${URL_END_POINT.GET_LOBBY_REFRESH}`
        : `${API_URL_DEV}${URL_END_POINT.GET_LOBBY_REFRESH}`;

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
        if (indexOfBraces !== 0) {
          console.log(data.substring(0, indexOfBraces));
          data = data.substring(indexOfBraces);
        }
        const parsedData = JSON.parse(data) as GetLobbyRefreshResponse;
        return parsedData;
      } catch (e) {
        if (params.signal?.aborted) {
          return;
        }
        waitingForJSONResponse = false;
        console.log(e);
        return console.error(e);
      }
    }
  }
);

export const playCard = createAsyncThunk(
  'game/playCard',
  async (params: { cardParams: Card; cardIndex?: number }, { getState }) => {
    const { game } = getState() as { game: GameState };
    // if (game.isPlayerInputInProgress) {
    //   return;
    // }

    const playNo =
      params.cardParams.actionDataOverride != ''
        ? params.cardParams.actionDataOverride
        : params.cardIndex;
    const gameInfo = game.gameInfo;

    const queryURL =
      gameInfo.gameID > GAME_LIMIT_LIVE
        ? `${API_URL_LIVE}${URL_END_POINT.PROCESS_INPUT}`
        : gameInfo.gameID > GAME_LIMIT_BETA
        ? `${API_URL_BETA}${URL_END_POINT.PROCESS_INPUT}`
        : `${API_URL_DEV}${URL_END_POINT.PROCESS_INPUT}`;
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
    const queryURL =
      game.gameInfo.gameID > GAME_LIMIT_LIVE
        ? `${API_URL_LIVE}${URL_END_POINT.PROCESS_INPUT}`
        : game.gameInfo.gameID > GAME_LIMIT_BETA
        ? `${API_URL_BETA}${URL_END_POINT.PROCESS_INPUT}`
        : `${API_URL_DEV}${URL_END_POINT.PROCESS_INPUT}`;
    const queryParams = new URLSearchParams({
      gameName: String(game.gameInfo.gameID),
      playerID: String(game.gameInfo.playerID),
      authKey: String(game.gameInfo.authKey),
      mode: String(params.button.mode),
      buttonInput: String(params.button.buttonInput),
      inputText: String(params.button.inputText)
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
    const queryURL =
      game.gameInfo.gameID > GAME_LIMIT_LIVE
        ? `${API_URL_LIVE}${URL_END_POINT.PROCESS_INPUT}`
        : game.gameInfo.gameID > GAME_LIMIT_BETA
        ? `${API_URL_BETA}${URL_END_POINT.PROCESS_INPUT}`
        : `${API_URL_DEV}${URL_END_POINT.PROCESS_INPUT}`;
    const queryParams = new URLSearchParams({
      gameName: String(game.gameInfo.gameID),
      playerID: String(game.gameInfo.playerID),
      authKey: String(game.gameInfo.authKey),
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
      }>
    ) => {
      state.popup = {
        popupOn: true,
        xCoord: action.payload.xCoord,
        yCoord: action.payload.yCoord,
        popupCard: { cardNumber: action.payload.cardNumber }
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
        name: action.payload.name,
        apiCall: false
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
        apiCall: true
      };
    },
    clearCardListFocus: (state) => {
      state.cardListFocus = undefined;
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
      }>
    ) => {
      state.gameInfo.gameID = action.payload.gameID;
      state.gameInfo.playerID = !!state.gameInfo.playerID
        ? state.gameInfo.playerID
        : action.payload.playerID;
      //If We don't currently have an Auth Key
      if (!state.gameInfo.authKey) {
        //And the payload is giving us an auth key
        if (action.payload.authKey !== '') {
          saveGameAuthKey(action.payload.gameID, action.payload.authKey);
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
    // for main menu, zero out all active game info.
    clearGameInfo: (state) => {
      deleteGameAuthKey(state.gameInfo.gameID);
      state.gameInfo.gameID = 0;
      state.gameInfo.playerID = 0;
      state.gameInfo.authKey = '';
      state.gameDynamicInfo.lastUpdate = 0;
      return state;
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
    enableModals: (state) => {
      state.showModals = true;
    },
    disableModals: (state) => {
      state.showModals = false;
    }
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

      state.playerOne = { ...state.playerOne, ...action.payload.playerOne };
      state.playerTwo = { ...state.playerTwo, ...action.payload.playerTwo };
      state.activeChainLink = action.payload.activeChainLink;
      state.activeLayers = action.payload.activeLayers;
      state.oldCombatChain = action.payload.oldCombatChain;
      state.chatLog = action.payload.chatLog;
      state.amIActivePlayer = action.payload.amIActivePlayer;
      state.turnPhase = action.payload.turnPhase;
      state.playerInputPopUp = action.payload.playerInputPopUp;

      // gameInfo
      state.gameDynamicInfo.lastPlayed =
        action.payload.gameDynamicInfo.lastPlayed;
      state.gameDynamicInfo.lastUpdate =
        action.payload.gameDynamicInfo.lastUpdate;
      state.gameDynamicInfo.turnNo = action.payload.gameDynamicInfo.turnNo;
      state.hasPriority = action.payload.hasPriority;

      state.playerPrompt = action.payload.playerPrompt;
      state.canPassPhase = action.payload.canPassPhase;
      state.events = action.payload.events;
      state.landmark = action.payload.landmark;

      state.gameInfo.roguelikeGameID =
        action.payload.gameInfo.roguelikeGameID ??
        state.gameInfo.roguelikeGameID;

      return state;
    });
    builder.addCase(nextTurn.pending, (state, action) => {
      state.isUpdateInProgress = true;
      return state;
    });
    builder.addCase(nextTurn.rejected, (state, action) => {
      state.isUpdateInProgress = false;
      return state;
    });

    // playCard
    builder.addCase(playCard.pending, (state) => {
      // player input in progress
      state.isPlayerInputInProgress = true;
      return state;
    });
    builder.addCase(playCard.fulfilled, () => {
      // not setting isPlayerInput to false because the
      // 'nextTurn' builder will set to true.
      return;
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
    builder.addCase(submitButton.fulfilled, () => {
      return;
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

      state.gameInfo.isPrivate =
        action.payload.isPrivateLobby ?? state.gameInfo.isPrivate;
      state.gameDynamicInfo.lastUpdate = action.payload.lastUpdate;
      state.chatLog = [action.payload.gameLog ?? ''];

      // gameInfo
      state.gameLobby = action.payload;

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
  enableModals,
  disableModals
} = actions;

export const getGameInfo = (state: RootState) => state.game.gameInfo;

import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';
import ParseGameState from '../../app/ParseGameState';
import { OfflineTestingGameState } from './InitialGameState';
import GameInfo from '../GameInfo';
import Card from '../Card';
import { API_URL } from '../../constants';
import Button from '../Button';

export const nextTurn = createAsyncThunk(
  'game/nextTurn',
  async (params: GameInfo, { getState }) => {
    const queryURL = `${API_URL}GetNextTurn3.php?`;
    const queryParams = new URLSearchParams({
      gameName: String(params.gameID),
      playerID: String(params.playerID),
      authKey: String(params.authKey),
      lastUpdate: String(params.lastUpdate)
    });

    let waitingForJSONResponse = true;
    while (waitingForJSONResponse) {
      try {
        const response = await fetch(queryURL + queryParams, {
          method: 'GET',
          headers: {}
        });
        const data = await response.text();
        if (data.toString().trim() === '0') {
          continue;
        }
        waitingForJSONResponse = false;
        const parsedData = JSON.parse(data);
        console.log(parsedData);
        const gs = ParseGameState(parsedData);
        return gs;
      } catch (e) {
        return console.error(e);
      }
    }
  }
);

export const playCard = createAsyncThunk(
  'game/playCard',
  async (params: { cardParams: Card; cardIndex?: number }, { getState }) => {
    const { game } = getState() as { game: { gameInfo: GameInfo } };

    // TODO: Improve this (perhaps on BE need to have accept POST request)
    const playNo =
      params.cardParams.actionDataOverride != ''
        ? params.cardParams.actionDataOverride
        : params.cardIndex;
    const gameInfo = game.gameInfo;

    // Construct query and params
    const queryURL = `${API_URL}ProcessInput2.php?`;
    const queryParams = new URLSearchParams({
      gameName: String(gameInfo.gameID),
      playerID: String(gameInfo.playerID),
      authKey: String(gameInfo.authKey),
      mode: String(params.cardParams.action),
      cardID: String(playNo)
    });

    console.log(queryParams);
    try {
      const response = await fetch(queryURL + queryParams, {
        method: 'GET',
        headers: {}
      });
      const data = await response.text();
      console.log(data);
      return;
    } catch (e) {
      console.error(e);
    }
  }
);

export const submitButton = createAsyncThunk(
  'game/submitButton',
  async (params: { button: Button }, { getState }) => {
    const { game } = getState() as { game: { gameInfo: GameInfo } };
    const queryURL = `${API_URL}ProcessInput2.php?`;
    const queryParams = new URLSearchParams({
      gameName: String(game.gameInfo.gameID),
      playerID: String(game.gameInfo.playerID),
      authKey: String(game.gameInfo.authKey),
      mode: String(params.button.mode),
      buttonInput: String(params.button.buttonInput)
    });
    try {
      const response = await fetch(queryURL + queryParams, {
        method: 'GET',
        headers: {}
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
  // change the following line if you want to test with filled-in dummy data
  // initialState: InitialGameState,
  initialState: OfflineTestingGameState,
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
        name: action.payload.name
      };
    },
    clearCardListFocus: (state) => {
      state.cardListFocus = undefined;
    },
    setGameStart: (
      state,
      action: PayloadAction<{
        playerID: number;
        gameID: number;
        authKey: string;
      }>
    ) => {
      (state.gameInfo.gameID = action.payload.gameID),
        (state.gameInfo.playerID = action.payload.playerID),
        (state.gameInfo.authKey = action.payload.authKey);
    }
  },
  // The `extraReducers` field lets the slice handle actions defined elsewhere,
  // including actions generated by createAsyncThunk or in other slices.
  extraReducers: (builder) => {
    builder.addCase(nextTurn.fulfilled, (state, action) => {
      if (action.payload === undefined) {
        return state;
      }
      state.playerOne = { ...state.playerOne, ...action.payload.playerOne };
      state.playerTwo = { ...state.playerTwo, ...action.payload.playerTwo };
      state.activeChainLink = action.payload.activeChainLink;
      state.activeLayers = action.payload.activeLayers;
      state.oldCombatChain = action.payload.oldCombatChain;
      state.chatLog = action.payload.chatLog;
      state.isUpdateInProgress = false;
      state.activePlayer = action.payload.activePlayer;
      state.turnPhase = action.payload.turnPhase;
      state.playerInputPopUp = action.payload.playerInputPopUp;

      // gameInfo
      state.gameInfo.lastPlayed = action.payload.gameInfo.lastPlayed;
      state.gameInfo.lastUpdate = action.payload.gameInfo.lastUpdate;
      state.gameInfo.turnNo = action.payload.gameInfo.turnNo;
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
    builder.addCase(playCard.fulfilled, (_state, _action) => {
      return;
    });
    builder.addCase(submitButton.fulfilled, (_state, _action) => {
      return;
    });
  }
});

// export const {} = gameSlice.actions;

// We can also write thunks by hand, which may contain both sync and async logic.
// Here's an example of conditionally dispatching actions based on current state.

export default gameSlice.reducer;

const { actions } = gameSlice;
export const {
  setPopUp,
  setGameStart,
  clearPopUp,
  setCardListFocus,
  clearCardListFocus
} = actions;

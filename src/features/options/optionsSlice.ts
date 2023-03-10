import {
  createAsyncThunk,
  createEntityAdapter,
  createSlice
} from '@reduxjs/toolkit';
import { RootState } from 'app/Store';
import {
  API_URL_BETA,
  API_URL_DEV,
  API_URL_LIVE,
  GAME_LIMIT_BETA,
  GAME_LIMIT_LIVE,
  PLAYER_OPTIONS,
  QUERY_STATUS,
  URL_END_POINT
} from 'appConstants';
import GameInfo from 'features/GameInfo';
import { toast } from 'react-hot-toast';
import { GiConsoleController } from 'react-icons/gi';

interface Setting {
  name: string;
  value: string;
}

const settingsAdapter = createEntityAdapter<Setting>({
  selectId: (setting: Setting) => setting.name,
  sortComparer: (a, b) => a.name.localeCompare(b.name)
});

const settingsInitialState = settingsAdapter.getInitialState({
  status: QUERY_STATUS.IDLE
});

export const fetchAllSettings = createAsyncThunk(
  'options/fetchAllSettings',
  async (params: { game: GameInfo }) => {
    const queryURL =
      params.game.gameID > GAME_LIMIT_LIVE
        ? `${API_URL_LIVE}${URL_END_POINT.GET_POPUP}`
        : params.game.gameID > GAME_LIMIT_BETA
        ? `${API_URL_BETA}${URL_END_POINT.GET_POPUP}`
        : `${API_URL_DEV}${URL_END_POINT.GET_POPUP}`;
    const queryParams = new URLSearchParams({
      gameName: String(params.game.gameID),
      playerID: String(params.game.playerID),
      authKey: String(params.game.authKey),
      popupType: PLAYER_OPTIONS
    });
    try {
      const response = await fetch(queryURL + '?' + queryParams, {
        method: 'GET',
        headers: {},
        credentials: 'include'
      });
      const data = await response.json();
      return data.Settings as Setting[];
    } catch (error) {
      toast.error(JSON.stringify(error));
      console.warn(error);
    }
  }
);

// const fetchOneSetting = createAsyncThunk() => {};

// const updateOption = createAsyncThunk() => {};

// const updateMutlipleOptions = createAsyncThunk() => {};

const optionsSlice = createSlice({
  name: 'options',
  initialState: settingsInitialState,
  reducers: {
    settingAdded: settingsAdapter.addOne,
    settingsReceived(state, action) {
      settingsAdapter.setAll(state, action.payload.Settings);
    }
  },
  extraReducers: (builder) => {
    builder.addCase(fetchAllSettings.fulfilled, (state, action) => {
      settingsAdapter.setAll(state, action.payload as any);
      state.status = QUERY_STATUS.SUCCESS;
    });
    builder.addCase(fetchAllSettings.rejected, (state, action) => {
      toast.error(JSON.stringify(action.error));
      state.status = QUERY_STATUS.FAILED;
    });
    builder.addCase(fetchAllSettings.pending, (state, action) => {
      state.status = QUERY_STATUS.LOADING;
    });
  }
});

export const settingsSelectors = settingsAdapter.getSelectors<RootState>(
  (state) => state.settings
);

export const getSettingsEntity = (state: RootState) => state.settings.entities;
export const getSettingsStatus = (state: RootState) => state.settings.status;

export default optionsSlice.reducer;

const { actions } = optionsSlice;
export const { settingAdded, settingsReceived } = actions;

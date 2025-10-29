import {
  createAsyncThunk,
  createEntityAdapter,
  createSlice,
  PayloadAction
} from '@reduxjs/toolkit';
import { RootState } from 'app/Store';
import {
  BACKEND_URL,
  PLAYER_OPTIONS,
  PROCESS_INPUT,
  QUERY_STATUS,
  URL_END_POINT
} from 'appConstants';
import GameStaticInfo from 'features/GameStaticInfo';
import { ProcessInputAPI } from 'interface/API/ProcessInputAPI';
import { toast } from 'react-hot-toast';
import { loadInitialLanguage } from 'utils';

export interface GameOptions {
  Settings: Setting[];
}

export interface Setting {
  name: string;
  value: string | number | boolean | undefined;
}

const settingsAdapter = createEntityAdapter<Setting>({
  selectId: (setting: Setting) => setting.name,
  sortComparer: (a, b) => a.name.localeCompare(b.name)
});

export const settingsInitialState = settingsAdapter.getInitialState({
  status: QUERY_STATUS.IDLE,
  language: loadInitialLanguage()
});

export const fetchAllSettings = createAsyncThunk(
  'options/fetchAllSettings',
  async (params: { game: GameStaticInfo }) => {
    const queryURL = `${BACKEND_URL}${URL_END_POINT.GET_POPUP}`;
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
      
      // Check if response is ok before trying to parse
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const text = await response.text();
      const data = JSON.parse(text);
      return data.Settings as Setting[];
    } catch (error) {
      console.error('Failed to fetch settings:', error);
      // Return empty array instead of showing error toast for settings
      return [] as Setting[];
    }
  },
  {
    condition: (userId, { getState }) => {
      const { settings } = getState() as any;
      const fetchStatus = settings.status;
      if (fetchStatus === 'loading') {
        // Already in progress, don't need to re-fetch
        return false;
      }
    }
  }
);

// export const fetchOneSetting = createAsyncThunk() => {};

export const updateOptions = createAsyncThunk(
  'options/setSettings',
  async ({ game, settings }: { game: GameStaticInfo; settings: Setting[] }) => {
    const queryURL = ` ${BACKEND_URL}${URL_END_POINT.PROCESS_INPUT_POST}`;

    try {
      const response = await fetch(queryURL, {
        method: 'POST',
        headers: {},
        credentials: 'include',
        body: JSON.stringify({
          playerID: game.playerID,
          gameName: game.gameID,
          authKey: game.authKey,
          mode: PROCESS_INPUT.CHANGE_SETTING,
          submission: { settings: [...settings] }
        } as ProcessInputAPI)
      });
      const data = await response.json();
      return data;
    } catch (err) {
      console.warn(err);
      toast.error(
        `There has been a network error. Please try again. Error:\n${JSON.stringify(
          err
        )}`,
        { position: 'top-center' }
      );
    } finally {
    }
  }
);

const optionsSlice = createSlice({
  name: 'options',
  initialState: settingsInitialState,
  reducers: {
    settingAdded: settingsAdapter.addOne,
    settingUpdated: settingsAdapter.upsertOne,
    settingsReceived(state, action) {
      settingsAdapter.setAll(state, action.payload.Settings);
    },
    setLanguage: (
      state,
      action: PayloadAction<{ languageSelected: string }>
    ) => {
      state.language = action.payload.languageSelected;
    }
  },
  extraReducers: (builder) => {
    builder.addCase(fetchAllSettings.fulfilled, (state, action) => {
      // Handle cases where payload might be undefined or null
      const settings = action.payload ?? [];
      settingsAdapter.setAll(state, settings);
      state.status = QUERY_STATUS.SUCCESS;
    });
    builder.addCase(fetchAllSettings.rejected, (state, action) => {
      toast.error(JSON.stringify(action.error));
      state.status = QUERY_STATUS.FAILED;
    });
    builder.addCase(fetchAllSettings.pending, (state, action) => {
      state.status = QUERY_STATUS.LOADING;
    });
    builder.addCase(updateOptions.fulfilled, (state, action) => {
      state.status = QUERY_STATUS.SUCCESS;
    });
    builder.addCase(updateOptions.rejected, (state, action) => {
      state.status = QUERY_STATUS.FAILED;
    });
    builder.addCase(updateOptions.pending, (state, action) => {
      settingsAdapter.upsertMany(state, action.meta.arg.settings);
      state.status = QUERY_STATUS.LOADING;
    });
  }
});

export const settingsSelectors = settingsAdapter.getSelectors<RootState>(
  (state) => state.settings
);

export const getSettingsEntity = (state: RootState) => state.settings.entities;
export const getSettingsStatus = (state: RootState) => state.settings.status;
export const getSettingsLanguage = (state: RootState) =>
  state.settings.language;

export default optionsSlice.reducer;

const { actions } = optionsSlice;
export const { settingAdded, settingUpdated, settingsReceived, setLanguage } = actions;

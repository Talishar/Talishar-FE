import { createEntityAdapter, createSlice } from '@reduxjs/toolkit';
import { RootState } from 'app/Store';

interface Setting {
  name: string;
  value: string;
}

const settingsAdapter = createEntityAdapter<Setting>({
  selectId: (setting: Setting) => setting.name,
  sortComparer: (a, b) => a.name.localeCompare(b.name)
});

const settingsInitialState = settingsAdapter.getInitialState();

const optionsSlice = createSlice({
  name: 'options',
  initialState: settingsInitialState,
  reducers: {
    settingAdded: settingsAdapter.addOne,
    settingsReceived(state, action) {
      settingsAdapter.setAll(state, action.payload.Settings);
    }
  }
});

export const settingsSelectors = settingsAdapter.getSelectors<RootState>(
  (state) => state.settings
);

export default optionsSlice.reducer;

const { actions } = optionsSlice;
export const { settingAdded, settingsReceived } = actions;

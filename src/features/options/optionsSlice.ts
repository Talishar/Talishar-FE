import { createEntityAdapter, createSlice } from '@reduxjs/toolkit';
import { RootState } from 'app/Store';

type Setting = { name: string; value: string };

const settingsAdapter = createEntityAdapter<Setting>({
  selectId: (setting) => setting.name,
  sortComparer: (a, b) => a.name.localeCompare(b.name)
});

const optionsSlice = createSlice({
  name: 'options',
  initialState: settingsAdapter.getInitialState(),
  reducers: {
    settingAdded: settingsAdapter.addOne,
    settingsReceived(state, action) {
      settingsAdapter.setAll(state, action.payload.Settings);
    }
  }
});

export default optionsSlice.reducer;
const { actions } = optionsSlice;
export const { settingAdded, settingsReceived } = actions;

// const settingSelectors = settingsAdapter.getSelectors<RootState>(
//   (state) => state.settings
// );

import { createSlice } from '@reduxjs/toolkit';
import { RootState } from 'app/Store';
import { defaultAuth } from './constants';

const authSlice = createSlice({
  name: 'auth',
  initialState: defaultAuth,
  reducers: {
    setCredentialsReducer: (state, action) => {
      const {
        user,
        accessToken,
        userName,
        isPatron,
        isMod,
        metafyHash,
        metafyTimestamp
      } = action.payload;
      (state.user = user),
        (state.token = accessToken),
        (state.userName = userName);
      state.isPatron = isPatron;
      state.isMod = isMod || false;
      state.metafyHash = metafyHash ?? null;
      state.metafyTimestamp = metafyTimestamp ?? null;
    },
    logOutReducer: (state) => {
      state.user = null;
      state.userName = null;
      state.token = null;
      state.isPatron = null;
      state.isMod = false;
      state.metafyHash = null;
      state.metafyTimestamp = null;
    }
  }
});

export default authSlice.reducer;
const { actions } = authSlice;
export const { setCredentialsReducer, logOutReducer } = actions;

export const selectCurrentUser = (state: RootState) => state.auth.user;
export const selectCurrentUserName = (state: RootState) => state.auth.userName;
export const selectIsPatron = (state: RootState) => state.auth.isPatron;
export const selectIsMod = (state: RootState) => state.auth.isMod;
export const selectMetafyHash = (state: RootState) => state.auth.metafyHash;
export const selectMetafyTimestamp = (state: RootState) =>
  state.auth.metafyTimestamp;

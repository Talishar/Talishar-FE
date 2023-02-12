import { createSlice } from '@reduxjs/toolkit';
import { AppStore, RootState } from 'app/Store';
import { TypeOf } from 'yup';

const initialState = {
  user: null,
  userName: null,
  token: null
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setCredentialsReducer: (state, action) => {
      const { user, accessToken, userName } = action.payload;
      (state.user = user),
        (state.token = accessToken),
        (state.userName = userName);
    },
    logOutReducer: (state) => {
      state.user = null;
      state.userName = null;
      state.token = null;
    }
  }
});

export default authSlice.reducer;
const { actions } = authSlice;
export const { setCredentialsReducer, logOutReducer } = actions;

export const selectCurrentUser = (state: RootState) => state.auth.user;
export const selectCurrentUserName = (state: RootState) => state.auth.userName;

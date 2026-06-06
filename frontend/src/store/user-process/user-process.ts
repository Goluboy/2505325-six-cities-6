import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

import type { UserProcess } from '../../types/state';
import { fetchUserStatus, loginUser, logoutUser, restoreAuth } from '../action';
import { AuthorizationStatus, StoreSlice } from '../../const';

const initialState: UserProcess = {
  authorizationStatus: AuthorizationStatus.Unknown,
  user: ''
};

export const userProcess = createSlice({
  name: StoreSlice.UserProcess,
  initialState,
  reducers: {
    setAuthorizationStatus: (state, action: PayloadAction<AuthorizationStatus>) => {
      state.authorizationStatus = action.payload;
    },
  },
  extraReducers(builder) {
    builder.addCase(fetchUserStatus.pending, (state) => {
      state.authorizationStatus = AuthorizationStatus.Unknown;
    })
    .addCase(fetchUserStatus.fulfilled, (state, action) => {
      state.user = action.payload;
      state.authorizationStatus = AuthorizationStatus.Auth;
    })
    .addCase(fetchUserStatus.rejected, (state) => {
      state.user = '';
      state.authorizationStatus = AuthorizationStatus.NoAuth;
    })
    .addCase(loginUser.pending, (state) => {
      state.authorizationStatus = AuthorizationStatus.Unknown;
    })
    .addCase(loginUser.fulfilled, (state, action) => {
      state.user = action.payload;
      state.authorizationStatus = AuthorizationStatus.Auth;
    })
    .addCase(loginUser.rejected, (state) => {
      state.user = '';
      state.authorizationStatus = AuthorizationStatus.NoAuth;
    })
    .addCase(logoutUser.pending, (state) => {
      state.authorizationStatus = AuthorizationStatus.Unknown;
    })
    .addCase(logoutUser.fulfilled, (state) => {
      state.user = '';
      state.authorizationStatus = AuthorizationStatus.NoAuth;
    })
    .addCase(restoreAuth.pending, (state) => {
      state.authorizationStatus = AuthorizationStatus.Unknown;
    })
    .addCase(restoreAuth.fulfilled, (state, action) => {
      state.user = action.payload;
      state.authorizationStatus = AuthorizationStatus.Auth;
    })
    .addCase(restoreAuth.rejected, (state) => {
      state.user = '';
      state.authorizationStatus = AuthorizationStatus.NoAuth;
    });
  }
});

export const { setAuthorizationStatus } = userProcess.actions;

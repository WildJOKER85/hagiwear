import { createSlice } from '@reduxjs/toolkit';

const initialState = {
   user: null,      // объект с данными пользователя (например {email: '...'})
   isLoggedIn: false,
};

const authSlice = createSlice({
   name: 'auth',
   initialState,
   reducers: {
      login: (state, action) => {
         state.user = action.payload;   // ожидаем payload — объект с данными пользователя
         state.isLoggedIn = true;
      },
      logout: (state) => {
         state.user = null;
         state.isLoggedIn = false;
      },
   },
});

export const { login, logout } = authSlice.actions;

export const selectUser = (state) => state.auth.user;
export const selectIsLoggedIn = (state) => state.auth.isLoggedIn;

export default authSlice.reducer;

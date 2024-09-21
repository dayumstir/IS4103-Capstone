import { createSlice } from "@reduxjs/toolkit";

const authSlice = createSlice({
  name: "auth",
  initialState: {
    isAuthenticated: false,
    merchantId: "",
  },
  reducers: {
    login: (state, action) => {
      state.isAuthenticated = true;
      state.merchantId = action.payload.merchantId;
    },
    logout: (state) => {
      state.isAuthenticated = false;
      state.merchantId = "";
    },
  },
});

export const { login, logout } = authSlice.actions;
export default authSlice.reducer;

import { createSlice } from "@reduxjs/toolkit";

interface customerAuthState {
  isAuthenticated: boolean;
  token: string | null;
}

const initialState: customerAuthState = {
  isAuthenticated: false,
  token: null,
};

const customerAuthSlice = createSlice({
  name: "customerAuth",
  initialState,
  reducers: {
    login: (state, action) => {
      state.isAuthenticated = true;
      state.token = action.payload.jwtToken;
    },
    logout: (state) => {
      state.isAuthenticated = false;
      state.token = null;
    },
  },
});

export const { login, logout } = customerAuthSlice.actions;
export default customerAuthSlice.reducer;

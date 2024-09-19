import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { ICustomer } from "../../interfaces/customerInterface";

interface customerAuthState {
  isAuthenticated: boolean;
  token: string | null;
}

const initialState: customerAuthState = {
  isAuthenticated: false,
  token: null,
};

const customerAuthSlice = createSlice({
  name: 'customerAuth',
  initialState,
  reducers: {
    login: (state, action: PayloadAction<{ jwtToken: string }>) => {
      state.token = action.payload.jwtToken;
      state.isAuthenticated = true;
    },
    logout: (state) => {
      state.token = null;
      state.isAuthenticated = false;
    },
  },
});

export const { login, logout } = customerAuthSlice.actions;
export default customerAuthSlice.reducer;

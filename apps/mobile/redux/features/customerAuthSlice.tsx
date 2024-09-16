import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { ICustomer } from "../../interfaces/customerInterface";

interface customerAuthState {
  isAuthenticated: boolean;
  token: string | null;
  customer: ICustomer | null;
}

const customerAuthSlice = createSlice({
  name: "customerAuth",
  initialState: {
    isAuthenticated: false,
    token: null,
    customer: null,
  } as customerAuthState,
  reducers: {
    login: (state, action: PayloadAction<string>) => {
      state.isAuthenticated = true;
      state.token = action.payload;
    },
    logout: (state) => {
      state.isAuthenticated = false;
      state.token = null;
      state.customer = null;
    },
  },
});

export const { login, logout } = customerAuthSlice.actions;
export default customerAuthSlice.reducer;

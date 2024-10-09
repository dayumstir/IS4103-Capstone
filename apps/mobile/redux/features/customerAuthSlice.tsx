import { createSlice } from "@reduxjs/toolkit";
import { ICustomer } from "@repo/interfaces";

interface customerAuthState {
  isAuthenticated: boolean;
  token: string | null;
  customer: ICustomer | null;
}

const initialState: customerAuthState = {
  isAuthenticated: false,
  token: null,
  customer: null,
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
      state.customer = null;
    },
    setCustomer: (state, action) => {
      state.customer = action.payload.customer;
    },
  },
});

export const { login, logout, setCustomer } = customerAuthSlice.actions;
export default customerAuthSlice.reducer;

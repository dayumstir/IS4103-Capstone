import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { IMerchant } from "@repo/interfaces";

export interface ProfileState {
  merchant: IMerchant | undefined;
}

const initialState: ProfileState = {
  merchant: undefined, // Initial state is null
};

const profileSlice = createSlice({
  name: "profile",
  initialState: initialState,
  reducers: {
    setMerchant: (state, action: PayloadAction<IMerchant>) => {
      state.merchant = action.payload;
    },
    clearMerchant: (state) => {
      state.merchant = undefined;
    },
  },
});

export const { setMerchant, clearMerchant } = profileSlice.actions;
export default profileSlice.reducer;

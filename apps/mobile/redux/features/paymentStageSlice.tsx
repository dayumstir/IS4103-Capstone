import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";

export const paymentStageSlice = createSlice({
  name: "paymentStage",
  initialState: {
    paymentStage: "Scan QR Code",
  },
  reducers: {
    setPaymentStage: (state, action: PayloadAction<string>) => {
      state.paymentStage = action.payload;
    },
  },
});

// Action creators are generated for each case reducer function
export const { setPaymentStage } = paymentStageSlice.actions;

export default paymentStageSlice.reducer;

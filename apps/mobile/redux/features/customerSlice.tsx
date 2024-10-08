import { createSlice } from "@reduxjs/toolkit";
import { ICustomer } from "@repo/interfaces/customerInterface";

interface CustomerState {
  profile: ICustomer | null; // Store customer profile
}

const initialState: CustomerState = {
  profile: null,
};

const customerSlice = createSlice({
  name: "customer",
  initialState,
  reducers: {
    // Set customer profile in the state
    setProfile: (state, action) => {
      state.profile = action.payload;
    },
  },
});

export const { setProfile } = customerSlice.actions;
export default customerSlice.reducer;

import { configureStore } from "@reduxjs/toolkit";
import { setupListeners } from "@reduxjs/toolkit/query";
import authReducer from "./features/authSlice";
import customerReducer from "./features/customerSlice";
import paymentStageReducer from "./features/paymentStageSlice";
import { authApi } from "./services/auth";
import { transactionApi } from "./services/transaction";

const customSerializableCheck = {
  isSerializable: () => true,
  getEntries: () => [],
};

export const store = configureStore({
  reducer: {
    auth: authReducer,
    customer: customerReducer,
    paymentStage: paymentStageReducer,
    [authApi.reducerPath]: authApi.reducer,
    [transactionApi.reducerPath]: transactionApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({ serializableCheck: customSerializableCheck }).concat(
      authApi.middleware,
      transactionApi.middleware,
    ),
});

setupListeners(store.dispatch);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

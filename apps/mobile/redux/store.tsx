import { configureStore } from "@reduxjs/toolkit";
import { setupListeners } from "@reduxjs/toolkit/query";

import { authMiddleware } from "./authMiddleware";

import customerAuthReducer from "./features/customerAuthSlice";
import customerReducer from "./features/customerSlice";
import paymentStageReducer from "./features/paymentStageSlice";

import { customerAuthApi } from "./services/customerAuthService";
import { customerApi } from "./services/customerService";
import { transactionApi } from "./services/transactionService";
import { instalmentPaymentApi } from "./services/instalmentPaymentService";
import { issueApi } from "./services/issueService";
import { merchantApi } from "./services/merchantService";
import { voucherApi } from "./services/voucherService";

const customSerializableCheck = {
  isSerializable: () => true,
  getEntries: () => [],
};

export const store = configureStore({
  reducer: {
    customerAuth: customerAuthReducer,
    customer: customerReducer,
    paymentStage: paymentStageReducer,
    [customerAuthApi.reducerPath]: customerAuthApi.reducer,
    [customerApi.reducerPath]: customerApi.reducer,
    [transactionApi.reducerPath]: transactionApi.reducer,
    [instalmentPaymentApi.reducerPath]: instalmentPaymentApi.reducer,
    [issueApi.reducerPath]: issueApi.reducer,
    [merchantApi.reducerPath]: merchantApi.reducer,
    [voucherApi.reducerPath]: voucherApi.reducer,
  },

  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({ serializableCheck: customSerializableCheck }).concat(
      authMiddleware,
      customerAuthApi.middleware,
      customerApi.middleware,
      transactionApi.middleware,
      instalmentPaymentApi.middleware,
      issueApi.middleware,
      merchantApi.middleware,
      voucherApi.middleware,
    ),
});

setupListeners(store.dispatch);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

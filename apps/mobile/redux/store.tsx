// app/mobile/redux/store.tsx
import { configureStore } from "@reduxjs/toolkit";
import { setupListeners } from "@reduxjs/toolkit/query";

import customerAuthReducer from "./features/customerAuthSlice";
import customerReducer from "./features/customerSlice";
import paymentStageReducer from "./features/paymentStageSlice";

import { customerApi } from "./services/customerService";
import { customerAuthApi } from "./services/customerAuthService";
import { instalmentPaymentApi } from "./services/instalmentPaymentService";
import { issueApi } from "./services/issueService";
import { merchantApi } from "./services/merchantService";
import { paymentApi } from "./services/paymentService";
import { transactionApi } from "./services/transactionService";
import { voucherApi } from "./services/voucherService";

// Custom Serializable Check Configuration
const customSerializableCheck = {
  isSerializable: () => true,
  getEntries: () => [],
};

export const store = configureStore({
  reducer: {
    customer: customerReducer,
    customerAuth: customerAuthReducer,
    paymentStage: paymentStageReducer,
    [customerApi.reducerPath]: customerApi.reducer,
    [customerAuthApi.reducerPath]: customerAuthApi.reducer,
    [instalmentPaymentApi.reducerPath]: instalmentPaymentApi.reducer,
    [issueApi.reducerPath]: issueApi.reducer,
    [merchantApi.reducerPath]: merchantApi.reducer,
    [paymentApi.reducerPath]: paymentApi.reducer,
    [transactionApi.reducerPath]: transactionApi.reducer,
    [voucherApi.reducerPath]: voucherApi.reducer,
  },

  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({ serializableCheck: customSerializableCheck }).concat(
      customerApi.middleware,
      customerAuthApi.middleware,
      instalmentPaymentApi.middleware,
      issueApi.middleware,
      merchantApi.middleware,
      paymentApi.middleware,
      transactionApi.middleware,
      voucherApi.middleware,
    ),
});

setupListeners(store.dispatch);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

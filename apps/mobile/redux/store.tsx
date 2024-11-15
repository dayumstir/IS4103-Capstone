// app/mobile/redux/store.tsx
import { configureStore } from "@reduxjs/toolkit";
import { setupListeners } from "@reduxjs/toolkit/query";

import customerAuthReducer from "./features/customerAuthSlice";
import customerReducer from "./features/customerSlice";
import paymentStageReducer from "./features/paymentStageSlice";

import { cashbackWalletApi } from "./services/cashbackWalletService";
import { customerApi } from "./services/customerService";
import { customerAuthApi } from "./services/customerAuthService";
import { instalmentPaymentApi } from "./services/instalmentPaymentService";
import { issueApi } from "./services/issueService";
import { merchantApi } from "./services/merchantService";
import { notificationApi } from "./services/notificationService";
import { paymentApi } from "./services/paymentService";
import { transactionApi } from "./services/transactionService";
import { voucherApi } from "./services/voucherService";
import { creditScoreApi } from "./services/creditScoreService";
import { ratingApi } from "./services/ratingService";

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
    [cashbackWalletApi.reducerPath]: cashbackWalletApi.reducer,
    [customerApi.reducerPath]: customerApi.reducer,
    [customerAuthApi.reducerPath]: customerAuthApi.reducer,
    [instalmentPaymentApi.reducerPath]: instalmentPaymentApi.reducer,
    [issueApi.reducerPath]: issueApi.reducer,
    [merchantApi.reducerPath]: merchantApi.reducer,
    [notificationApi.reducerPath]: notificationApi.reducer,
    [paymentApi.reducerPath]: paymentApi.reducer,
    [transactionApi.reducerPath]: transactionApi.reducer,
    [voucherApi.reducerPath]: voucherApi.reducer,
    [creditScoreApi.reducerPath]: creditScoreApi.reducer,
    [ratingApi.reducerPath]: ratingApi.reducer,
  },

  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({ serializableCheck: customSerializableCheck }).concat(
      cashbackWalletApi.middleware,
      customerApi.middleware,
      customerAuthApi.middleware,
      instalmentPaymentApi.middleware,
      issueApi.middleware,
      merchantApi.middleware,
      notificationApi.middleware,
      paymentApi.middleware,
      transactionApi.middleware,
      voucherApi.middleware,
      creditScoreApi.middleware,
      ratingApi.middleware,
    ),
});

setupListeners(store.dispatch);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

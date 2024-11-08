// app/web-admin/src/redux/store.ts
import { configureStore } from "@reduxjs/toolkit";
import { setupListeners } from "@reduxjs/toolkit/query";

// Import all API services
import { adminApi } from "./services/adminService";
import { adminAuthApi } from "./services/adminAuthService";
import { creditTierApi } from "./services/creditTierService";
import { customerApi } from "./services/customerService";
import { instalmentPlanApi } from "./services/instalmentPlanService";
import { issueApi } from "./services/issueService";
import { merchantApi } from "./services/merchantService";
import { merchantPaymentApi } from "./services/merchantPaymentService";
import { merchantSizeApi } from "./services/merchantSizeService";
import { notificationApi } from "./services/notificationService";
import { transactionApi } from "./services/transactionService";
import { voucherApi } from "./services/voucherService";
import { withdrawalFeeRateApi } from "./services/withdrawalFeeRateService";

// Custom serializable check configuration
const customSerializableCheck = {
  isSerializable: () => true,
  getEntries: () => [],
};

// Configure store with reducers and middleware
export const store = configureStore({
  reducer: {
    [adminApi.reducerPath]: adminApi.reducer,
    [adminAuthApi.reducerPath]: adminAuthApi.reducer,
    [creditTierApi.reducerPath]: creditTierApi.reducer,
    [customerApi.reducerPath]: customerApi.reducer,
    [instalmentPlanApi.reducerPath]: instalmentPlanApi.reducer,
    [issueApi.reducerPath]: issueApi.reducer,
    [merchantApi.reducerPath]: merchantApi.reducer,
    [merchantPaymentApi.reducerPath]: merchantPaymentApi.reducer,
    [merchantSizeApi.reducerPath]: merchantSizeApi.reducer,
    [notificationApi.reducerPath]: notificationApi.reducer,
    [transactionApi.reducerPath]: transactionApi.reducer,
    [voucherApi.reducerPath]: voucherApi.reducer,
    [withdrawalFeeRateApi.reducerPath]: withdrawalFeeRateApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({ serializableCheck: customSerializableCheck }).concat(
      adminApi.middleware,
      adminAuthApi.middleware,
      creditTierApi.middleware,
      customerApi.middleware,
      instalmentPlanApi.middleware,
      issueApi.middleware,
      merchantApi.middleware,
      merchantPaymentApi.middleware,
      merchantSizeApi.middleware,
      notificationApi.middleware,
      transactionApi.middleware,
      voucherApi.middleware,
      withdrawalFeeRateApi.middleware
    ),
});

// Setup listeners for refetchOnFocus/refetchOnReconnect
setupListeners(store.dispatch);

// Export types for RootState and AppDispatch
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

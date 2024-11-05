import { configureStore } from "@reduxjs/toolkit";
import { setupListeners } from "@reduxjs/toolkit/query";
import { adminAuthApi } from "./services/adminAuthService";
import { adminApi } from "./services/adminService";
import { creditTierApi } from "./services/creditTierService";
import { instalmentPlanApi } from "./services/instalmentPlanService";
import { customerApi } from "./services/customerService";
import { merchantApi } from "./services/merchantService";
import { voucherApi } from "./services/voucherService";
import { issueApi } from "./services/issueService";
import { transactionApi } from "./services/transactionService";
import { merchantPaymentApi } from "./services/merchantPaymentService";
import { withdrawalFeeRateApi } from "./services/withdrawalFeeRateService";
import { merchantSizeApi } from "./services/merchantSizeService";
import { notificationApi } from "./services/notificationService";

const customSerializableCheck = {
  isSerializable: () => true,
  getEntries: () => [],
};

export const store = configureStore({
  reducer: {
    [adminAuthApi.reducerPath]: adminAuthApi.reducer,
    [adminApi.reducerPath]: adminApi.reducer,
    [creditTierApi.reducerPath]: creditTierApi.reducer,
    [instalmentPlanApi.reducerPath]: instalmentPlanApi.reducer,
    [customerApi.reducerPath]: customerApi.reducer,
    [merchantApi.reducerPath]: merchantApi.reducer,
    [voucherApi.reducerPath]: voucherApi.reducer,
    [issueApi.reducerPath]: issueApi.reducer,
    [transactionApi.reducerPath]: transactionApi.reducer,
    [merchantPaymentApi.reducerPath]: merchantPaymentApi.reducer,
    [withdrawalFeeRateApi.reducerPath]: withdrawalFeeRateApi.reducer,
    [merchantSizeApi.reducerPath]: merchantSizeApi.reducer,
    [notificationApi.reducerPath]: notificationApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({ serializableCheck: customSerializableCheck }).concat(
      adminAuthApi.middleware,
      adminApi.middleware,
      creditTierApi.middleware,
      instalmentPlanApi.middleware,
      customerApi.middleware,
      merchantApi.middleware,
      voucherApi.middleware,
      issueApi.middleware,
      transactionApi.middleware,
      merchantPaymentApi.middleware,
      withdrawalFeeRateApi.middleware,
      merchantSizeApi.middleware,
      notificationApi.middleware,
    ),
});

setupListeners(store.dispatch);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

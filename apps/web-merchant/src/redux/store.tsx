import { configureStore } from "@reduxjs/toolkit";
import { authApi } from "./services/auth";
import { setupListeners } from "@reduxjs/toolkit/query";
import { profileApi } from "./services/profile";
import { issueApi } from "./services/issue";
import { adminApi } from "./services/admin";
import { customerApi } from "./services/customer";
import profileReducer from "./features/profileSlice";
import { transactionApi } from "./services/transaction";
import { merchantPaymentApi } from "./services/merchantPayment";
import { instalmentPaymentApi } from "./services/instalmentPayment";
import { notificationApi } from "./services/notification";

const customSerializableCheck = {
  isSerializable: () => true,
  getEntries: () => [],
};

export const store = configureStore({
  reducer: {
    [authApi.reducerPath]: authApi.reducer,
    [profileApi.reducerPath]: profileApi.reducer,
    [issueApi.reducerPath]: issueApi.reducer,
    [adminApi.reducerPath]: adminApi.reducer,
    [customerApi.reducerPath]: customerApi.reducer,
    [transactionApi.reducerPath]: transactionApi.reducer,
    [merchantPaymentApi.reducerPath]: merchantPaymentApi.reducer,
    [instalmentPaymentApi.reducerPath]: instalmentPaymentApi.reducer,
    [notificationApi.reducerPath]: notificationApi.reducer,
    profile: profileReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({ serializableCheck: customSerializableCheck }).concat(
      authApi.middleware,
      profileApi.middleware,
      issueApi.middleware,
      adminApi.middleware,
      customerApi.middleware,
      transactionApi.middleware,
      merchantPaymentApi.middleware,
      instalmentPaymentApi.middleware,
      notificationApi.middleware,
    ),
});

setupListeners(store.dispatch);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

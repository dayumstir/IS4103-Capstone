import { configureStore } from "@reduxjs/toolkit";
import { setupListeners } from "@reduxjs/toolkit/query";
import { adminAuthApi } from "./services/adminAuthService";
import { adminApi } from "./services/adminService";
import { creditTierApi } from "./services/creditTierService";
import { instalmentPlanApi } from "./services/instalmentPlanService";
import { customerApi } from "./services/customerService";
import { merchantApi } from "./services/merchantService";

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
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({ serializableCheck: customSerializableCheck }).concat(
      adminAuthApi.middleware,
      adminApi.middleware,
      creditTierApi.middleware,
      instalmentPlanApi.middleware,
      customerApi.middleware,
      merchantApi.middleware,
    ),
});

setupListeners(store.dispatch);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

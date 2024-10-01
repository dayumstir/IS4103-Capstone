import { configureStore } from "@reduxjs/toolkit";
import { setupListeners } from "@reduxjs/toolkit/query";

import customerAuthReducer from "./features/customerAuthSlice";
import customerReducer from "./features/customerSlice";
import paymentStageReducer from "./features/paymentStageSlice";

import { customerAuthApi } from "./services/customerAuth";
import { customerApi } from "./services/customer";
import { transactionApi } from "./services/transaction";
import { issueApi } from "./services/issueService";
import { merchantApi } from "./services/merchantService";

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
    [issueApi.reducerPath]: issueApi.reducer,
    [merchantApi.reducerPath]: merchantApi.reducer,
  },

  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({ serializableCheck: customSerializableCheck }).concat(
      customerAuthApi.middleware,
      customerApi.middleware,
      transactionApi.middleware,
      issueApi.middleware,
      merchantApi.middleware,
    ),
});

setupListeners(store.dispatch);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

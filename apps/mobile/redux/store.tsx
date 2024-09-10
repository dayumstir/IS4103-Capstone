import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./features/authSlice";
import customerReducer from "./features/customerSlice";
import { authApi } from "./services/auth";
import { setupListeners } from "@reduxjs/toolkit/query";

const customSerializableCheck = {
  isSerializable: () => true,
  getEntries: () => [],
};

export const store = configureStore({
  reducer: {
    auth: authReducer,
    customer: customerReducer,
    [authApi.reducerPath]: authApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({ serializableCheck: customSerializableCheck }).concat(
      authApi.middleware,
    ),
});

setupListeners(store.dispatch);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

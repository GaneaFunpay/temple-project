import { configureStore } from "@reduxjs/toolkit";
import { authApi } from "../services/authApi";
import authReducer from "./reducers/authReducer";
import { stripeApi } from "../services/stripeApi";

export const store = configureStore({
  reducer: {
    [authApi.reducerPath]: authApi.reducer,
    [stripeApi.reducerPath]: stripeApi.reducer,
    auth: authReducer,
  },
  middleware: (gDM) => gDM().concat(authApi.middleware, stripeApi.middleware),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

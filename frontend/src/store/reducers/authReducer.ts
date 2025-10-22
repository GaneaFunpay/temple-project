import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

type UserInfo = {
  id?: number;
  email: string;
  username?: string;
  role?: "buyer" | "seller" | "admin";
};
type AuthState = {
  access: string | null;
  bootstrapped: boolean;
  user: UserInfo | null;
};

const initialState: AuthState = {
  access: null,
  bootstrapped: false,
  user: null,
};

const slice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setAccess(state, action: PayloadAction<string | null>) {
      state.access = action.payload;
    },
    setUser(state, action: PayloadAction<UserInfo | null>) {
      state.user = action.payload;
    },
    setBootstrapped(state, action: PayloadAction<boolean>) {
      state.bootstrapped = action.payload;
    },
    logout(state) {
      state.access = null;
      state.user = null;
      state.bootstrapped = true;
    },
  },
});

export const { setAccess, setUser, setBootstrapped, logout } = slice.actions;
export default slice.reducer;

// селекторы
export const selectIsAuthenticated = (s: any) => Boolean(s.auth.access);
export const selectBootstrapped = (s: any) => s.auth.bootstrapped;
export const selectUser = (s: any) => s.auth.user;
export const selectRole = (s: any) => s.auth.user?.role;

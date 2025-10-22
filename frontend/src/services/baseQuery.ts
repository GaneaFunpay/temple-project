import { fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import type {
  BaseQueryFn,
  FetchArgs,
  FetchBaseQueryError,
} from "@reduxjs/toolkit/query";
import type { RootState } from "../store/store";
import { logout, setAccess } from "../store/reducers/authReducer";

const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";

const rawBaseQuery = fetchBaseQuery({
  baseUrl: `${API_BASE}/api/`,
  credentials: "include",
  prepareHeaders: (headers, { getState }) => {
    const token = (getState() as RootState).auth.access;
    if (token) headers.set("Authorization", `Bearer ${token}`);
    headers.set("Content-Type", "application/json");
    return headers;
  },
});

export const baseQueryWithReauth: BaseQueryFn<
  string | FetchArgs,
  unknown,
  FetchBaseQueryError
> = async (args, api, extra) => {
  let result = await rawBaseQuery(args, api, extra);

  if (result.error && result.error.status === 401) {
    // пробуем освежить access через cookie
    const refresh = await rawBaseQuery(
      { url: "auth/jwt/refresh-cookie/", method: "POST" },
      api,
      extra
    );
    if (refresh.data && (refresh.data as any).access) {
      api.dispatch(setAccess((refresh.data as any).access));
      result = await rawBaseQuery(args, api, extra); // повторяем исходный запрос
    } else {
      api.dispatch(logout());
    }
  }
  return result;
};

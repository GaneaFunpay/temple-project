import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQueryWithReauth } from "./baseQuery";
import { logout, setAccess, setUser } from "../store/reducers/authReducer";

export const authApi = createApi({
  reducerPath: "authApi",
  baseQuery: baseQueryWithReauth,
  endpoints: (build) => ({
    // 🔹 Регистрация
    register: build.mutation<
      { id: number; email: string },
      { username: string; email: string; password: string }
    >({
      query: (body) => ({
        url: "auth/users/",
        method: "POST",
        body,
      }),
    }),

    // 🔹 Логин
    login: build.mutation<
      { access: string },
      { username: string; password: string }
    >({
      query: (body) => ({
        url: "auth/jwt/create/",
        method: "POST",
        body /* credentials: include не обязателен тут */,
      }),
      async onQueryStarted(arg, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled; // ожидаем только access в ответе
          dispatch(setAccess(data.access));
          // подтянем профиль
          dispatch(authApi.endpoints.me.initiate());
        } catch {
          dispatch(logout());
        }
      },
    }),

    // 🔹 Профиль
    me: build.query<any, void>({
      query: () => ({
        url: "auth/users/me/",
        method: "GET",
      }),
      async onQueryStarted(arg, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          dispatch(setUser(data));
        } catch {
          dispatch(setUser(null));
        }
      },
    }),

    // 🔹 Сброс пароля (отправить письмо)
    sendResetEmail: build.mutation<void, { email: string }>({
      query: (body) => ({
        url: "auth/users/reset_password/",
        method: "POST",
        body,
      }),
    }),

    // 🔹 Подтверждение сброса
    confirmReset: build.mutation<
      void,
      { uid: string; token: string; new_password: string }
    >({
      query: (body) => ({
        url: "auth/users/reset_password_confirm/",
        method: "POST",
        body,
      }),
    }),
  }),
});

export const {
  useRegisterMutation,
  useLoginMutation,
  useMeQuery,
  useSendResetEmailMutation,
  useConfirmResetMutation,
} = authApi;

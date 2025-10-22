import {
  logout,
  setBootstrapped,
  setAccess,
} from "./store/reducers/authReducer";

export async function bootstrapAuth(store: any) {
  try {
    const res = await fetch(
      `${import.meta.env.VITE_API_BASE_URL}/api/auth/jwt/refresh-cookie/`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
      }
    );
    if (res.ok) {
      const { access } = await res.json();
      store.dispatch(setAccess(access));
    } else {
      store.dispatch(logout());
    }
  } catch {
    store.dispatch(logout());
  } finally {
    store.dispatch(setBootstrapped(true));
  }
}

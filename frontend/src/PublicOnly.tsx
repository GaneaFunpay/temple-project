import { Navigate, Outlet } from "react-router-dom";
import { useAppSelector } from "./utils/hooks";
import {
  selectBootstrapped,
  selectIsAuthenticated,
} from "./store/reducers/authReducer";

export default function PublicOnly() {
  const isAuth = useAppSelector(selectIsAuthenticated);
  const bootstrapped = useAppSelector(selectBootstrapped);

  if (!bootstrapped)
    return <div style={{ textAlign: "center", marginTop: 40 }}>Loading…</div>;
  if (isAuth) return <Navigate to="/profile" replace />;

  return <Outlet />;
}

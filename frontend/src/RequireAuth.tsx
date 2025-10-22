import { Navigate, Outlet, useLocation } from "react-router-dom";
import {
  selectBootstrapped,
  selectIsAuthenticated,
} from "./store/reducers/authReducer";
import { useAppSelector } from "./utils/hooks";
import { useMeQuery } from "./services/authApi";

export default function RequireAuth() {
  const bootstrapped = useAppSelector(selectBootstrapped);
  const isAuth = useAppSelector(selectIsAuthenticated);
  const location = useLocation();

  const { isLoading, isFetching } = useMeQuery(undefined, { skip: !isAuth });

  if (!bootstrapped) {
    return <div style={{ textAlign: "center", marginTop: 40 }}>Loading…</div>;
  }

  if (!isAuth) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (isLoading || isFetching) {
    return <div style={{ textAlign: "center", marginTop: 40 }}>Loading…</div>;
  }

  return <Outlet />;
}

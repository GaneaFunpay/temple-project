import { Navigate, Outlet } from "react-router-dom";
import { useAppSelector } from "../utils/hooks";

import { useMeQuery } from "../services/authApi";
import {
  selectBootstrapped,
  selectIsAuthenticated,
  selectUser,
} from "../store/reducers/authReducer";

export default function RequireSeller() {
  const bootstrapped = useAppSelector(selectBootstrapped);
  const isAuth = useAppSelector(selectIsAuthenticated);
  const userFromState = useAppSelector(selectUser);

  const {
    data: me,
    isLoading,
    isFetching,
  } = useMeQuery(undefined, { skip: !isAuth });

  if (!bootstrapped) {
    return <div style={{ textAlign: "center", marginTop: 40 }}>Loading…</div>;
  }
  if (!isAuth) {
    return <Navigate to="/login" replace />;
  }

  // ждём пока подтянется профиль
  const loading = isLoading || isFetching;
  const role = (me?.role ?? userFromState?.role) as string | undefined;

  if (loading && !role) {
    return <div style={{ textAlign: "center", marginTop: 40 }}>Loading…</div>;
  }

  if (role !== "seller") {
    return <Navigate to="/403" replace />;
  }

  return <Outlet />;
}

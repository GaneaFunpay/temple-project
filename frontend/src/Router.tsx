import { Elements } from "@stripe/react-stripe-js";
import { Navigate, Route, Routes } from "react-router-dom";
import RequireSeller from "./components/RequireSeller";
import Checkout from "./pages/Checkout";
import Forbidden from "./pages/Forbidden";
import ForgotPassword from "./pages/ForgotPassword";
import Login from "./pages/Login";
import OnboardSeller from "./pages/OnboardSeller";
import Orders from "./pages/Orders";
import Profile from "./pages/Profile";
import Register from "./pages/Register";
import ResetPassword from "./pages/ResetPassword";
import PublicOnly from "./PublicOnly";
import RequireAuth from "./RequireAuth";
import { selectIsAuthenticated } from "./store/reducers/authReducer";
import { stripePromise } from "./stripe";
import { useAppSelector } from "./utils/hooks";
import Products from "./pages/Products/Products";

const Router = () => {
  const isAuth = useAppSelector(selectIsAuthenticated);

  return (
    <Routes>
      <Route
        path="/"
        element={<Navigate to={isAuth ? "/profile" : "/login"} replace />}
      />
      <Route path="/products" element={<Products />} />

      <Route element={<PublicOnly />}>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot" element={<ForgotPassword />} />
        <Route path="/reset-password/:uid/:token" element={<ResetPassword />} />
      </Route>

      <Route element={<RequireAuth />}>
        <Route path="/profile" element={<Profile />} />
      </Route>

      <Route element={<RequireSeller />}>
        <Route path="/onboard" element={<OnboardSeller />} />
        <Route
          path="/checkout"
          element={
            <Elements stripe={stripePromise}>
              <Checkout />
            </Elements>
          }
        />
        <Route path="/orders" element={<Orders />} />
      </Route>

      {/* Error pages */}
      <Route path="/403" element={<Forbidden />} />
    </Routes>
  );
};

export default Router;

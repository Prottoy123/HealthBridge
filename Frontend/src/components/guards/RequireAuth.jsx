// src/components/guards/RequireAuth.jsx
import { Navigate, Outlet } from "react-router-dom";
import { useSelector } from "react-redux";

const RequireAuth = () => {
  const { accessToken } = useSelector((state) => state.auth);

  return accessToken ? <Outlet /> : <Navigate to="/" replace />;
};
export default RequireAuth;

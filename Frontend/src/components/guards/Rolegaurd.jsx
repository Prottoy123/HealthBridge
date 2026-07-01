// src/components/guards/RoleGuard.jsx
import { Navigate, Outlet } from "react-router-dom";
import { useSelector } from "react-redux";

const RoleGuard = ({ allowedRoles }) => {
  const { user } = useSelector((state) => state.auth);

  return allowedRoles.includes(user?.role) ? (
    <Outlet />
  ) : (
    <Navigate to="/unauthorized" replace />
  );
};
export default RoleGuard;

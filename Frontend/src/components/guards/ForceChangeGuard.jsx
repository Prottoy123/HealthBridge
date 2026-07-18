import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";

const ForceChangeGuard = ({ children }) => {
  const { user, isAuthenticated } = useSelector((state) => state.auth);
  const location = useLocation();

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (["STAFF", "ADMIN"].includes(user.role) && user.status === "PENDING") {
    return <Navigate to="/setup-password" replace />;
  }
  return children;
};

export default ForceChangeGuard;

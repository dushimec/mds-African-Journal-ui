import React from "react";
import { Navigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const AdminRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const token = localStorage.getItem("access_token");

  if (!token) return <Navigate to="/login" replace />;

  try {
    const decoded = jwtDecode<{ role: string }>(token);
    if (decoded.role !== "ADMIN") {
      return <Navigate to="/unauthorized" replace />; 
    }
  } catch (err) {
    console.error("Invalid token", err);
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

export default AdminRoute;

import React from "react";
import { Navigate, Outlet } from "react-router-dom";

export default function ProtectedRoute() {
  const jwt_token = localStorage.getItem("token");
  const isAuthenticated = !!jwt_token;

  if (isAuthenticated) {
    return <Outlet />;
  } else {
    return <Navigate to={"/login"} />;
  }
}

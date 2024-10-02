import React from "react";
import { Navigate, Outlet } from "react-router-dom";
import Header from "./header";

const ProtectedRoute: React.FC = () => {
  const jwt_token = localStorage.getItem("token");
  const isAuthenticated = !!jwt_token;

  if (isAuthenticated) {
    return (
      <div className="flex flex-grow">
        <Header />
        <div className="mb-16 mt-16 flex flex-grow">
          <Outlet />
        </div>
      </div>
    );
  } else {
    return <Navigate to={"/login"} />;
  }
};

export default ProtectedRoute;

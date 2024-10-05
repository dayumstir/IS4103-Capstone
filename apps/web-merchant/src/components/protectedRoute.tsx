import React, { useEffect } from "react";
import { Navigate, Outlet } from "react-router-dom";
import Header from "./header";
import { useGetProfileQuery } from "../redux/services/profile";
import { useDispatch } from "react-redux";
import { setMerchant } from "../redux/features/profileSlice";

const ProtectedRoute: React.FC = () => {
  const jwt_token = localStorage.getItem("token");
  const merchantId = localStorage.getItem("merchantId");
  const isAuthenticated = !!jwt_token && !!merchantId;

  const dispatch = useDispatch();
  if (!isAuthenticated) {
    return <Navigate to={"/login"} />;
  }

  const { data: profile } = useGetProfileQuery(merchantId);
  useEffect(() => {
    if (profile) {
      dispatch(setMerchant(profile));
    }
  });

  return (
    <div className="flex flex-grow">
      <Header />
      <div className="mt-16 flex flex-grow">
        <Outlet />
      </div>
    </div>
  );
};

export default ProtectedRoute;

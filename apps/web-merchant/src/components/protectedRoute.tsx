import React, { useEffect } from "react";
import { Navigate, Outlet } from "react-router-dom";
import Header from "./header";
import { useGetProfileQuery } from "../redux/services/profile";
import { useDispatch } from "react-redux";
import { setMerchant } from "../redux/features/profileSlice";

const ProtectedRoute: React.FC = () => {
  const jwt_token = localStorage.getItem("token");
  const isAuthenticated = !!jwt_token;

  const merchantId = localStorage.getItem("merchantId");
  const dispatch = useDispatch();
  if (!merchantId) {
    return null;
  }
  const { data: profile } = useGetProfileQuery(merchantId);

  useEffect(() => {
    if (profile) {
      dispatch(setMerchant(profile));
    }
  });

  if (isAuthenticated) {
    return (
      <div className="flex flex-grow">
        <Header />
        <div className="mt-16 flex flex-grow">
          <Outlet />
        </div>
      </div>
    );
  } else {
    return <Navigate to={"/login"} />;
  }
};

export default ProtectedRoute;

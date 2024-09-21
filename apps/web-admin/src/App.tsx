import React from "react";
import { Layout, Menu, Button } from "antd";
import { Route, Routes, useNavigate, Navigate } from "react-router-dom";

import LoginScreen from "./screens/loginScreen";
import ProfileScreen from "./screens/profileScreen";
import InstalmentPlanScreen from "./screens/instalmentPlanScreen";
import CreditTierScreen from "./screens/creditTierScreen";
import EditProfileScreen from "./screens/editProfileScreen";
import AllCustomersScreen from "./screens/allCustomersScreen";
import CustomerProfileScreen from "./screens/customerProfileScreen";

import ProtectedRoute from "./components/protectedRoute";
export default function App() {
  const items = [
    { label: <a href="/home">Home</a>, key: "Home" },
    { label: <a href="/admin/profile">Profile</a>, key: "Profile" },
    { label: <a href="/admin/customers">Customers</a>, key: "Customers" },
    { label: <a href="/admin/merchants">Merchants</a>, key: "Merchants" },
    {
      label: <a href="/business-management">Business management</a>,
      key: "Business management",
    },
    {
      label: <a href="/credit-tier">Credit Tier</a>,
      key: "Credit Tier",
    },
    {
      label: <a href="/instalment-plan">Instalment Plan</a>,
      key: "Instalment Plan",
    },
  ];

  const navigate = useNavigate();

  const jwt_token = localStorage.getItem("token");
  const isAuthenticated = !!jwt_token;

  const handleLogout = async () => {
    try {
      if (!jwt_token) {
        throw new Error("No token found");
      }
      // Send a POST request to the logout endpoint with a JSON payload
      const response = await fetch("http://localhost:3000/adminauth/logout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${jwt_token}`,
        },
        body: JSON.stringify({
          reason: "User requested logout",
        }),
      });
      console.log(response);
      if (response.ok) {
        // Handle successful logout
        localStorage.removeItem("token");
        navigate("/login");
      } else {
        // Handle errors
        console.error("Logout failed");
      }
    } catch (error) {
      console.error("An error occurred during logout:", error);
    }
  };

  return (
    <Layout className="min-h-screen">
      {isAuthenticated && (
        <Layout.Header className="fixed top-0 z-10 flex w-full items-center bg-gray-200">
          <Menu
            className="flex-1 bg-inherit"
            mode="horizontal"
            // TODO: Remove default selected keys
            defaultSelectedKeys={["2"]}
            items={items}
          />
          <Button onClick={handleLogout} danger>
            Logout
          </Button>
        </Layout.Header>
      )}

      <Layout.Content className={`${isAuthenticated ? "mt-16" : ""} bg-white`}>
        <Routes>
          {/* ===== Public routes ===== */}
          <Route path="/" element={<Navigate to="/login" />} />
          <Route path="/login" element={<LoginScreen />} />
          <Route element={<ProtectedRoute />}>
            {/* ===== Protected routes ===== */}
            <Route path="/admin/profile" element={<ProfileScreen />} />
            <Route path="/admin/editprofile" element={<EditProfileScreen />} />
            <Route path="/instalment-plan" element={<InstalmentPlanScreen />} />
            <Route path="/credit-tier" element={<CreditTierScreen />} />
            <Route path="/admin/customers" element={< AllCustomersScreen/>} />
            <Route path="/admin/customer/:id" element={< CustomerProfileScreen/>} />
            <Route path="/admin/merchants" element={< AllMerchantsScreen/>} />
            <Route path="/admin/merchant/:id" element={< MerchantProfileScreen/>} />

          </Route>
        </Routes>
      </Layout.Content>

      <Layout.Footer className="flex items-center justify-center">
        PandaPay ©{new Date().getFullYear()}
      </Layout.Footer>
    </Layout>
  );
}

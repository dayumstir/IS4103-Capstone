import React from "react";
import { Layout, Menu, Button } from "antd";
import { Route, Routes, useNavigate, Navigate } from "react-router-dom";

import LoginPage from "./pages/auth/login";
import ProfilePage from "./pages/profile";
import InstalmentPlanPage from "./pages/instalmentPlan";
import CreditTierPage from "./pages/creditTier";
import ProtectedRoute from "./pages/auth/protectedRoute";

export default function App() {
  const items = [
    { label: <a href="/holder">Home</a>, key: "Home" },
    { label: <a href="/admin/profile">Profile</a>, key: "Profile" },
    { label: <a href="/holder">Customers</a>, key: "Customers" },
    { label: <a href="/holder">Merchants</a>, key: "Merchants" },
    {
      label: <a href="/holder">Business management</a>,
      key: "Business management",
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
          <Route path="/login" element={<LoginPage />} />
          <Route element={<ProtectedRoute />}>
            {/* ===== Protected routes ===== */}
            <Route path="/admin/profile" element={<ProfilePage />} />
            <Route
              path="/admin/instalment-plan"
              element={<InstalmentPlanPage />}
            />
            <Route path="/admin/credit-tier" element={<CreditTierPage />} />
          </Route>
        </Routes>
      </Layout.Content>

      <Layout.Footer className="flex items-center justify-center">
        PandaPay ©{new Date().getFullYear()}
      </Layout.Footer>
    </Layout>
  );
}

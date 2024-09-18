import React from "react";
import { Layout, Menu, Button } from "antd";
import { Route, Routes, useNavigate, Navigate } from "react-router-dom";

import LoginPage from "./pages/auth/login";
import ProfilePage from "./pages/profile";
import InstalmentPlanPage from "./pages/instalmentPlan";
import CreditTierPage from "./pages/creditTier";

export default function App() {
  const { Header, Footer } = Layout;
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
    <div style={{ height: "100vh", display: "flex", flexDirection: "column" }}>
      <Header
        style={{
          display: "flex",
          alignItems: "center",
          backgroundColor: "#F5F5F5",
          position: "fixed",
          top: 0,
          width: "100%",
          zIndex: 1, // Keep it above content
        }}
      >
        <>
          {jwt_token && (
            <Menu
              mode="horizontal"
              defaultSelectedKeys={["2"]}
              items={items}
              style={{ flex: 1, minWidth: 0, backgroundColor: "#F5F5F5" }}
            />
          )}
        </>

        <>{jwt_token && <Button onClick={handleLogout}>Logout</Button>}</>
      </Header>

      <div
        style={{
          height: window.outerHeight - 70 - 50,
          marginTop: 70,
          marginBottom: 50,
          display: "flex",
          flexDirection: "column",
        }}
      >
        <Routes>
          <Route path="/" element={<Navigate to="/login" />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/admin/profile" element={<ProfilePage />} />
          <Route
            path="/admin/instalment-plan"
            element={<InstalmentPlanPage />}
          />
          <Route path="/admin/credit-tier" element={<CreditTierPage />} />
        </Routes>
      </div>
      <Footer
        style={{
          textAlign: "center",
          position: "fixed",
          bottom: 0,
          width: "100%",
        }}
      >
        PandaPay ©{new Date().getFullYear()}
      </Footer>
    </div>
  );
}

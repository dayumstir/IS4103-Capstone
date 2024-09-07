import React, { useState } from "react";
import reactLogo from "./assets/react.svg";
import viteLogo from "/vite.svg";
import { Breadcrumb, Layout, Menu, theme, Button } from "antd";
import {
  BrowserRouter as Router,
  Route,
  Routes,
  useNavigate,
} from "react-router-dom";
import HomeScreen from "./screens/homeScreen";
import LoginScreen from "./screens/loginScreen";
import RegisterScreen from "./screens/registerScreen";

// import "./App.css";

const App = () => {
  const { Header, Footer } = Layout;
  const items = [
    { label: <a href="/">Home</a>, key: "Home" },
    { label: <a href="/transactions">Transactions</a>, key: "Transactions" },
    { label: <a href="/qr">View QR Code</a>, key: "ViewQRCode" },
    { label: <a href="/payments">Payments</a>, key: "Payments" },
    { label: <a href="/cashback">Cashback</a>, key: "Cashback" },
  ];

  const navigate = useNavigate();
  return (
    // <div>
    //   <Header
    //     style={{
    //       display: "flex",
    //       alignItems: "center",
    //       backgroundColor: "#F5F5F5",
    //       position: "fixed",
    //       top: 0,
    //       width: "100%",
    //     }}
    //   >
    //     <Menu
    //       mode="horizontal"
    //       defaultSelectedKeys={["2"]}
    //       items={items}
    //       style={{ flex: 1, minWidth: 0, backgroundColor: "#F5F5F5" }}
    //     />
    //     <Button onClick={() => navigate("/login")}>Login</Button>
    //   </Header>
    //   <div style={{ marginTop: 70 }}>
    //     <Routes>
    //       <Route path="/" element={<HomeScreen />} />
    //       <Route path="/login" element={<LoginScreen />} />
    //       <Route path="/register" element={<RegisterScreen />} />
    //     </Routes>
    //   </div>
    //   <Footer
    //     style={{
    //       textAlign: "center",
    //       position: "fixed",
    //       bottom: 0,
    //       width: "100%",
    //     }}
    //   >
    //     PandaPay ©{new Date().getFullYear()}
    //   </Footer>
    // </div>
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
        <Menu
          mode="horizontal"
          defaultSelectedKeys={["2"]}
          items={items}
          style={{ flex: 1, minWidth: 0, backgroundColor: "#F5F5F5" }}
        />
        <Button onClick={() => navigate("/login")}>Login</Button>
      </Header>

      {/* Content Area, leaving space for header and footer */}
      <div
        style={{
          // flexGrow: 1,
          height: window.outerHeight - 70 - 50,
          marginTop: 70,
          marginBottom: 50,
          display: "flex",
          flexDirection: "column",
        }}
      >
        <Routes>
          <Route path="/" element={<HomeScreen />} />
          <Route path="/login" element={<LoginScreen />} />
          <Route path="/register" element={<RegisterScreen />} />
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
};

export default App;

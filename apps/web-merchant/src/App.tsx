import React from "react";
import { Route, Routes, Navigate } from "react-router-dom";
import HomeScreen from "./screens/homeScreen";
import LoginScreen from "./screens/loginScreen";
import RegisterScreen from "./screens/registerScreen";
import TransactionScreen from "./screens/transactionScreen";
import Header from "./components/header";
import { useSelector } from "react-redux";
import { RootState } from "./redux/store";
import Footer from "./components/footer";

// import "./App.css";

const App = () => {
  const isAuthenticated = useSelector(
    (state: RootState) => state.auth.isAuthenticated,
  );

  return (
    <div style={{ height: "100vh", display: "flex", flexDirection: "column" }}>
      <Header />

      <div
        style={{
          // flexGrow: 1,
          height: window.outerHeight - 70 - 50,
          marginTop: 70,
          marginBottom: 70,
          padding: 10,
          display: "flex",
          flexDirection: "column",
          marginLeft: 50,
          marginRight: 50,
        }}
      >
        <Routes>
          <Route
            path="/"
            element={
              isAuthenticated ? <HomeScreen /> : <Navigate to="/login" />
            }
          />
          <Route path="/register" element={<RegisterScreen />} />
          <Route path="/login" element={<LoginScreen />} />
        </Routes>
      </div>

      <Footer />
    </div>
  );
};

export default App;

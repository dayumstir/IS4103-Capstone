import React from "react";
import { Route, Routes, Navigate } from "react-router-dom";
import HomeScreen from "./screens/homeScreen";
import LoginScreen from "./screens/loginScreen";
import RegisterScreen from "./screens/registerScreen";
import Header from "./components/header";
import { useSelector } from "react-redux";
import { RootState } from "./redux/store";
import Footer from "./components/footer";
import ProfileScreen from "./screens/profileScreen";

// import "./App.css";

const App = () => {
  const isAuthenticated = useSelector(
    (state: RootState) => state.auth.isAuthenticated,
  );

  return (
    <div className="flex h-screen flex-col">
      <Header />

      <div className="mx-12 mb-16 mt-16 flex h-[calc(100vh-120px)] flex-col p-2">
        <Routes>
          <Route
            path="/"
            element={
              isAuthenticated ? <HomeScreen /> : <Navigate to="/login" />
            }
          />
          <Route
            path="/profile"
            element={
              isAuthenticated ? <ProfileScreen /> : <Navigate to="/login" />
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

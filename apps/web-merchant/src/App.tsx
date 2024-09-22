import React from "react";
import { Route, Routes } from "react-router-dom";
import HomeScreen from "./screens/homeScreen";
import LoginScreen from "./screens/loginScreen";
import RegisterScreen from "./screens/registerScreen";
import Header from "./components/header";
import Footer from "./components/footer";
import ProfileScreen from "./screens/profileScreen";
import ProtectedRoute from "./components/protectedRoute";
import RegisterConfirmScreen from "./screens/registerConfirmScreen";

// import "./App.css";

const App = () => {
  return (
    <div className="flex h-screen flex-col">
      <Header />
      <div className="mx-12 mb-16 mt-16 flex h-[calc(100vh-120px)] flex-col p-2">
        <Routes>
          <Route path="/register" element={<RegisterScreen />} />
          <Route path="/register-confirm" element={<RegisterConfirmScreen />} />
          <Route path="/login" element={<LoginScreen />} />
          <Route element={<ProtectedRoute />}>
            <Route path="/" element={<HomeScreen />} />
            <Route path="/profile" element={<ProfileScreen />} />
          </Route>
        </Routes>
      </div>
      <Footer />
    </div>
  );
};

export default App;

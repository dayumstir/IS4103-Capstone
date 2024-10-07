import { Layout } from "antd";
import { Route, Routes } from "react-router-dom";
import BusinessManagementRoute from "./components/businessManagementRoute";
import ProtectedRoute from "./components/protectedRoute";
import HomeScreen from "./screens/homeScreen";
import IssueDetailsScreen from "./screens/issueDetailsScreen";
import IssueScreen from "./screens/issueScreen";
import LoginScreen from "./screens/loginScreen";
import ProfileScreen from "./screens/profileScreen";
import RegisterConfirmScreen from "./screens/registerConfirmScreen";
import RegisterScreen from "./screens/registerScreen";
import ViewQRCodeScreen from "./screens/viewQRCodeScreen";

// import "./App.css";

const App = () => {
  return (
    <Layout className="min-h-screen bg-white">
      {/* <div className="flex h-screen flex-col"> */}
      <Routes>
        <Route path="/register" element={<RegisterScreen />} />
        <Route path="/register-confirm" element={<RegisterConfirmScreen />} />
        <Route path="/login" element={<LoginScreen />} />
        <Route element={<ProtectedRoute />}>
          <Route path="/" element={<HomeScreen />} />
          <Route path="/profile" element={<ProfileScreen />} />
          <Route path="/qrcode" element={<ViewQRCodeScreen />} />
          <Route element={<BusinessManagementRoute />}>
            <Route
              path="/business-management/issues"
              element={<IssueScreen />}
            />
            <Route
              path="/business-management/issues/:issueId"
              element={<IssueDetailsScreen />}
            />
          </Route>
        </Route>
      </Routes>
      {/* </div> */}
    </Layout>
  );
};

export default App;

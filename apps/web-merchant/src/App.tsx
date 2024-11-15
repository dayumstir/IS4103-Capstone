// apps/web-merchant/src/App.tsx
import { Layout } from "antd";
import { Route, Routes } from "react-router-dom";


import ProtectedRoute from "./components/protectedRoute";
import BusinessManagementRoute from "./components/businessManagementRoute";

import ForgetPasswordScreen from "./screens/forgetPasswordScreen";
import HomeScreen from "./screens/homeScreen";
import IssueDetailsScreen from "./screens/issueDetailsScreen";
import IssueScreen from "./screens/issueScreen";
import LoginScreen from "./screens/loginScreen";
import MerchantPaymentDetailsScreen from "./screens/merchantPaymentDetailsScreen";
import MerchantPaymentsScreen from "./screens/merchantPaymentsScreen";
import NotificationScreen from "./screens/notificationScreen";
import ProfileScreen from "./screens/profileScreen";
import RegisterConfirmScreen from "./screens/registerConfirmScreen";
import RegisterScreen from "./screens/registerScreen";
import TransactionDetailsScreen from "./screens/transactionDetailsScreen";
import TransactionScreen from "./screens/transactionScreen";
import ViewQRCodeScreen from "./screens/viewQRCodeScreen";

const App = () => {
  return (
    <Layout className="min-h-screen bg-white">
      <Routes>
        {/* Public Routes */}
        <Route path="/forget-password" element={<ForgetPasswordScreen />} />
        <Route path="/login" element={<LoginScreen />} />
        <Route path="/register" element={<RegisterScreen />} />
        <Route path="/register-confirm" element={<RegisterConfirmScreen />} />
        
        {/* Protected Routes */}
        <Route element={<ProtectedRoute />}>
          <Route path="/" element={<HomeScreen />} />
          <Route path="/notifications" element={<NotificationScreen />} />
          <Route path="/profile" element={<ProfileScreen />} />
          <Route path="/qrcode" element={<ViewQRCodeScreen />} />

          {/* Business Management Routes */}
          <Route element={<BusinessManagementRoute />}>
          <Route
              path="/business-management/issues"
              element={<IssueScreen />}
            />
            <Route
              path="/business-management/issues/:issueId"
              element={<IssueDetailsScreen />}
            />
            <Route
              path="/business-management/transactions"
              element={<TransactionScreen />}
            />
            <Route
              path="/business-management/transactions/:transactionId"
              element={<TransactionDetailsScreen />}
            />
            <Route
              path="/business-management/merchant-payments"
              element={<MerchantPaymentsScreen />}
            />
            <Route
              path="/business-management/merchant-payments/:merchantPaymentId"
              element={<MerchantPaymentDetailsScreen />}
            />
          </Route>
        </Route>
      </Routes>
    </Layout>
  );
};

export default App;

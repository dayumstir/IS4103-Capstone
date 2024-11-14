// apps/web-admin/src/App.tsx
import { Layout } from "antd";
import { Route, Routes } from "react-router-dom";

import ProtectedRoute from "./components/protectedRoute";
import BusinessManagementRoute from "./components/businessManagementRoute";

import AddAdminScreen from "./screens/addAdmin";
import AllAdminScreen from "./screens/allAdminScreen";
import AllCustomersScreen from "./screens/allCustomersScreen";
import AllIssuesScreen from "./screens/allIssuesScreen";
import AllMerchantsScreen from "./screens/allMerchantsScreen";
import CreditTierScreen from "./screens/creditTierScreen";
import CustomerProfileScreen from "./screens/customerProfileScreen";
import EditProfileScreen from "./screens/editProfileScreen";
import ForgetPasswordScreen from "./screens/forgetPasswordScreen";
import HomeScreen from "./screens/homeScreen";
import InstalmentPlanScreen from "./screens/instalmentPlanScreen";
import LoginScreen from "./screens/loginScreen";
import MerchantPaymentScreen from "./screens/merchantPaymentScreen";
import MerchantProfileScreen from "./screens/merchantProfileScreen";
import MerchantSizeScreen from "./screens/merchantSizeScreen";
import NotificationsScreen from "./screens/notificationsScreen";
import ProfileScreen from "./screens/profileScreen";
import RatingsScreen from "./screens/ratingScreen";
import CreditScoreScreen from "./screens/creditScoreScreen";
import TransactionsScreen from "./screens/transactionsScreen";
import VoucherScreen from "./screens/voucherScreen";
import WithdrawalFeeRateScreen from "./screens/withdrawalFeeRateScreen";

export default function App() {
  return (
    <Layout className="min-h-screen">
      <Routes>
        {/* ===== Public routes ===== */}
        <Route path="/forget-password" element={<ForgetPasswordScreen />} />
        <Route path="/login" element={<LoginScreen />} />

        <Route element={<ProtectedRoute />}>
          {/* ===== Protected routes ===== */}
          <Route path="/" element={<HomeScreen />} />

          <Route path="/profile" element={<ProfileScreen />} />
          <Route path="/editprofile" element={<EditProfileScreen />} />

          <Route path="/admins/add" element={<AddAdminScreen />} />
          <Route path="/admins" element={<AllAdminScreen />} />

          <Route path="/admin/customers" element={<AllCustomersScreen />} />
          <Route
            path="/admin/customer/:id"
            element={<CustomerProfileScreen />}
          />

          <Route path="/admin/merchants" element={<AllMerchantsScreen />} />
          <Route
            path="/admin/merchant/:id"
            element={<MerchantProfileScreen />}
          />

          <Route element={<BusinessManagementRoute />}>
            {/* ===== Business Management ===== */}
            <Route
              path="/business-management/credit-tier"
              element={<CreditTierScreen />}
            />
            <Route
              path="/business-management/instalment-plan"
              element={<InstalmentPlanScreen />}
            />
            <Route
              path="/business-management/issues"
              element={<AllIssuesScreen />}
            />
            <Route
              path="/business-management/merchant-payments"
              element={<MerchantPaymentScreen />}
            />
            <Route
              path="/business-management/withdrawal-fee"
              element={<WithdrawalFeeRateScreen />}
            />
            <Route
              path="/business-management/merchant-size"
              element={<MerchantSizeScreen />}
            />
            <Route
              path="/business-management/notifications"
              element={<NotificationsScreen />}
            />
            <Route
              path="/business-management/ratings"
              element={<RatingsScreen />}
            />
            <Route
              path="/business-management/credit-score"
              element={<CreditScoreScreen />}
            />
            <Route
              path="/business-management/transactions"
              element={<TransactionsScreen />}
            />
            <Route
              path="/business-management/voucher"
              element={<VoucherScreen />}
            />
            <Route
              path="/business-management/withdrawal-fee"
              element={<WithdrawalFeeRateScreen />}
            />
          </Route>
        </Route>
      </Routes>
    </Layout>
  );
}

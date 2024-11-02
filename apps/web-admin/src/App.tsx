import { Layout } from "antd";
import { Route, Routes } from "react-router-dom";

import ProtectedRoute from "./components/protectedRoute";
import BusinessManagementRoute from "./components/businessManagementRoute";

import LoginScreen from "./screens/loginScreen";
import ProfileScreen from "./screens/profileScreen";
import InstalmentPlanScreen from "./screens/instalmentPlanScreen";
import CreditTierScreen from "./screens/creditTierScreen";
import EditProfileScreen from "./screens/editProfileScreen";
import AddAdminScreen from "./screens/addAdmin";
import AllCustomersScreen from "./screens/allCustomersScreen";
import CustomerProfileScreen from "./screens/customerProfileScreen";
import AllMerchantsScreen from "./screens/allMerchantsScreen";
import MerchantProfileScreen from "./screens/merchantProfileScreen";
import HomeScreen from "./screens/homeScreen";
import AllAdminScreen from "./screens/allAdminScreen";
import VoucherScreen from "./screens/voucherScreen";
import AllIssuesScreen from "./screens/allIssuesScreen";
import TransactionsScreen from "./screens/transactionsScreen";
import NotificationsScreen from "./screens/notificationsScreen";

export default function App() {
  return (
    <Layout className="min-h-screen">
      <Routes>
        {/* ===== Public routes ===== */}
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
              path="/business-management/instalment-plan"
              element={<InstalmentPlanScreen />}
            />
            <Route
              path="/business-management/credit-tier"
              element={<CreditTierScreen />}
            />
            <Route
              path="/business-management/voucher"
              element={<VoucherScreen />}
            />
            <Route
              path="/business-management/issues"
              element={<AllIssuesScreen />}
            />
            <Route
              path="/business-management/transactions"
              element={<TransactionsScreen />}
            />
            <Route
              path="/business-management/notifications"
              element={<NotificationsScreen />}
            />
          </Route>
        </Route>
      </Routes>
    </Layout>
  );
}

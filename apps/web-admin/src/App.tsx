import { Layout } from "antd";
import { Route, Routes } from "react-router-dom";

import ProtectedRoute from "./components/protectedRoute";

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

export default function App() {
  return (
    <Layout className="min-h-screen">
      <Routes>
        {/* ===== Public routes ===== */}
        <Route path="/login" element={<LoginScreen />} />
        <Route element={<ProtectedRoute />}>
          {/* ===== Protected routes ===== */}
          <Route path="/" element={<HomeScreen />} />
          <Route path="/admin/profile" element={<ProfileScreen />} />
          <Route path="/admin/editprofile" element={<EditProfileScreen />} />
          <Route path="/admin/add" element={<AddAdminScreen />} />
          <Route path="/instalment-plan" element={<InstalmentPlanScreen />} />
          <Route path="/credit-tier" element={<CreditTierScreen />} />
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
        </Route>
      </Routes>

      <Layout.Footer className="flex items-center justify-center">
        PandaPay ©{new Date().getFullYear()}
      </Layout.Footer>
    </Layout>
  );
}

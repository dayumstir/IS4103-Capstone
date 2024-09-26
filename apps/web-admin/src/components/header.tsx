import { Layout, Menu, Button, message } from "antd";
import { useNavigate } from "react-router-dom";
import { useLogoutMutation } from "../redux/services/adminAuthService";

export default function Header({ isSuperAdmin }: { isSuperAdmin: boolean }) {
  const navigate = useNavigate();
  const [logout] = useLogoutMutation();

  const items = [
    { label: <a href="/">Home</a>, key: "Home" },
    { label: <a href="/admin/profile">Profile</a>, key: "Profile" },
    ...(isSuperAdmin
      ? [{ label: <a href="/admin/add">Add Admin</a>, key: "AddAdmin" }]
      : []),
    { label: <a href="/admin/customers">Customers</a>, key: "Customers" },
    { label: <a href="/admin/merchants">Merchants</a>, key: "Merchants" },
    {
      label: <a href="/business-management">Business Management</a>,
      key: "Business Management",
    },
    {
      label: <a href="/credit-tier">Credit Tier</a>,
      key: "Credit Tier",
    },
    {
      label: <a href="/instalment-plan">Instalment Plan</a>,
      key: "Instalment Plan",
    },
  ];

  const handleLogout = async () => {
    try {
      await logout({ reason: "User requested logout" }).unwrap();
      localStorage.removeItem("token");
      navigate("/login");
    } catch (error) {
      message.error("An error occurred during logout");
      console.error("An error occurred during logout:", error);
    }
  };

  return (
    <Layout.Header className="fixed top-0 z-10 flex w-full items-center bg-gray-200">
      <Menu className="flex-1 bg-inherit" mode="horizontal" items={items} />
      <Button onClick={handleLogout} danger>
        Logout
      </Button>
    </Layout.Header>
  );
}

import { Button, Layout, Menu, message } from "antd";
import { useNavigate, useLocation } from "react-router-dom";
import { useLogoutMutation } from "../redux/services/adminAuthService";

export default function Header({ isSuperAdmin }: { isSuperAdmin: boolean }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [logout] = useLogoutMutation();

  const items = [
    { label: <a href="/">Home</a>, key: "/" },
    { label: <a href="/profile">Profile</a>, key: "/profile" },
    ...(isSuperAdmin
      ? [{ label: <a href="/admins">Admins</a>, key: "/admins" }]
      : []),
    {
      label: <a href="/admin/customers">Customers</a>,
      key: "/admin/customers",
    },
    {
      label: <a href="/admin/merchants">Merchants</a>,
      key: "/admin/merchants",
    },
    {
      label: (
        <a href="/business-management/instalment-plan">Business Management</a>
      ),
      key: "/business-management/instalment-plan",
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
      localStorage.removeItem("token");
      navigate("/login");
    }
  };

  return (
    <Layout.Header className="fixed top-0 z-10 flex w-full items-center bg-gray-200">
      <Menu
        className="flex-1 bg-gray-200"
        mode="horizontal"
        items={items}
        selectedKeys={[location.pathname]}
      />
      <Button onClick={handleLogout}>Logout</Button>
    </Layout.Header>
  );
}

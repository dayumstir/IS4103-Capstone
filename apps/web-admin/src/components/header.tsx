import { Button, Layout, Menu, message } from "antd";
import { useNavigate } from "react-router-dom";
import { useLogoutMutation } from "../redux/services/adminAuthService";

export default function Header({ isSuperAdmin }: { isSuperAdmin: boolean }) {
  const navigate = useNavigate();
  const [logout] = useLogoutMutation();

  const items = [
    { label: <a href="/">Home</a>, key: "Home" },
    { label: <a href="/admin/profile">Profile</a>, key: "Profile" },
    ...(isSuperAdmin
      ? [{ label: <a href="/admin/all">View Admins</a>, key: "View Admin" }]
      : []),
    { label: <a href="/admin/customers">Customers</a>, key: "Customers" },
    { label: <a href="/admin/merchants">Merchants</a>, key: "Merchants" },
    {
      label: (
        <a href="/business-management/instalment-plan">Business Management</a>
      ),
      key: "Business Management",
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
        className="flex-1 bg-inherit"
        mode="horizontal"
        items={items}
        defaultSelectedKeys={["Home"]}
      />
      <Button onClick={handleLogout}>Logout</Button>
    </Layout.Header>
  );
}

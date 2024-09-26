import { Button, Layout, Menu, message } from "antd";
import { Link, useNavigate } from "react-router-dom";
import { useLogoutMutation } from "../redux/services/adminAuthService";

export default function Header({ isSuperAdmin }: { isSuperAdmin: boolean }) {
  const navigate = useNavigate();
  const [logout] = useLogoutMutation();

  const items = [
    { label: <Link to="/">Home</Link>, key: "Home" },
    { label: <Link to="/admin/profile">Profile</Link>, key: "Profile" },
    ...(isSuperAdmin
      ? [{ label: <Link to="/admin/add">Add Admin</Link>, key: "AddAdmin" }]
      : []),
    { label: <Link to="/admin/customers">Customers</Link>, key: "Customers" },
    { label: <Link to="/admin/merchants">Merchants</Link>, key: "Merchants" },
    {
      label: (
        <Link to="/business-management/instalment-plan">
          Business Management
        </Link>
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

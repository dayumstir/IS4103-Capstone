import { Layout, Menu, MenuProps } from "antd";
import Sider from "antd/es/layout/Sider";
import { Link, Outlet, useLocation } from "react-router-dom";

export default function BusinessManagementRoute() {
  const location = useLocation();
  const currentPath = location.pathname.split("/").pop();

  const items: MenuProps["items"] = [
    {
      key: "Business Management",
      label: "Business Management",
      type: "group",
      children: [
        {
          key: "instalment-plan",
          label: (
            <Link to="/business-management/instalment-plan">
              Instalment Plan
            </Link>
          ),
        },
        {
          key: "credit-tier",
          label: <Link to="/business-management/credit-tier">Credit Tier</Link>,
        },
        {
          key: "voucher",
          label: <Link to="/business-management/voucher">Voucher</Link>,
        },
        {
          key: "issues",
          label: <Link to="/business-management/issues">Issues</Link>,
        },
        {
          key: "transactions",
          label: (
            <Link to="/business-management/transactions">Transactions</Link>
          ),
        },
        {
          key: "notifications",
          label: (
            <Link to="/business-management/notifications">Notifications</Link>
          ),
        },
      ],
    },
  ];

  return (
    <Layout>
      {/* Tailwind not supported */}
      <Sider style={{ backgroundColor: "#fff" }}>
        <Menu items={items} selectedKeys={[currentPath || "instalment-plan"]} />
      </Sider>
      <Outlet />
    </Layout>
  );
}

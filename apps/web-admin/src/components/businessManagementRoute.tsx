import { Layout, Menu, MenuProps } from "antd";
import Sider from "antd/es/layout/Sider";
import { Link, Outlet } from "react-router-dom";

export default function BusinessManagementRoute() {
  const items: MenuProps["items"] = [
    {
      key: "Business Management",
      label: "Business Management",
      type: "group",
      children: [
        {
          key: "InstalmentPlan",
          label: (
            <Link to="/business-management/instalment-plan">
              Instalment Plan
            </Link>
          ),
        },
        {
          key: "CreditTier",
          label: <Link to="/business-management/credit-tier">Credit Tier</Link>,
        },
      ],
    },
  ];

  return (
    <Layout>
      {/* Tailwind not supported */}
      <Sider style={{ backgroundColor: "#fff" }}>
        <Menu items={items} defaultSelectedKeys={["InstalmentPlan"]} />
      </Sider>
      <Outlet />
    </Layout>
  );
}

import { Layout, Menu, MenuProps } from "antd";
import Sider from "antd/es/layout/Sider";
import { Link, Outlet, useLocation } from "react-router-dom";

export default function BusinessManagementRoute() {
  const location = useLocation();
  let currentTab = "transactions";
  if (location.pathname.includes("transactions")) {
    currentTab = "transactions";
  } else if (location.pathname.includes("issues")) {
    currentTab = "issues";
  } else if (location.pathname.includes("merchant-payments")) {
    currentTab = "merchant-payments";
  }

  const items: MenuProps["items"] = [
    {
      key: "Business Management",
      label: "Business Management",
      type: "group",
      children: [
        {
          key: "transactions",
          label: (
            <Link to="/business-management/transactions">Transactions</Link>
          ),
        },
        {
          key: "merchant-payments",
          label: (
            <Link to="/business-management/merchant-payments">
              Merchant Payments
            </Link>
          ),
        },
        {
          key: "issues",
          label: <Link to="/business-management/issues">Issues</Link>,
        },
      ],
    },
  ];

  return (
    <Layout>
      <Sider style={{ backgroundColor: "#fff" }}>
        <Menu items={items} selectedKeys={[currentTab]} />
      </Sider>
      <div className="flex-grow p-5">
        <Outlet />
      </div>
    </Layout>
  );
}

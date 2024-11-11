import { Layout, Menu, MenuProps } from "antd";
import Sider from "antd/es/layout/Sider";
import { Link, Outlet, useLocation } from "react-router-dom";

export default function FinancialManagementRoute() {
  const location = useLocation();

  const items: MenuProps["items"] = [
    {
      key: "Financial Management",
      label: "Financial Management",
      type: "group",
      children: [
        {
          key: "Transactions",
          label: (
            <Link to="/financial-management/transactions">Transactions</Link>
          ),
        },
        {
          key: "Merchant Payments",
          label: (
            <Link to="/financial-management/merchant-payments">
              Merchant Payments
            </Link>
          ),
        },
      ],
    },
  ];

  const getCurrentKey = (path: string) => {
    if (path.includes("transactions")) {
      return "Transactions";
    }
    if (path.includes("merchant-payments")) {
      return "Merchant Payments";
    }
    return "";
  };

  return (
    <Layout>
      {/* Tailwind not supported */}
      <Sider style={{ backgroundColor: "#fff" }}>
        <Menu
          items={items}
          defaultSelectedKeys={["Transactions"]}
          selectedKeys={[getCurrentKey(location.pathname)]}
        />
      </Sider>
      <div className="flex-grow p-5">
        <Outlet />
      </div>
    </Layout>
  );
}

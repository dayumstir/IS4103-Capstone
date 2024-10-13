import { Layout, Menu, MenuProps } from "antd";
import Sider from "antd/es/layout/Sider";
import { Link, Outlet } from "react-router-dom";

export default function FinancialManagementRoute() {
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
      ],
    },
  ];

  return (
    <Layout>
      {/* Tailwind not supported */}
      <Sider style={{ backgroundColor: "#fff" }}>
        <Menu items={items} defaultSelectedKeys={["Transactions"]} />
      </Sider>
      <div className="flex-grow p-5">
        <Outlet />
      </div>
    </Layout>
  );
}

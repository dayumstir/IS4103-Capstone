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
          key: "Issues",
          label: <Link to="/business-management/issues">Issues</Link>,
        },
      ],
    },
  ];

  return (
    <Layout>
      {/* Tailwind not supported */}
      <Sider style={{ backgroundColor: "#fff" }}>
        <Menu items={items} defaultSelectedKeys={["Issues"]} />
      </Sider>
      <div className="flex-grow p-5">
        <Outlet />
      </div>
    </Layout>
  );
}

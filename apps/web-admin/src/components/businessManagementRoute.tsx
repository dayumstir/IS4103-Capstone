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
          key: "merchant-payments",
          label: (
            <Link to="/business-management/merchant-payments">
              Merchant Payments
            </Link>
          ),
        },
        {
          key: "withdrawal-fee",
          label: (
            <Link to="/business-management/withdrawal-fee">Withdrawal Fee</Link>
          ),
        },
        {
          key: "merchant-size",
          label: (
            <Link to="/business-management/merchant-size">Merchant Size</Link>
          ),
        },
        {
          key: "notifications",
          label: (
            <Link to="/business-management/notifications">Notifications</Link>
          ),
        },
        {
          key: "ratings",
          label: <Link to="/business-management/ratings">Ratings</Link>,
        },
        {
          key: "Credit Score",
          label: (
            <Link to="/business-management/credit-score">Credit Score</Link>
          ),
        },
      ],
    },
  ];

  return (
    <Layout>
      {/* Tailwind not supported */}
      <Sider style={{ backgroundColor: "#fff", minHeight: "100vh" }}>
        <Menu items={items} selectedKeys={[currentPath || "instalment-plan"]} />
      </Sider>
      <Outlet />
    </Layout>
  );
}

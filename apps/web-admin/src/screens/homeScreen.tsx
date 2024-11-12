import { Card, Row, Col, Statistic, Table, Select, Button } from "antd";
import { ArrowUpOutlined, ArrowDownOutlined } from "@ant-design/icons";
import {
  useGetTransactionsQuery,
  useGetTransactionStatsQuery,
} from "../redux/services/transactionService";
import { formatCurrency } from "../utils/formatCurrency";
import { format } from "date-fns";
import {
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
  CartesianGrid,
} from "recharts";
import { ICustomer, IMerchant } from "@repo/interfaces";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function HomeScreen() {
  const navigate = useNavigate();
  const { data: transactions } = useGetTransactionsQuery("");
  const { data: stats } = useGetTransactionStatsQuery();

  const getTransactionVolume = () => {
    if (!transactions) return 0;
    return transactions.reduce((acc, curr) => acc + curr.amount, 0);
  };

  const recentTransactions = transactions?.slice(0, 5) || [];

  const columns = [
    {
      title: "Merchant",
      dataIndex: "merchant",
      key: "merchant",
      render: (merchant: IMerchant) => merchant.name,
    },
    {
      title: "Customer",
      dataIndex: "customer",
      key: "customer",
      render: (customer: ICustomer) => customer.name,
    },
    {
      title: "Amount",
      dataIndex: "amount",
      key: "amount",
      render: (amount: number) => formatCurrency(amount),
    },
    {
      title: "Date",
      dataIndex: "date_of_transaction",
      key: "date",
      render: (date: string) => format(new Date(date), "dd MMM yyyy, HH:mm"),
    },
  ];

  const [timeFrame, setTimeFrame] = useState<"daily" | "monthly" | "yearly">(
    "daily",
  );

  const timeFrameOptions = [
    { value: "daily", label: "Daily" },
    { value: "monthly", label: "Monthly" },
    { value: "yearly", label: "Yearly" },
  ];

  const formatChartDate = (date: string) => {
    switch (timeFrame) {
      case "daily":
        return format(new Date(date), "dd MMM");
      case "monthly":
        return format(new Date(date), "MMM yyyy");
      case "yearly":
        return format(new Date(date), "yyyy");
    }
  };

  return (
    <div className="p-6">
      <h1 className="mb-4 text-2xl font-bold">Dashboard Overview</h1>

      {/* ===== Key Metrics ===== */}
      <Row gutter={16} className="mb-6">
        <Col span={6}>
          <Card>
            <Statistic
              title="Total Transaction Volume (All Time)"
              value={getTransactionVolume()}
              precision={2}
              prefix="$"
              valueStyle={{ color: "#000" }}
            />
            <div className="mt-2">
              <p
                className={`text-sm ${stats?.volumeIncrease && stats.volumeIncrease < 0 ? "text-red-600" : "text-green-600"}`}
              >
                {stats?.volumeIncrease && stats.volumeIncrease < 0 ? (
                  <ArrowDownOutlined />
                ) : (
                  <ArrowUpOutlined />
                )}{" "}
                {Math.abs(stats?.volumeIncrease || 0).toFixed(1)}% vs last month
              </p>
            </div>
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Active Customers"
              value={stats?.activeCustomers || 0}
              valueStyle={{ color: "#000" }}
            />
            <p className="mt-2 text-sm text-blue-600">
              {stats?.customerGrowth && stats.customerGrowth > 0 ? (
                <ArrowUpOutlined />
              ) : (
                <ArrowDownOutlined />
              )}{" "}
              {Math.abs(stats?.customerGrowth || 0).toFixed(1)}% growth
            </p>
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title={`Average Transaction Size (${format(
                new Date(),
                "MMM yyyy",
              )})`}
              value={stats?.avgTransactionSize || 0}
              prefix="$"
              precision={2}
              valueStyle={{ color: "#000" }}
            />
            <div className="">
              <p
                className={`mt-2 text-sm ${
                  stats?.avgTransactionChange && stats?.avgTransactionChange < 0
                    ? "text-red-600"
                    : "text-green-600"
                }`}
              >
                {stats?.avgTransactionChange &&
                stats?.avgTransactionChange > 0 ? (
                  <ArrowUpOutlined />
                ) : (
                  <ArrowDownOutlined />
                )}{" "} 
                {Math.abs(stats?.avgTransactionChange || 0).toFixed(1)}% vs last
                month
              </p>
            </div>
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title={`Default Rate (${format(new Date(), "MMM yyyy")})`}
              value={stats?.currentDefaultRate || 0}
              suffix="%"
              precision={2}
              valueStyle={{
                color:
                  stats?.currentDefaultRate && stats?.currentDefaultRate > 5
                    ? "#cf1322"
                    : "#3f8600",
              }}
            />

            <p
              className={`mt-2 text-sm ${
                stats?.defaultRateChange && stats?.defaultRateChange > 0
                  ? "text-red-600"
                  : "text-green-600"
              }`}
            >
              {stats?.defaultRateChange && stats?.defaultRateChange >= 0 ? (
                <ArrowUpOutlined />
              ) : (
                <ArrowDownOutlined />
              )}{" "}
              {Math.abs(stats?.defaultRateChange || 0).toFixed(1)}% vs last month
            </p>
          </Card>
        </Col>
      </Row>

      {/* ===== Transaction Trend Chart ===== */}
      <Card className="mb-6">
        <div className="mb-4 flex items-center justify-between">
          <h1 className="text-lg font-bold">Transaction Volume Trend</h1>
          <Select
            defaultValue="daily"
            value={timeFrame}
            onChange={setTimeFrame}
            options={timeFrameOptions}
            className="w-32"
          />
        </div>
        {stats?.dailyVolume && stats.dailyVolume.length > 0 ? (
          <div style={{ height: 300 }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={stats[`${timeFrame}Volume`]}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="date"
                  tickFormatter={formatChartDate}
                  fontSize={12}
                  minTickGap={20}
                />
                <YAxis tickFormatter={(value) => `${formatCurrency(value)}`} />
                <Tooltip
                  formatter={(value) => [
                    `${formatCurrency(value as number)}`,
                    "Volume",
                  ]}
                  labelFormatter={(date) => formatChartDate(date)}
                />
                <Area
                  type="monotone"
                  dataKey="volume"
                  stroke="#3b82f6"
                  fill="#3b82f6"
                  fillOpacity={0.2}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="text-center text-gray-500">No data available</div>
        )}
      </Card>

      {/* ===== Recent Transactions ===== */}
      <Card>
        <div className="mb-4 flex items-center justify-between">
          <h1 className="text-lg font-bold">Recent Transactions</h1>
          <Button
            type="link"
            onClick={() => navigate("/business-management/transactions")}
          >
            View All Transactions
          </Button>
        </div>
        <Table
          columns={columns}
          dataSource={recentTransactions}
          rowKey="transaction_id"
          pagination={false}
        />
      </Card>
    </div>
  );
}

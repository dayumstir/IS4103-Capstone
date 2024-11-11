import { useEffect, useState } from "react";
import {
  Avatar,
  Card,
  Typography,
  Statistic,
  Select,
  Table,
  Button,
} from "antd";
import {
  UserOutlined,
  CheckCircleOutlined,
  WarningOutlined,
  WalletOutlined,
  SyncOutlined,
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { useGetProfileQuery } from "../redux/services/profile";
import { Buffer } from "buffer";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import {
  format,
  subDays,
  addDays,
  addMonths,
  addYears,
  endOfDay,
  endOfMonth,
  endOfYear,
} from "date-fns";

import { useGetTransactionsByFilterMutation } from "../redux/services/transaction";
import { useGetMerchantInstalmentPaymentsQuery } from "../redux/services/instalmentPayment";
import {
  ICustomer,
  IInstalmentPayment,
  TransactionResult,
} from "@repo/interfaces";
import { formatCurrency } from "../utils/formatCurrency";

interface TransactionStats {
  totalAmount: number;
  completedPayments: number;
  latePayments: number;
  averageTransactionValue: number;
  timeFrameData: { date: string; amount: number }[];
}

const HomeScreen = () => {
  const { Text } = Typography;
  const navigate = useNavigate();
  const merchantId = localStorage.getItem("merchantId");
  const [profilePictureDisplay, setProfilePictureDisplay] = useState("");
  const [getTransactionsByFilter] = useGetTransactionsByFilterMutation();
  const [timeFrame, setTimeFrame] = useState<"daily" | "monthly" | "yearly">(
    "daily",
  );
  const [recentTransactions, setRecentTransactions] = useState<
    TransactionResult[]
  >([]);

  const { data: profile } = useGetProfileQuery(merchantId ?? "");
  const { data: instalmentPayments } = useGetMerchantInstalmentPaymentsQuery();

  const [transactionStats, setTransactionStats] = useState<TransactionStats>({
    totalAmount: 0,
    latePayments: 0,
    completedPayments: 0,
    averageTransactionValue: 0,
    timeFrameData: [],
  });

  // Profile picture handling
  useEffect(() => {
    if (profile?.profile_picture) {
      try {
        // Handle both Buffer and base64 string cases
        const base64String = Buffer.isBuffer(profile.profile_picture)
          ? Buffer.from(profile.profile_picture).toString("base64")
          : profile.profile_picture;

        const profilePictureBase64 = `data:image/jpeg;base64,${base64String}`;
        setProfilePictureDisplay(profilePictureBase64);
      } catch (error) {
        console.error("Error processing profile picture:", error);
        setProfilePictureDisplay("");
      }
    }
  }, [profile]);

  // Fetch transaction data
  useEffect(() => {
    if (!merchantId) {
      navigate("/login");
      return;
    }

    const fetchTransactionData = async () => {
      try {
        const transactions = await getTransactionsByFilter({
          merchant_id: merchantId,
          create_from: new Date(0),
          create_to: new Date(),
        }).unwrap();

        setRecentTransactions(transactions.slice(0, 5));

        // Process transaction data
        const stats = {
          totalAmount: transactions.reduce(
            (sum: number, t: TransactionResult) => sum + t.amount,
            0,
          ),
          completedPayments:
            instalmentPayments?.filter(
              (p: IInstalmentPayment) => p.status === "PAID",
            ).length || 0,
          latePayments:
            instalmentPayments?.filter(
              (p: IInstalmentPayment) =>
                new Date(p.due_date) < new Date() && p.status === "UNPAID",
            ).length || 0,
          averageTransactionValue: transactions.length
            ? transactions.reduce(
                (sum: number, t: TransactionResult) => sum + t.amount,
                0,
              ) / transactions.length
            : 0,
          timeFrameData: processTimeFrameData(transactions),
        };

        setTransactionStats(stats);
      } catch (error) {
        console.error("Error fetching transaction data:", error);
      }
    };

    fetchTransactionData();
  }, [merchantId, profile]);

  const columns = [
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
    {
      title: "Reference",
      dataIndex: "reference_no",
      key: "reference",
      render: (reference: string) => reference,
    },
  ];

  const processTimeFrameData = (transactions: TransactionResult[]) => {
    const groupedData: Record<string, number> = {};
    let endDate: Date;
    let startDate: Date;

    // Determine start date based on timeFrame
    switch (timeFrame) {
      case "daily":
        endDate = endOfDay(new Date());
        startDate = subDays(endDate, 30);
        break;
      case "monthly":
        endDate = endOfMonth(new Date());
        startDate = subDays(endDate, 365);
        break;
      case "yearly":
        endDate = endOfYear(new Date());
        startDate = subDays(endDate, 365 * 5);
        break;
      default:
        endDate = endOfDay(new Date());
        startDate = subDays(endDate, 30);
    }

    // Initialize all dates with 0
    let currentDate = startDate;
    while (currentDate <= endDate) {
      let dateKey = "";
      switch (timeFrame) {
        case "daily":
          dateKey = format(currentDate, "MMM dd");
          currentDate = addDays(currentDate, 1);
          break;
        case "monthly":
          dateKey = format(currentDate, "MMM yyyy");
          currentDate = addMonths(currentDate, 1);
          break;
        case "yearly":
          dateKey = format(currentDate, "yyyy");
          currentDate = addYears(currentDate, 1);
          break;
      }
      groupedData[dateKey] = 0;
    }

    // Add actual transaction amounts
    transactions.forEach((t) => {
      const date = new Date(t.date_of_transaction);
      let dateKey = "";

      switch (timeFrame) {
        case "daily":
          dateKey = format(date, "MMM dd");
          break;
        case "monthly":
          dateKey = format(date, "MMM yyyy");
          break;
        case "yearly":
          dateKey = format(date, "yyyy");
          break;
      }

      if (dateKey in groupedData) {
        groupedData[dateKey] = (groupedData[dateKey] || 0) + t.amount;
      }
    });

    return Object.entries(groupedData)
      .map(([date, amount]) => ({
        date,
        amount,
      }))
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  };

  const fetchTransactionData = async () => {
    try {
      const dateRange = {
        daily: 30,
        monthly: 365,
        yearly: 365 * 5,
      };

      const transactions = await getTransactionsByFilter({
        merchant_id: merchantId ?? "",
        create_from: subDays(new Date(), dateRange[timeFrame]),
        create_to: new Date(),
      }).unwrap();

      const totalAmount = transactions.reduce(
        (sum: number, t: TransactionResult) => sum + t.amount,
        0,
      );

      const stats = {
        totalAmount,
        latePayments:
          instalmentPayments?.filter(
            (p: IInstalmentPayment) =>
              new Date(p.due_date) < new Date() && p.status !== "PAID",
          ).length || 0,
        completedPayments:
          instalmentPayments?.filter(
            (p: IInstalmentPayment) => p.status === "PAID",
          ).length || 0,
        averageTransactionValue: transactions.length
          ? totalAmount / transactions.length
          : 0,
        timeFrameData: processTimeFrameData(transactions),
      };

      setTransactionStats(stats);
    } catch (error) {
      console.error("Error fetching transaction data:", error);
    }
  };

  // Refetch when timeFrame changes
  useEffect(() => {
    if (merchantId) {
      fetchTransactionData();
    }
  }, [merchantId, timeFrame]);

  return (
    <div className="w-full flex-col bg-gray-100 p-6">
      {/* ===== Welcome Section with Profile Picture ===== */}
      <Card className="mb-6">
        <div className="flex items-center gap-6">
          {profilePictureDisplay ? (
            <Avatar
              size={80}
              src={profilePictureDisplay}
              alt={profile?.name}
              className="h-20 w-20 rounded-full object-cover"
            />
          ) : (
            <Avatar size={80} icon={<UserOutlined />} />
          )}
          <div>
            <Text className="text-2xl font-bold">
              Welcome back, {profile?.name}
            </Text>
            <Text className="block text-gray-500">
              Here's your business overview
            </Text>
          </div>
        </div>
      </Card>

      {/* ===== Stats Cards ===== */}
      <div className="mb-6 grid grid-cols-4 gap-4">
        <Card>
          <Statistic
            title="Total Revenue (All Time)"
            value={formatCurrency(transactionStats.totalAmount)}
            prefix={<WalletOutlined />}
            precision={2}
          />
        </Card>
        <Card>
          <Statistic
            title="Completed Payments"
            value={transactionStats.completedPayments}
            prefix={<CheckCircleOutlined className="text-green-500" />}
          />
        </Card>
        <Card>
          <Statistic
            title="Late Payments"
            value={transactionStats.latePayments}
            prefix={<WarningOutlined className="text-red-500" />}
          />
        </Card>
        <Card>
          <Statistic
            title="Average Transaction Value"
            value={formatCurrency(transactionStats.averageTransactionValue)}
            prefix={<SyncOutlined className="text-blue-500" />}
            precision={2}
          />
        </Card>
      </div>

      {/* ===== Transaction Chart ===== */}
      <Card
        title="Transaction Overview"
        className="mb-6"
        extra={
          <Select
            value={timeFrame}
            onChange={setTimeFrame}
            options={[
              { label: "Daily", value: "daily" },
              { label: "Monthly", value: "monthly" },
              { label: "Yearly", value: "yearly" },
            ]}
            className="w-32"
          />
        }
      >
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={transactionStats.timeFrameData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip
                formatter={(value) => [
                  `${formatCurrency(value as number)}`,
                  "Amount",
                ]}
              />
              <Area
                type="monotone"
                dataKey="amount"
                stroke="#3b82f6"
                fill="#3b82f6"
                fillOpacity={0.2}
                name="Transaction Amount"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </Card>

      {/* ===== Recent Transactions ===== */}
      <Card>
        <div className="mb-4 flex items-center justify-between">
          <h1 className="text-lg font-bold">Recent Transactions</h1>
          <Button
            type="link"
            onClick={() => navigate("/financial-management/transactions")}
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
};

export default HomeScreen;

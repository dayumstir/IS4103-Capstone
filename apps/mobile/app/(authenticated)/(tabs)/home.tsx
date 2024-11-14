// apps/mobile/app/(authenticated)/(tabs)/home/index.tsx

import React, { useEffect, useState } from "react";
import {
  ScrollView,
  Text,
  TouchableOpacity,
  View,
  RefreshControl,
  Image,
} from "react-native";
import { addDays, addMonths, addWeeks, addYears, format } from "date-fns";
import { useRouter } from "expo-router";
import { formatCurrency } from "../../../utils/formatCurrency";
import { useGetProfileQuery } from "../../../redux/services/customerService";
import { useDispatch, useSelector } from "react-redux";
import { setProfile } from "../../../redux/features/customerSlice";
import { Ionicons } from "@expo/vector-icons";
import { useGetCustomerOutstandingInstalmentPaymentsQuery } from "../../../redux/services/instalmentPaymentService";
import { ActivityIndicator } from "@ant-design/react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useGetCustomerTransactionsQuery } from "../../../redux/services/transactionService";
import { Buffer } from "buffer";
import { BarChart } from "react-native-gifted-charts";
import { Picker } from "@ant-design/react-native";

// Import the notification API
import { useGetCustomerNotificationsQuery } from "../../../redux/services/notificationService";

const roundToNiceNumber = (value: number): number => {
  const magnitude = Math.pow(10, Math.floor(Math.log10(value)));
  const normalized = value / magnitude;

  if (normalized <= 2)
    return Math.ceil(value / (magnitude / 2)) * (magnitude / 2);
  if (normalized <= 5) return Math.ceil(value / magnitude) * magnitude;
  return Math.ceil(value / (magnitude * 2)) * (magnitude * 2);
};

export default function HomePage() {
  const dispatch = useDispatch();
  const router = useRouter();
  const [refreshing, setRefreshing] = useState(false);
  const [timeFrame, setTimeFrame] = useState<"week" | "month" | "year">("month");
  const [timeFrameVisible, setTimeFrameVisible] = useState(false);

  // Fetch the profile using the API call
  const {
    data: profile,
    isLoading,
    refetch: refetchProfile,
  } = useGetProfileQuery();

  // Update Redux store when profile data is fetched
  useEffect(() => {
    if (profile && !isLoading) {
      dispatch(setProfile(profile));
    }
  }, [profile, isLoading, dispatch]);

  const {
    data: outstandingInstalmentPayments,
    isLoading: isInstalmentPaymentsLoading,
    refetch: refetchInstalmentPayments,
  } = useGetCustomerOutstandingInstalmentPaymentsQuery();

  const {
    data: transactions,
    isLoading: isTransactionsLoading,
    refetch: refetchTransactions,
  } = useGetCustomerTransactionsQuery({});

  // Fetch customer notifications
  const {
    data: notifications,
    isLoading: isNotificationsLoading,
    refetch: refetchNotifications,
  } = useGetCustomerNotificationsQuery("");

  // Count unread notifications
  const unreadNotificationsCount = notifications
    ? notifications.filter((notification) => !notification.is_read).length
    : 0;

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      await Promise.all([
        refetchProfile(),
        refetchInstalmentPayments(),
        refetchTransactions(),
        refetchNotifications(),
      ]);
    } catch (error) {
      console.error("Error refreshing data:", error);
    } finally {
      setRefreshing(false);
    }
  };

  const getTotalOutstandingPayments = () => {
    let total = 0;
    outstandingInstalmentPayments?.forEach((payment) => {
      total += payment.amount_due;
    });
    return total;
  };

  const getProgressValue = () => {
    if (getTotalOutstandingPayments() === 0) {
      return 1;
    }

    return Math.min(
      1,
      (profile?.wallet_balance ?? 0) / getTotalOutstandingPayments(),
    );
  };

  return (
    <ScrollView
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      <View className="m-4 flex-row items-center justify-between">
        <Text className="text-4xl font-bold">Home</Text>
        <TouchableOpacity
          className="relative p-2"
          onPress={() => router.push("/notifications")}
        >
          <Ionicons name="notifications-outline" size={28} color="black" />
          {unreadNotificationsCount > 0 && (
            <View
              className="absolute -right-1 -top-1 h-5 w-5 items-center justify-center rounded-full bg-red-500"
            >
              <Text className="text-xs font-bold text-white">
                {unreadNotificationsCount}
              </Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      {/* ===== Wallet Overview ===== */}
      <View className="mx-4 flex-1 rounded-xl bg-blue-500 p-8">
        <View className="mb-4 flex-row items-center justify-between">
          <View className="flex-row items-center">
            <View className="mr-4 h-12 w-12 items-center justify-center rounded-full bg-white">
              {profile?.profile_picture ? (
                <Image
                  source={{
                    uri: `data:image/png;base64,${Buffer.from(
                      profile.profile_picture,
                    ).toString("base64")}`,
                  }}
                  style={{ width: 48, height: 48, borderRadius: 24 }}
                />
              ) : (
                <Ionicons name="person" size={24} color="black" />
              )}
            </View>
            <View className="flex-1">
              <Text
                className="text-2xl font-bold text-white"
                numberOfLines={1}
                ellipsizeMode="tail"
              >
                Hello, {profile?.name || "User"}
              </Text>
              <Text className="text-sm text-white">
                Here's your wallet overview
              </Text>
            </View>
          </View>
        </View>
        <View>
          <View className="mb-2 flex-row items-center justify-between">
            <Text className="font-semibold text-white">Wallet Balance</Text>
            <Text className="text-lg font-bold text-white">
              {formatCurrency(profile?.wallet_balance ?? 0)}
            </Text>
          </View>
          <View className="mb-2 flex-row items-center justify-between">
            <Text className="font-semibold text-white">
              Outstanding Payments
            </Text>
            <Text className="text-lg font-bold text-white">
              {formatCurrency(getTotalOutstandingPayments())}
            </Text>
          </View>
          <View className="mb-2 flex-row items-center justify-between">
            <Text className="font-semibold text-white">
              Total Savings
            </Text>
            <Text className="text-lg font-bold text-white">
              {formatCurrency(profile?.savings ?? 0)}
            </Text>
          </View>
          <View className="mt-4 h-2 w-full rounded-full bg-blue-700">
            <View
              className="h-full rounded-full bg-white"
              style={{
                width: `${getProgressValue() * 100}%`,
              }}
            />
          </View>
          <Text className="mt-2 text-center font-medium text-white">
            {`${(getProgressValue() * 100).toFixed(1)}% of payments covered`}
          </Text>
        </View>
      </View>

      {/* ===== Scan to Pay ===== */}
      <LinearGradient
        colors={["#3b82f6", "#9333ea"]}
        start={{ x: 0, y: 0.5 }}
        end={{ x: 1, y: 0.5 }}
        style={{
          padding: 8,
          borderRadius: 12,
          marginHorizontal: 16,
          marginTop: 16,
        }}
      >
        <TouchableOpacity
          onPress={() => router.push("/scan")}
          className="rounded-xl bg-white"
        >
          <View className="flex-row items-center justify-center gap-4 rounded-lg bg-white p-4">
            <Ionicons name="qr-code" size={28} color="#3b82f6" />
            <Text className="text-xl font-bold text-blue-600">Scan to Pay</Text>
          </View>
        </TouchableOpacity>
      </LinearGradient>

      {/* ===== Transaction History Graph ===== */}
      <View className="m-4">
        <View className="mb-4 flex-row items-center justify-between">
          <Text className="text-2xl font-bold">Transaction History</Text>
          <TouchableOpacity
            className="flex-row items-center gap-2 rounded-full bg-blue-300 px-4 py-2"
            onPress={() => setTimeFrameVisible(true)}
          >
            <Text className="text-sm font-semibold text-gray-700">
              {timeFrame === "week"
                ? "Weekly"
                : timeFrame === "month"
                  ? "Monthly"
                  : "Yearly"}
            </Text>
            <Ionicons name="chevron-down" size={16} color="#374151" />
          </TouchableOpacity>
          <Picker
            data={[
              { value: "week", label: "Weekly" },
              { value: "month", label: "Monthly" },
              { value: "year", label: "Yearly" },
            ]}
            cols={1}
            onChange={(val) => {
              setTimeFrame(val[0] as "week" | "month" | "year");
              setTimeFrameVisible(false);
            }}
            value={[timeFrame]}
            okText="Confirm"
            dismissText="Cancel"
            visible={timeFrameVisible}
            onDismiss={() => setTimeFrameVisible(false)}
          />
        </View>

        {isTransactionsLoading ? (
          <ActivityIndicator />
        ) : transactions && transactions.length > 0 ? (
          <View className="rounded-xl bg-white p-4">
            {/* ===== Generate the bar chart data ===== */}
            {(() => {
              const dates = transactions.map(
                (t) => new Date(t.date_of_transaction),
              );
              const minDate = new Date(
                transactions[transactions.length - 1].date_of_transaction,
              ).setDate(1);
              const maxDate = new Date(transactions[0].date_of_transaction);

              let periods: Date[] = [];
              let currentDate = new Date(minDate);

              while (currentDate <= maxDate) {
                periods.push(new Date(currentDate));
                switch (timeFrame) {
                  case "week":
                    currentDate = addWeeks(currentDate, 1);
                    break;
                  case "month":
                    currentDate = addMonths(currentDate, 1);
                    break;
                  case "year":
                    currentDate = addYears(currentDate, 1);
                    break;
                }
              }

              const barData = periods.map((period) => {
                const periodTransactions = transactions.filter((t) => {
                  const transactionDate = new Date(t.date_of_transaction);
                  switch (timeFrame) {
                    case "week":
                      const startOfPeriod = period;
                      const endOfPeriod = addWeeks(period, 1);
                      return (
                        transactionDate >= startOfPeriod &&
                        transactionDate < endOfPeriod
                      );
                    case "month":
                      return (
                        transactionDate.getMonth() === period.getMonth() &&
                        transactionDate.getFullYear() === period.getFullYear()
                      );
                    case "year":
                      return (
                        transactionDate.getFullYear() === period.getFullYear()
                      );
                  }
                });

                const totalAmount = periodTransactions.reduce(
                  (sum, t) => sum + t.amount,
                  0,
                );

                let label = "";
                switch (timeFrame) {
                  case "week":
                    label = format(period, "d MMM");
                    break;
                  case "month":
                    label =
                      period.getFullYear() === new Date().getFullYear()
                        ? format(period, "MMM")
                        : format(period, "MMM''yy");
                    break;
                  case "year":
                    label = format(period, "yyyy");
                    break;
                }

                return {
                  value: totalAmount,
                  label,
                  frontColor: "#3b82f6",
                };
              });

              const maxAmount = roundToNiceNumber(
                Math.max(...barData.map((item) => item.value), 1),
              );

              // Calculate average spending
              const totalSpending = barData.reduce(
                (sum, item) => sum + item.value,
                0,
              );
              const averageSpending = totalSpending / barData.length;

              // Get the date range text
              let dateRangeText = "";
              switch (timeFrame) {
                case "week":
                  dateRangeText = `${format(periods[periods.length - 1], "d MMM")} - ${format(addDays(periods[periods.length - 1], 6), "d MMM yyyy")}`;
                  break;
                case "month":
                  dateRangeText = format(
                    periods[periods.length - 1],
                    "MMMM yyyy",
                  );
                  break;
                case "year":
                  dateRangeText = format(periods[0], "yyyy");
                  break;
              }

              return (
                <>
                  <View className="mb-4 flex-row justify-between">
                    <View>
                      <Text className="text-base font-semibold text-gray-600">
                        {dateRangeText}
                      </Text>
                      <Text className="text-2xl font-bold text-blue-600">
                        {formatCurrency(totalSpending)}
                      </Text>
                    </View>
                    <View>
                      <Text className="text-base font-semibold text-gray-600">
                        Average per {timeFrame}
                      </Text>
                      <Text className="text-2xl font-bold text-blue-600">
                        {formatCurrency(averageSpending)}
                      </Text>
                    </View>
                  </View>
                  <BarChart
                    data={barData}
                    width={280}
                    height={200}
                    barWidth={20}
                    spacing={timeFrame === "month" ? 8 : 20}
                    barBorderTopLeftRadius={4}
                    barBorderTopRightRadius={4}
                    xAxisThickness={1}
                    yAxisThickness={1}
                    yAxisTextStyle={{ color: "#666", fontSize: 12 }}
                    xAxisLabelTextStyle={{
                      color: "#666",
                      fontSize: 10,
                    }}
                    noOfSections={4}
                    maxValue={maxAmount}
                    labelWidth={0}
                    renderTooltip={(item: any, index: number) => {
                      return (
                        <View
                          style={{
                            paddingHorizontal: 6,
                            paddingVertical: 4,
                            backgroundColor: "#1e40af",
                            borderRadius: 4,
                          }}
                        >
                          <Text className="font-semibold text-white">
                            {formatCurrency(item.value)}
                          </Text>
                        </View>
                      );
                    }}
                  />
                </>
              );
            })()}
          </View>
        ) : (
          <Text className="text-center text-gray-500">No transactions yet</Text>
        )}
      </View>
    </ScrollView>
  );
}

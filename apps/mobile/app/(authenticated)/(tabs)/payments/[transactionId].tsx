import { View, Text, ScrollView, RefreshControl } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useGetTransactionByIdQuery } from "../../../../redux/services/transactionService";
import { formatCurrency } from "../../../../utils/formatCurrency";
import { format } from "date-fns";
import { ActivityIndicator } from "@ant-design/react-native";
import { useState } from "react";

export default function TransactionDetails() {
  const { transactionId } = useLocalSearchParams<{ transactionId: string }>();
  const router = useRouter();
  const {
    data: transaction,
    isLoading,
    error,
    refetch,
  } = useGetTransactionByIdQuery(transactionId);

  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = () => {
    setRefreshing(true);
    refetch().then(() => setRefreshing(false));
  };

  const getProgressValue = () => {
    if (!transaction?.instalment_plan) return 1;
    const paidInstalments = transaction.instalment_payments.filter(
      (p) => p.status === "PAID",
    ).length;
    return paidInstalments / transaction.instalment_plan.number_of_instalments;
  };

  if (isLoading) return <ActivityIndicator size="large" />;
  if (error) return <Text>Error: Please try again later</Text>;
  if (!transaction) return <Text>No transaction found</Text>;

  return (
    <ScrollView
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      <View className="m-4 flex-1">
        {/* ===== Progress Bar ===== */}
        <View className="rounded-xl bg-blue-500 p-8">
          <Text className="text-3xl font-bold text-white">
            {formatCurrency(transaction.amount)}
          </Text>
          <Text className="mt-2 text-white">
            {transaction.instalment_plan.number_of_instalments} Instalment
            Payments
          </Text>
          <View className="mt-4 h-2 w-full rounded-full bg-blue-700">
            <View
              className="h-full rounded-full bg-white"
              style={{
                width: `${getProgressValue() * 100}%`,
              }}
            />
          </View>
          <View className="mt-2 flex-row justify-between">
            <Text className="text-white">
              {transaction.status === "FULLY_PAID"
                ? "Fully Paid"
                : "In Progress"}
            </Text>
            <Text className="text-white">
              {(getProgressValue() * 100).toFixed(0)}% Complete
            </Text>
          </View>
        </View>

        {/* ===== Transaction Details ===== */}
        <View className="my-4 rounded-xl bg-white p-8">
          <Text className="mb-4 text-xl font-bold">Transaction Details</Text>
          <View className="flex-row flex-wrap">
            <View className="mb-4 w-1/2 pr-2">
              <View className="flex-row items-center">
                <Ionicons
                  name="wallet-outline"
                  size={20}
                  color="#3b82f6"
                  className="mr-4"
                />
                <View>
                  <Text className="text-sm text-gray-500">Amount</Text>
                  <Text className="font-medium">
                    {formatCurrency(transaction.amount)}
                  </Text>
                </View>
              </View>
            </View>
            <View className="mb-4 w-1/2 pl-2">
              <View className="flex-row items-center">
                <Ionicons
                  name="storefront-outline"
                  size={20}
                  color="#3b82f6"
                  className="mr-4"
                />
                <View>
                  <Text className="text-sm text-gray-500">Merchant</Text>
                  <Text className="font-medium">
                    {transaction.merchant.name.length > 14
                      ? `${transaction.merchant.name.slice(0, 14)}...`
                      : transaction.merchant.name}
                  </Text>
                </View>
              </View>
            </View>
            <View className="mb-4 w-1/2 pr-2">
              <View className="flex-row items-center">
                <Ionicons
                  name="calendar-outline"
                  size={20}
                  color="#3b82f6"
                  className="mr-4"
                />
                <View>
                  <Text className="text-sm text-gray-500">Date</Text>
                  <Text className="font-medium">
                    {format(
                      new Date(transaction.date_of_transaction),
                      "dd MMM yyyy",
                    )}
                  </Text>
                </View>
              </View>
            </View>
            <View className="mb-4 w-1/2 pl-2">
              <View className="flex-row items-center">
                <Ionicons
                  name="trending-up-outline"
                  size={20}
                  color="#3b82f6"
                  className="mr-4"
                />
                <View>
                  <Text className="text-sm text-gray-500">Cashback</Text>
                  <Text className="font-medium">
                    {transaction.cashback_percentage}%
                  </Text>
                </View>
              </View>
            </View>
            <View className="w-1/2 pr-2">
              <View className="flex-row items-center">
                <Ionicons
                  name="flag-outline"
                  size={20}
                  color="#3b82f6"
                  className="mr-4"
                />
                <View>
                  <Text className="text-sm text-gray-500">Status</Text>
                  <Text className="font-medium">
                    {transaction.status === "FULLY_PAID"
                      ? "Fully Paid"
                      : "In Progress"}
                  </Text>
                </View>
              </View>
            </View>
            <View className="w-1/2 pl-2">
              <View className="flex-row items-center">
                <Ionicons
                  name="time-outline"
                  size={20}
                  color="#3b82f6"
                  className="mr-4"
                />
                <View>
                  <Text className="text-sm text-gray-500">Fully Paid Date</Text>
                  <Text className="font-medium">
                    {transaction.fully_paid_date
                      ? format(
                          new Date(transaction.fully_paid_date),
                          "dd MMM yyyy",
                        )
                      : "N/A"}
                  </Text>
                </View>
              </View>
            </View>
          </View>
        </View>

        {/* ===== Instalment Payments ===== */}
        <View className="rounded-xl bg-white p-8">
          <Text className="mb-4 text-xl font-bold">Instalment Payments</Text>
          {transaction.instalment_payments.map((payment, index) => (
            <View
              key={payment.instalment_payment_id}
              className={`flex-row items-center justify-between border-t border-gray-200 ${index === transaction.instalment_payments.length - 1 ? "pt-2" : "py-2"}`}
            >
              <View className="flex-row items-center">
                <View className="mr-4 h-10 w-10 items-center justify-center rounded-full bg-blue-100">
                  <Text className="font-semibold text-blue-600">
                    {index + 1}
                  </Text>
                </View>
                <View>
                  <Text className="font-medium">
                    Instalment {payment.instalment_number}
                  </Text>
                  <Text className="text-xs text-gray-500">
                    Due: {format(new Date(payment.due_date), "dd MMM yyyy")}
                  </Text>
                </View>
              </View>
              <View className="items-end">
                <Text className="font-medium">
                  {formatCurrency(payment.amount_due)}
                </Text>
                <View
                  className={`mt-1 rounded px-2 py-1 ${payment.status === "PAID" ? "bg-green-100" : "bg-yellow-100"}`}
                >
                  <Text
                    className={
                      payment.status === "PAID"
                        ? "text-green-800"
                        : "text-yellow-800"
                    }
                  >
                    {payment.status}
                  </Text>
                </View>
              </View>
            </View>
          ))}
        </View>

        {/* ===== Instalment Plan Details ===== */}
        {transaction.instalment_plan && (
          <View className="mt-4 rounded-xl bg-white p-8">
            <Text className="mb-4 text-xl font-bold">Instalment Plan</Text>
            <View className="mb-2 flex-row items-center justify-between">
              <Text className="text-gray-500">Plan Name</Text>
              <Text className="font-medium">
                {transaction.instalment_plan.name}
              </Text>
            </View>
            <View className="mb-2 flex-row items-center justify-between">
              <Text className="text-gray-500">Number of Instalments</Text>
              <Text className="font-medium">
                {transaction.instalment_plan.number_of_instalments}
              </Text>
            </View>
            <View className="mb-2 flex-row items-center justify-between">
              <Text className="text-gray-500">Time Period</Text>
              <Text className="font-medium">
                {transaction.instalment_plan.time_period} weeks
              </Text>
            </View>
            <View className="mb-2 flex-row items-center justify-between">
              <Text className="text-gray-500">Payment Frequency</Text>
              <Text className="font-medium">
                Every{" "}
                {(
                  (transaction.instalment_plan.time_period * 7) /
                  transaction.instalment_plan.number_of_instalments
                ).toFixed(1)}{" "}
                days
              </Text>
            </View>
            <View className="flex-row items-center justify-between">
              <Text className="text-gray-500">Interest Rate</Text>
              <Text className="font-medium">
                {transaction.instalment_plan.interest_rate}%
              </Text>
            </View>
          </View>
        )}
      </View>
    </ScrollView>
  );
}

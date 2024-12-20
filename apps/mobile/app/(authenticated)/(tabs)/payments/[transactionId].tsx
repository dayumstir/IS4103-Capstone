import {
  View,
  Text,
  ScrollView,
  RefreshControl,
  ActivityIndicator,
  TouchableOpacity,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useGetTransactionByIdQuery } from "../../../../redux/services/transactionService";
import { formatCurrency } from "../../../../utils/formatCurrency";
import { format } from "date-fns";
import { Button } from "@ant-design/react-native";
import { useState, useCallback } from "react";
import { useFocusEffect } from "@react-navigation/native";

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

  useFocusEffect(
    useCallback(() => {
      // Refetch the transaction data whenever the screen comes into focus
      refetch();
    }, [refetch])
  );

  const getProgressValue = () => {
    if (!transaction?.instalment_plan) return 1;
    const paidInstalments = transaction.instalment_payments.filter(
      (p) => p.status === "PAID",
    ).length;
    return paidInstalments / transaction.instalment_plan.number_of_instalments;
  };

  if (isLoading)
    return (
      <View className="flex-1 items-center justify-center">
        <ActivityIndicator size="large" />
      </View>
    );
  if (error)
    return (
      <View className="flex-1 items-center justify-center">
        <Text>Error: Please try again later</Text>
      </View>
    );
  if (!transaction)
    return (
      <View className="flex-1 items-center justify-center">
        <Text>No transaction found</Text>
      </View>
    );

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
            <View className="mb-4 w-2/5 pr-2">
              <View className="flex-row items-center">
                <Ionicons
                  name="wallet-outline"
                  size={20}
                  color="#3b82f6"
                  style={{ marginRight: 8 }}
                />
                <View>
                  <Text className="text-sm text-gray-500">Amount</Text>
                  <Text className="font-medium">
                    {formatCurrency(transaction.amount)}
                  </Text>
                </View>
              </View>
            </View>
            <View className="mb-4 w-3/5 pl-2">
              <View className="flex-row items-center">
                <Ionicons
                  name="storefront-outline"
                  size={20}
                  color="#3b82f6"
                  style={{ marginRight: 8 }}
                />
                <View className="flex-1">
                  <Text className="text-sm text-gray-500">Merchant</Text>
                  <Text
                    className="font-medium"
                    numberOfLines={1}
                    ellipsizeMode="tail"
                  >
                    {transaction.merchant.name}
                  </Text>
                </View>
              </View>
            </View>
            <View className="mb-4 w-2/5 pr-2">
              <View className="flex-row items-center">
                <Ionicons
                  name="trending-up-outline"
                  size={20}
                  color="#3b82f6"
                  style={{ marginRight: 8 }}
                />
                <View>
                  <Text className="text-sm text-gray-500">Cashback</Text>
                  <Text className="font-medium">
                    {transaction.cashback_percentage}%
                  </Text>
                </View>
              </View>
            </View>
            <View className="mb-4 w-3/5 pl-2">
              <View className="flex-row items-center">
                <Ionicons
                  name="calendar-outline"
                  size={20}
                  color="#3b82f6"
                  style={{ marginRight: 8 }}
                />
                <View>
                  <Text className="text-sm text-gray-500">Date</Text>
                  <Text className="font-medium">
                    {format(
                      new Date(transaction.date_of_transaction),
                      "d MMM yyyy, h:mm a",
                    )}
                  </Text>
                </View>
              </View>
            </View>
            <View className="w-2/5 pr-2">
              <View className="flex-row items-center">
                <Ionicons
                  name="flag-outline"
                  size={20}
                  color="#3b82f6"
                  style={{ marginRight: 8 }}
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
            <View className="w-3/5 pl-2">
              <View className="flex-row items-center">
                <Ionicons
                  name="time-outline"
                  size={20}
                  color="#3b82f6"
                  style={{ marginRight: 8 }}
                />
                <View>
                  <Text className="text-sm text-gray-500">Fully Paid Date</Text>
                  <Text className="font-medium">
                    {transaction.fully_paid_date
                      ? format(
                          new Date(transaction.fully_paid_date),
                          "d MMM yyyy, h:mm a",
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
          {transaction.instalment_payments.map((payment, index) => {
            const isPaid = payment.status === "PAID";
            const rowClassName = `flex-row items-center justify-between border-t border-gray-200 ${
              index === transaction.instalment_payments.length - 1
                ? "pt-2"
                : "py-2"
            }`;

            return (
              <TouchableOpacity
                key={payment.instalment_payment_id}
                onPress={() =>
                  router.push(
                    `/payments/instalments/${payment.instalment_payment_id}`,
                  )
                }
                className={rowClassName}
              >
                {/* ===== Content of Each Instalment ===== */}
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
                      Due: {format(new Date(payment.due_date), "d MMM yyyy")}
                    </Text>
                  </View>
                </View>
                <View className="items-end">
                  <Text className="font-medium">
                    {formatCurrency(payment.amount_due)}
                  </Text>
                  <View
                    className={`mt-1 rounded px-2 py-1 ${
                      isPaid ? "bg-green-100" : "bg-yellow-100"
                    }`}
                  >
                    <Text
                      className={`text-xs font-medium ${
                        isPaid ? "text-green-600" : "text-yellow-600"
                      }`}
                    >
                      {payment.status}
                    </Text>
                  </View>
                </View>
              </TouchableOpacity>
            );
          })}
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

        {/* ===== Rating Details or Add Rating Button ===== */}
        {transaction.rating ? (
          // Show Rating Details
          <View className="my-4 rounded-xl bg-white p-8">
            <Text className="mb-4 text-xl font-bold">Your Rating</Text>
            <View className="mb-2">
              <Text className="text-gray-500">Title</Text>
              <Text className="font-medium">{transaction.rating.title}</Text>
            </View>
            <View className="mb-2">
              <Text className="text-gray-500">Description</Text>
              <Text className="font-medium">{transaction.rating.description}</Text>
            </View>
            <View className="mb-2">
              <Text className="text-gray-500">Rating</Text>
              <Text className="font-medium">{transaction.rating.rating} / 5</Text>
            </View>
          </View>
        ) : (
          // Show Add Rating Button
          <View className="my-4">
            <Button
              type="primary"
              onPress={() =>
                router.push({
                  pathname: "/payments/rating",
                  params: { transactionId },
                })
              }
            >
              <Text className="font-semibold text-white">Add Rating</Text>
            </Button>
          </View>
        )}

        {/* ===== Raise Issue Button ===== */}
        <View className="mt-4">
          <Button
            type="warning"
            onPress={() => {
              router.replace({
                pathname: "/account/issue/newIssue",
                params: {
                  transaction_id: transaction.transaction_id,
                  merchant_id: transaction.merchant.merchant_id,
                },
              });
            }}
          >
            <Text className="font-semibold text-white">Raise an Issue</Text>
          </Button>
        </View>
      </View>
    </ScrollView>
  );
}

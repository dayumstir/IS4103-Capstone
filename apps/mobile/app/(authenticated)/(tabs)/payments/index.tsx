// payments/index.tsx
import React, { useState, useEffect } from "react";
import {
  ScrollView,
  View,
  Text,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
} from "react-native";
import { Button } from "@ant-design/react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { useIsFocused } from '@react-navigation/native';

import { useGetCustomerTransactionsQuery } from "../../../../redux/services/transactionService";
import { useGetCustomerOutstandingInstalmentPaymentsQuery } from "../../../../redux/services/instalmentPaymentService";
import { useGetProfileQuery } from "../../../../redux/services/customerService";
import { formatCurrency } from "../../../../utils/formatCurrency";
import { format } from "date-fns";

import { useSelector } from "react-redux";
import { RootState } from "../../../../redux/store";

export default function PaymentsPage() {
  const [isInstalmentsExpanded, setIsInstalmentsExpanded] = useState(true);
  const router = useRouter();
  const isFocused = useIsFocused();

  // Fetch profile data
  const {
    data: profile,
    isLoading: isProfileLoading,
    refetch: refetchProfile,
  } = useGetProfileQuery();

  // Fetch transactions
  const {
    data: transactions,
    isLoading: isTransactionsLoading,
    refetch: refetchTransactions,
  } = useGetCustomerTransactionsQuery("");

  // Fetch outstanding instalment payments
  const {
    data: outstandingInstalmentPayments,
    isLoading: isInstalmentPaymentsLoading,
    refetch: refetchInstalmentPayments,
  } = useGetCustomerOutstandingInstalmentPaymentsQuery();

  // Calculate total outstanding payments
  const totalOutstanding =
    outstandingInstalmentPayments?.reduce(
      (sum, payment) => sum + payment.amount_due,
      0,
    ) ?? 0;

  useEffect(() => {
    if (isFocused) {
      refetchProfile();
      refetchTransactions();
      refetchInstalmentPayments();
    }
  }, [isFocused]);

  const balance = profile?.wallet_balance ?? 0;

  // Refreshing state
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = () => {
    setRefreshing(true);
    Promise.all([refetchTransactions(), refetchInstalmentPayments()])
      .then(() => setRefreshing(false))
      .catch((error) => {
        console.error("Error refreshing data:", error);
        setRefreshing(false);
      });
  };

  const handlePayAll = () => {};

  return (
    <ScrollView
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      <View className="m-4 flex-row items-center justify-between">
        <Text className="text-4xl font-bold">Payments</Text>
        <TouchableOpacity className="p-2">
          <Ionicons name="notifications-outline" size={24} color="black" />
        </TouchableOpacity>
      </View>

      {/* ===== Wallet Balance & Outstanding Payments ===== */}
      <LinearGradient
        colors={["#3b82f6", "#9333ea"]}
        start={{ x: 0, y: 0.5 }}
        end={{ x: 1, y: 0.5 }}
        style={{
          borderRadius: 12,
          padding: 24,
          marginHorizontal: 16,
        }}
      >
        <View className="mb-4 flex-row items-center justify-between">
          <View>
            <Text className="text-sm font-semibold text-white">
              Wallet Balance
            </Text>
            <Text className="text-3xl font-bold text-white">
              {formatCurrency(balance)}
            </Text>
          </View>
          <TouchableOpacity
            className="rounded-md bg-white px-4 py-2"
            onPress={() => router.push("/wallet")}
          >
            <Text className="text-sm font-semibold text-blue-500">Top Up</Text>
          </TouchableOpacity>
        </View>
        <View className="flex-row items-center justify-between">
          <View>
            <Text className="text-sm font-semibold text-white">
              Outstanding Payments
            </Text>
            <Text className="text-2xl font-bold text-white">
              {formatCurrency(totalOutstanding)}
            </Text>
          </View>
          {/* {totalOutstanding > 0 && (
            <TouchableOpacity
              className="rounded-md bg-white px-4 py-2"
              onPress={handlePayAll}
            >
              <Text className="text-sm font-semibold text-blue-500">
                Pay All
              </Text>
            </TouchableOpacity>
          )} */}
        </View>
      </LinearGradient>

      {/* ===== Outstanding Payments ===== */}
      <View className="m-4 rounded-xl bg-white p-8">
        <View className="mb-2 flex-row items-center justify-between">
          <Text className="text-xl font-bold">Outstanding Payments</Text>
          <TouchableOpacity
            className="p-2"
            onPress={() => setIsInstalmentsExpanded(!isInstalmentsExpanded)}
          >
            <Ionicons
              name={isInstalmentsExpanded ? "chevron-up" : "chevron-down"}
              size={24}
              color="black"
            />
          </TouchableOpacity>
        </View>
        {isInstalmentsExpanded && (
          <>
            {isInstalmentPaymentsLoading ? (
              <View className="items-center justify-center py-4">
                <ActivityIndicator size="large" />
              </View>
            ) : outstandingInstalmentPayments &&
              outstandingInstalmentPayments.length > 0 ? (
              <View>
                {outstandingInstalmentPayments.map((payment, index) => (
                  <View
                    key={payment.instalment_payment_id}
                    className={`flex-row items-center justify-between border-t border-gray-200 ${
                      index === outstandingInstalmentPayments.length - 1
                        ? "pt-4"
                        : "py-4"
                    }`}
                  >
                    <View className="mr-4 flex-1">
                      <Text
                        className="text-base font-medium"
                        numberOfLines={1}
                        ellipsizeMode="tail"
                      >
                        {payment.transaction.merchant.name}
                      </Text>
                      <Text
                        className={`text-sm ${
                          payment.due_date < new Date()
                            ? "font-bold text-red-500"
                            : "text-gray-500"
                        }`}
                      >
                        {payment.due_date < new Date() ? "Overdue: " : "Due: "}
                        {format(payment.due_date, "dd MMM yyyy")}
                      </Text>
                    </View>
                    <View className="flex-row items-center gap-4">
                      <Text className="text-base font-semibold">
                        {formatCurrency(payment.amount_due)}
                      </Text>
                      <TouchableOpacity 
                        className="rounded-md border border-blue-500 bg-white px-4 py-2"
                        onPress={() => router.push(`/payments/instalments/${payment.instalment_payment_id}`)}
                      >
                        <Text className="text-sm font-semibold text-blue-500">
                          Pay
                        </Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                ))}
              </View>
            ) : (
              <View className="items-center gap-2 px-8 py-4">
                <Text className="text-center font-medium leading-6 text-gray-500">
                  Hooray, you have paid all your outstanding instalment
                  payments!
                </Text>
                <Text className="text-center text-4xl"> 🎉</Text>
              </View>
            )}
          </>
        )}
      </View>

      {/* ===== Recent Transactions ===== */}
      <View className="mx-4 mb-4 rounded-xl bg-white p-8">
        <Text className="mb-2 text-xl font-bold">Recent Transactions</Text>
        {isTransactionsLoading ? (
          <View className="items-center justify-center py-4">
            <ActivityIndicator size="large" />
          </View>
        ) : transactions && transactions.length > 0 ? (
          <>
            {transactions.slice(0, 3).map((transaction) => (
              <TouchableOpacity
                key={transaction.transaction_id}
                onPress={() => {
                  router.push(`/payments/${transaction.transaction_id}`);
                }}
              >
                <View className="flex-row items-center justify-between border-t border-gray-200 py-4">
                  <View className="flex-row items-center gap-4">
                    <View className="h-10 w-10 items-center justify-center rounded-full bg-blue-100">
                      {/* TODO: Replace with merchant profile picture */}
                      <Text className="text-center font-bold text-blue-500">
                        {transaction.merchant.name.slice(0, 1).toUpperCase()}
                      </Text>
                    </View>
                    <View className="mr-4 flex-1">
                      <Text
                        className="text-base font-medium"
                        numberOfLines={1}
                        ellipsizeMode="tail"
                      >
                        {transaction.merchant.name}
                      </Text>
                      <Text className="text-sm text-gray-500">
                        {format(transaction.date_of_transaction, "dd MMM yyyy")}
                      </Text>
                    </View>
                    <Text className="text-base font-semibold text-red-600">
                      -{formatCurrency(transaction.amount)}
                    </Text>
                  </View>
                </View>
              </TouchableOpacity>
            ))}
            <Button
              type="primary"
              onPress={() => router.push("/payments/allTransactions")}
            >
              <Text className="font-semibold text-white">
                View All Transactions
              </Text>
            </Button>
          </>
        ) : (
          <View className="items-center gap-2 px-8 py-4">
            <Text className="text-center font-medium leading-6 text-gray-500">
              You have no recent transactions
            </Text>
            <Text className="text-center text-4xl">😊</Text>
          </View>
        )}
      </View>
    </ScrollView>
  );
}

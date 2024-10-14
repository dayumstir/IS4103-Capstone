import { useState } from "react";
import {
  ScrollView,
  View,
  Text,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
} from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { Button } from "@ant-design/react-native";
import { LinearGradient } from "expo-linear-gradient";
import { formatCurrency } from "../../../../utils/formatCurrency";
import { format } from "date-fns";
import { useGetCustomerTransactionsQuery } from "../../../../redux/services/transactionService";
import { useGetCustomerOutstandingInstalmentPaymentsQuery } from "../../../../redux/services/instalmentPaymentService";
import { useSelector } from "react-redux";
import { RootState } from "../../../../redux/store";

export default function PaymentsPage() {
  const [isInstalmentsExpanded, setIsInstalmentsExpanded] = useState(true);
  const router = useRouter();

  const {
    data: transactions,
    isLoading: isTransactionsLoading,
    refetch: refetchTransactions,
  } = useGetCustomerTransactionsQuery();

  const {
    data: outstandingInstalmentPayments,
    isLoading: isInstalmentPaymentsLoading,
    refetch: refetchInstalmentPayments,
  } = useGetCustomerOutstandingInstalmentPaymentsQuery();

  const profile = useSelector((state: RootState) => state.customer.profile);

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

  const balance = profile?.wallet_balance ?? 0;

  const totalOutstanding =
    outstandingInstalmentPayments?.reduce(
      (sum, payment) => sum + payment.amount_due,
      0,
    ) ?? 0;

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

      {/* ===== Available Balance & Outstanding Payments ===== */}
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
              Available Balance
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
          {totalOutstanding > 0 && (
            <TouchableOpacity
              className="rounded-md bg-white px-4 py-2"
              onPress={handlePayAll}
            >
              <Text className="text-sm font-semibold text-blue-500">
                Pay All
              </Text>
            </TouchableOpacity>
          )}
        </View>
      </LinearGradient>

      {/* ===== Upcoming Instalment Payments ===== */}
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
                    <View>
                      <Text className="text-base font-medium">
                        {payment.transaction.merchant.name.length > 20
                          ? `${payment.transaction.merchant.name.slice(0, 20)}...`
                          : payment.transaction.merchant.name}
                      </Text>
                      <Text className="text-sm text-gray-500">
                        Due: {format(payment.due_date, "dd MMM yyyy")}
                      </Text>
                    </View>
                    <View className="flex-row items-center gap-4">
                      <Text className="text-base font-medium">
                        {formatCurrency(payment.amount_due)}
                      </Text>
                      <TouchableOpacity className="rounded-md border border-blue-500 bg-white px-4 py-2">
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
        {transactions && (
          <>
            {transactions.slice(0, 3).map((transaction) => (
              <TouchableOpacity
                key={transaction.transaction_id}
                onPress={() => {
                  router.push(`/payments/${transaction.transaction_id}`);
                }}
              >
                <View className="flex-row items-center justify-between border-t border-gray-200 py-4">
                  <View className="flex-row items-center gap-2">
                    <View className="h-10 w-10 items-center justify-center rounded-full bg-blue-100">
                      {/* TODO: Replace with merchant profile picture */}
                      <Text className="text-center font-bold text-blue-500">
                        {transaction.merchant.name.slice(0, 1).toUpperCase()}
                      </Text>
                    </View>
                    <View>
                      <Text className="text-base font-medium">
                        {transaction.merchant.name.length > 20
                          ? `${transaction.merchant.name.slice(0, 20)}...`
                          : transaction.merchant.name}
                      </Text>
                      <Text className="text-sm text-gray-500">
                        {format(transaction.date_of_transaction, "dd MMM yyyy")}
                      </Text>
                    </View>
                  </View>
                  <Text className="text-base font-medium text-red-600">
                    -{formatCurrency(transaction.amount)}
                  </Text>
                </View>
              </TouchableOpacity>
            ))}
          </>
        )}
        <Button
          type="primary"
          onPress={() => router.push("/payments/allTransactions")}
        >
          <Text className="font-semibold text-white">
            View All Transactions
          </Text>
        </Button>
      </View>
    </ScrollView>
  );
}

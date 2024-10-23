// payments/[transactionId].tsx
import {
  View,
  Text,
  ScrollView,
  RefreshControl,
  ActivityIndicator,
  TouchableOpacity
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useGetTransactionByIdQuery } from "../../../../redux/services/transactionService";
import { formatCurrency } from "../../../../utils/formatCurrency";
import { format } from "date-fns";
import { Button } from "@ant-design/react-native";
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
      (p) => p.status === "PAID"
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
              {transaction.status === "FULLY_PAID" ? "Fully Paid" : "In Progress"}
            </Text>
            <Text className="text-white">
              {(getProgressValue() * 100).toFixed(0)}% Complete
            </Text>
          </View>
        </View>

        {/* ===== Transaction Details ===== */}
        <View className="my-4 rounded-xl bg-white p-8">
          {/* ... Transaction Details ... */}
        </View>

        {/* ===== Instalment Payments ===== */}
        <View className="rounded-xl bg-white p-8">
          <Text className="mb-4 text-xl font-bold">Instalment Payments</Text>
          {transaction.instalment_payments.map((payment, index) => {
            const isPaid = payment.status === 'PAID';
            const rowClassName = `flex-row items-center justify-between border-t border-gray-200 ${
              index === transaction.instalment_payments.length - 1 ? 'pt-2' : 'py-2'
            }`;

            if (isPaid) {
              return (
                <View
                  key={payment.instalment_payment_id}
                  className={rowClassName}
                >
                  {/* ---- Content of Each Instalment ---- */}
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
                        Due: {format(new Date(payment.due_date), 'd MMM yyyy')}
                      </Text>
                    </View>
                  </View>
                  <View className="items-end">
                    <Text className="font-medium">
                      {formatCurrency(payment.amount_due)}
                    </Text>
                    <View
                      className="mt-1 rounded px-2 py-1 bg-green-100"
                    >
                      <Text className="text-xs font-medium text-green-600">
                        {payment.status}
                      </Text>
                    </View>
                  </View>
                </View>
              );
            } else {
              return (
                <TouchableOpacity
                  key={payment.instalment_payment_id}
                  onPress={() =>
                    router.push(
                      `/payments/instalments/${payment.instalment_payment_id}`
                    )
                  }
                  className={rowClassName}
                >
                  {/* ---- Content of Each Instalment ---- */}
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
                        Due: {format(new Date(payment.due_date), 'd MMM yyyy')}
                      </Text>
                    </View>
                  </View>
                  <View className="items-end">
                    <Text className="font-medium">
                      {formatCurrency(payment.amount_due)}
                    </Text>
                    <View
                      className="mt-1 rounded px-2 py-1 bg-yellow-100"
                    >
                      <Text className="text-xs font-medium text-yellow-600">
                        {payment.status}
                      </Text>
                    </View>
                  </View>
                </TouchableOpacity>
              );
            }
          })}
        </View>

        {/* ===== Instalment Plan Details ===== */}
        {transaction.instalment_plan && (
          <View className="mt-4 rounded-xl bg-white p-8">
            {/* ... Instalment Plan Details ... */}
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

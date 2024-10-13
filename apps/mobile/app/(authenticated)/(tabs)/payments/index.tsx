import { useState } from "react";
import { ScrollView, View, Text, TouchableOpacity } from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { Button } from "@ant-design/react-native";
import Toast from "react-native-toast-message";
import { LinearGradient } from "expo-linear-gradient";
import { formatCurrency } from "../../../../utils/formatCurrency";
import { format } from "date-fns";
import { useGetUserTransactionsQuery } from "../../../../redux/services/transactionService";

export default function PaymentsPage() {
  const [isInstalmentsExpanded, setIsInstalmentsExpanded] = useState(true);
  const [isTransactionsExpanded, setIsTransactionsExpanded] = useState(true);
  const router = useRouter();

  const { data: transactions, isLoading: isTransactionsLoading } =
    useGetUserTransactionsQuery();

  const outstandingPayments = [
    {
      id: 1,
      merchant: "APPLE SG PTE LTD",
      amount: 500,
      dueDate: "15 Oct 2024",
    },
  ];

  const totalOutstanding = outstandingPayments.reduce(
    (sum, payment) => sum + payment.amount,
    0,
  );
  const balance = 12500.75;

  const handlePayAll = () => {
    // Implement pay all logic
    Toast.show({
      type: "success",
      text1: "All payments processed",
      text2: "Your outstanding payments have been cleared.",
    });
  };

  const handleAddMoney = () => {
    // Implement add money logic
    // navigation.navigate("AddMoney");
  };

  return (
    <ScrollView>
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
            <Text className="text-sm text-white">Available Balance</Text>
            <Text className="text-3xl font-bold text-white">
              {formatCurrency(balance)}
            </Text>
          </View>
          <TouchableOpacity
            className="rounded-md bg-white px-4 py-2"
            onPress={handleAddMoney}
          >
            <Text className="text-sm font-semibold text-blue-500">
              Add Money
            </Text>
          </TouchableOpacity>
        </View>
        <View className="flex-row items-center justify-between">
          <View>
            <Text className="text-sm text-white">Outstanding Payments</Text>
            <Text className="text-2xl font-bold text-white">
              {formatCurrency(totalOutstanding)}
            </Text>
          </View>
          <TouchableOpacity
            className="rounded-md bg-white px-4 py-2"
            onPress={handlePayAll}
          >
            <Text className="text-sm font-semibold text-blue-500">Pay All</Text>
          </TouchableOpacity>
        </View>
      </LinearGradient>

      {/* ===== Upcoming Instalment Payments ===== */}
      <View className="m-4 rounded-xl bg-white p-8">
        <View className="mb-2 flex-row items-center justify-between">
          <Text className="text-lg font-semibold">Upcoming Payments</Text>
          <TouchableOpacity
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
          <View>
            {outstandingPayments.map((payment) => (
              <View
                key={payment.id}
                className="flex-row items-center justify-between border-t border-gray-200 py-4"
              >
                <View>
                  <Text className="text-base font-medium">
                    {payment.merchant.length > 20
                      ? `${payment.merchant.slice(0, 20)}...`
                      : payment.merchant}
                  </Text>
                  <Text className="text-sm text-gray-500">
                    Due: {payment.dueDate}
                  </Text>
                </View>
                <View className="flex-row items-center gap-4">
                  <Text className="text-base font-medium">
                    {formatCurrency(payment.amount)}
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
        )}
      </View>

      {/* ===== Recent Transactions ===== */}
      <View className="mx-4 mb-4 rounded-xl bg-white p-8">
        <View className="mb-2 flex-row items-center justify-between">
          <Text className="text-lg font-semibold">Recent Transactions</Text>
          <TouchableOpacity
            onPress={() => setIsTransactionsExpanded(!isTransactionsExpanded)}
          >
            <Ionicons
              name={isTransactionsExpanded ? "chevron-up" : "chevron-down"}
              size={24}
              color="black"
            />
          </TouchableOpacity>
        </View>
        {isTransactionsExpanded && transactions && (
          <View>
            {transactions.slice(0, 3).map((transaction) => (
              <View
                key={transaction.transaction_id}
                className="flex-row items-center justify-between border-t border-gray-200 py-4"
              >
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
            ))}
            <Button
              type="primary"
              onPress={() => router.push("/payments/allTransactions")}
            >
              <Text className="font-semibold text-white">
                View All Transactions
              </Text>
            </Button>
          </View>
        )}
      </View>
    </ScrollView>
  );
}

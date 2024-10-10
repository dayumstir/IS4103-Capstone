import { useState } from "react";
import { ScrollView, View, Text, TouchableOpacity } from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { Button } from "@ant-design/react-native";
import Toast from "react-native-toast-message";
import { LinearGradient } from "expo-linear-gradient";
import { formatCurrency } from "../../../../utils/formatCurrency";

export default function PaymentsPage() {
  const [isInstalmentsExpanded, setIsInstalmentsExpanded] = useState(true);
  const [isTransactionsExpanded, setIsTransactionsExpanded] = useState(true);
  const router = useRouter();

  const outstandingPayments = [
    {
      id: 1,
      merchant: "APPLE SG PTE LTD",
      amount: 500,
      dueDate: "15 Oct 2024",
    },
  ];

  const transactions = [
    {
      id: 1,
      date: "29 Aug 2024",
      merchant: "APPLE SG PTE LTD",
      amount: -500,
    },
    {
      id: 3,
      date: "27 Aug 2024",
      merchant: "Grocery Store",
      amount: -75.5,
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
    <ScrollView className="p-4">
      <View className="mb-4 flex-row items-center justify-between">
        <Text className="text-3xl font-bold">Payments</Text>
        <View className="flex-row items-center space-x-4">
          <TouchableOpacity
          // onPress={() => navigation.navigate("Search")}
          >
            <Ionicons name="search-outline" size={24} color="black" />
          </TouchableOpacity>
          <TouchableOpacity
          // onPress={() => navigation.navigate("Notifications")}
          >
            <Ionicons name="notifications-outline" size={24} color="black" />
          </TouchableOpacity>
        </View>
      </View>

      {/* ===== Available Balance & Outstanding Payments ===== */}
      <LinearGradient
        colors={["#3b82f6", "#9333ea"]}
        start={{ x: 0, y: 0.5 }}
        end={{ x: 1, y: 0.5 }}
        style={{
          borderRadius: 8,
          padding: 24,
          marginBottom: 16,
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

      {/* ===== Instalment Payments ===== */}
      <View className="mb-4 rounded-lg bg-white p-8">
        <View className="mb-2 flex-row items-center justify-between">
          <Text className="text-lg font-semibold">Installment Payments</Text>
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
                    {payment.merchant}
                  </Text>
                  <Text className="text-sm text-gray-500">
                    Due: {payment.dueDate}
                  </Text>
                </View>
                <View className="flex-row items-center space-x-2">
                  <Text className="text-base font-medium">
                    {formatCurrency(payment.amount)}
                  </Text>
                  <TouchableOpacity className="ml-4 rounded-md border border-blue-500 bg-white px-4 py-2">
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
      <View className="mb-4 rounded-lg bg-white p-8">
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
        {isTransactionsExpanded && (
          <View>
            {transactions.map((transaction) => (
              <View
                key={transaction.id}
                className="flex-row items-center justify-between border-t border-gray-200 py-4"
              >
                <View className="flex-row items-center space-x-3">
                  <View className="rounded-full bg-red-100 p-2">
                    <Ionicons name="arrow-down" size={16} color="#dc2626" />
                  </View>
                  <View>
                    <Text className="text-base font-medium">
                      {transaction.merchant}
                    </Text>
                    <Text className="text-sm text-gray-500">
                      {transaction.date}
                    </Text>
                  </View>
                </View>
                <Text className="text-base font-medium text-red-600">
                  {formatCurrency(transaction.amount)}
                </Text>
              </View>
            ))}
            <Button
              type="ghost"
              onPress={() => router.push("/payments/allTransactions")}
            >
              <Text className="font-semibold text-blue-500">
                View All Transactions
              </Text>
            </Button>
          </View>
        )}
      </View>
    </ScrollView>
  );
}

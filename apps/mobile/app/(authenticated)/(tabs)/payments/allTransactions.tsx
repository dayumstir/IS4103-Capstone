import React from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
} from "react-native";
import { useGetCustomerTransactionsQuery } from "../../../../redux/services/transactionService";
import { Ionicons } from "@expo/vector-icons";
import { format, isToday } from "date-fns";
import { formatCurrency } from "../../../../utils/formatCurrency";
import EmptyPlaceholder from "../../../../components/emptyPlaceholder";
import { ActivityIndicator } from "@ant-design/react-native";
import { router } from "expo-router";

export default function AllTransactions() {
  const {
    data: transactions,
    isLoading: isTransactionsLoading,
    refetch,
  } = useGetCustomerTransactionsQuery();

  const [refreshing, setRefreshing] = React.useState(false);

  const onRefresh = () => {
    setRefreshing(true);
    refetch().then(() => setRefreshing(false));
  };

  // Unique dates for all transactions
  const uniqueDates = transactions
    ? [
        ...new Set(
          transactions.map((t) => format(t.date_of_transaction, "dd MMM yyyy")),
        ),
      ]
    : [];

  // Transaction block for a specific date
  const transactionBlock = (date: string) => {
    const transactionsOnDate = transactions?.filter(
      (t) => format(t.date_of_transaction, "dd MMM yyyy") === date,
    );

    return (
      <View className="mb-4">
        <Text className="mb-2 text-xl font-bold">
          {isToday(date) ? "Today" : date}
        </Text>
        <View className="flex-1 rounded-xl bg-white p-4">
          {transactionsOnDate?.map((t, index) => (
            <TouchableOpacity
              key={t.transaction_id}
              onPress={() => {
                router.push(`/payments/${t.transaction_id}`);
              }}
            >
              <View
                className={`flex-row items-center justify-between border-gray-200 ${
                  index === 0 ? "pt-0" : "border-t pt-4"
                } ${index === transactionsOnDate.length - 1 ? "pb-0" : "pb-4"}`}
              >
                <View className="flex-row items-center gap-4">
                  <View className="h-10 w-10 items-center justify-center rounded-full bg-blue-100">
                    {/* TODO: Replace with merchant profile picture */}
                    <Text className="text-center font-bold text-blue-500">
                      {t.merchant.name.slice(0, 1).toUpperCase()}
                    </Text>
                  </View>
                  <View>
                    <Text className="font-semibold">
                      {t.merchant.name.length > 20
                        ? `${t.merchant.name.slice(0, 20)}...`
                        : t.merchant.name}
                    </Text>
                    <Text className="text-sm text-gray-500">
                      {t.instalment_plan.number_of_instalments} payments x{" "}
                      {(
                        (t.instalment_plan.time_period * 7) /
                        t.instalment_plan.number_of_instalments
                      ).toFixed(1)}{" "}
                      days
                    </Text>
                  </View>
                </View>
                <Text className="text-base font-medium text-red-600">
                  -{formatCurrency(t.amount)}
                </Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    );
  };

  return (
    <ScrollView
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      <View className="m-4 flex-1">
        <View className="mb-4 flex-row items-center justify-between">
          <Text className="text-4xl font-bold">Transactions</Text>

          <View className="flex-row items-center gap-4">
            <TouchableOpacity onPress={() => {}}>
              <Ionicons name="search-outline" size={24} color="black" />
            </TouchableOpacity>
            <TouchableOpacity onPress={() => {}}>
              <Ionicons name="notifications-outline" size={24} color="black" />
            </TouchableOpacity>
          </View>
        </View>

        {transactions &&
          uniqueDates.length > 0 &&
          uniqueDates.map((date) => (
            <React.Fragment key={date}>{transactionBlock(date)}</React.Fragment>
          ))}

        {isTransactionsLoading && <ActivityIndicator size="large" />}

        {transactions && transactions.length === 0 && (
          <EmptyPlaceholder message="No transactions found" />
        )}
      </View>
    </ScrollView>
  );
}

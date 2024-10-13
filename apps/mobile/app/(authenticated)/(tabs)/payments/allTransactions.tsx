import React from "react";
import { View, Text, ScrollView, TouchableOpacity } from "react-native";
import { useGetUserTransactionsQuery } from "../../../../redux/services/transactionService";
import { Ionicons } from "@expo/vector-icons";
import { format, isToday } from "date-fns";
import { formatCurrency } from "../../../../utils/formatCurrency";
import EmptyPlaceholder from "../../../../components/emptyPlaceholder";
import { ActivityIndicator } from "@ant-design/react-native";

export default function AllTransactions() {
  const { data: transactions, isLoading: isTransactionsLoading } =
    useGetUserTransactionsQuery();

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
            <View
              key={t.transaction_id}
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
                    {format(t.date_of_transaction, "dd MMM yyyy")}
                  </Text>
                </View>
              </View>
              <Text className="text-base font-medium text-red-600">
                -{formatCurrency(t.amount)}
              </Text>
            </View>
          ))}
        </View>
      </View>
    );
  };

  return (
    <ScrollView>
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

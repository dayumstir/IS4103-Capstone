import { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  TextInput,
} from "react-native";
import { useGetCustomerTransactionsQuery } from "../../../../redux/services/transactionService";
import { Ionicons } from "@expo/vector-icons";
import { format, isToday } from "date-fns";
import { formatCurrency } from "../../../../utils/formatCurrency";
import EmptyPlaceholder from "../../../../components/emptyPlaceholder";
import { ActivityIndicator } from "@ant-design/react-native";
import { router } from "expo-router";
import { useDebounce } from "use-debounce";

export default function AllTransactions() {
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearchQuery] = useDebounce(searchQuery, 300);

  const {
    data: transactions,
    isLoading: isTransactionsLoading,
    refetch,
  } = useGetCustomerTransactionsQuery(debouncedSearchQuery);

  const [refreshing, setRefreshing] = useState(false);

  const handleSearchChange = (text: string) => {
    setSearchQuery(text);
  };

  const onRefresh = () => {
    setRefreshing(true);
    refetch().then(() => setRefreshing(false));
  };

  const transactionList = () => {
    // While user is typing
    if (debouncedSearchQuery !== searchQuery) {
      return (
        <View className="mt-16">
          <ActivityIndicator size="large" />
        </View>
      );
    }

    // Unique dates for transactions
    const uniqueDates = transactions
      ? [
          ...new Set(
            transactions.map((t) =>
              format(new Date(t.date_of_transaction), "dd MMM yyyy"),
            ),
          ),
        ]
      : [];

    return (
      uniqueDates.length > 0 &&
      uniqueDates.map((date) => (
        // ===== Transaction Block By Date =====
        <View key={date} className="mb-4">
          <Text className="mb-2 text-xl font-bold">
            {isToday(new Date(date)) ? "Today" : date}
          </Text>
          <View className="flex-1 rounded-xl bg-white p-4">
            {transactions
              ?.filter(
                // Filter transactions on that date
                (t) =>
                  format(new Date(t.date_of_transaction), "dd MMM yyyy") ===
                  date,
              )
              .map((t, index, transactionsOnDate) => (
                // ===== Transaction Row =====
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
                          {t.merchant?.name?.[0].toUpperCase() || "?"}
                        </Text>
                      </View>
                      <View>
                        <Text className="font-semibold">
                          {t.merchant?.name?.length > 20
                            ? `${t.merchant.name.slice(0, 20)}...`
                            : t.merchant?.name || "Unknown Merchant"}
                        </Text>
                        <Text className="text-sm text-gray-500">
                          {t.instalment_plan?.number_of_instalments || "N/A"}{" "}
                          payments x{" "}
                          {t.instalment_plan
                            ? (
                                (t.instalment_plan.time_period * 7) /
                                t.instalment_plan.number_of_instalments
                              ).toFixed(1)
                            : "N/A"}{" "}
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
      ))
    );
  };

  return (
    <ScrollView
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      <View className="m-4 flex-1">
        <Text className="mb-4 text-4xl font-bold">Transactions</Text>

        {/* ===== Search Bar and Filter Button ===== */}
        <View className="mb-4 flex-row items-center">
          <View className="relative flex-1">
            <TextInput
              className="h-10 w-full rounded-full border border-gray-300 bg-white pl-12 focus:border-blue-500"
              value={searchQuery}
              placeholder="Search"
              onChangeText={handleSearchChange}
            />
            <Ionicons
              name="search-outline"
              size={20}
              color="#d1d5db"
              className="absolute left-4 top-2"
            />
          </View>
          <TouchableOpacity className="p-2" onPress={() => {}}>
            <Ionicons name="filter-outline" size={28} color="black" />
          </TouchableOpacity>
        </View>

        {searchQuery.length > 0 && (
          <Text className="mb-4 font-medium text-gray-500">
            Search results for: {searchQuery}
          </Text>
        )}

        {isTransactionsLoading && <ActivityIndicator size="large" />}

        {/* ===== Transactions By Unique Date ===== */}
        {transactionList()}

        {transactions && transactions.length === 0 && (
          <EmptyPlaceholder message="No transactions found" />
        )}
      </View>
    </ScrollView>
  );
}

// payments/allTransactions.tsx
import React, { useState, useRef, useCallback } from "react";
import { useFocusEffect } from "@react-navigation/native";
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
import BottomSheet, {
  BottomSheetBackdrop,
  BottomSheetBackdropProps,
  BottomSheetView,
} from "@gorhom/bottom-sheet";
import { Button } from "@ant-design/react-native";
import { TransactionStatus } from "@repo/interfaces";

export default function AllTransactions() {
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearchQuery] = useDebounce(searchQuery, 300);

  const [dateFilter, setDateFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [tempDateFilter, setTempDateFilter] = useState("all");
  const [tempStatusFilter, setTempStatusFilter] = useState("all");

  const {
    data: transactions,
    isFetching,
    isLoading: isTransactionsLoading,
    refetch,
  } = useGetCustomerTransactionsQuery({
    search: debouncedSearchQuery,
    dateFilter: dateFilter,
    statusFilter: statusFilter,
  });

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

  const transactionList = () => {
    // While user is typing / fetching / loading
    if (
      debouncedSearchQuery !== searchQuery ||
      isFetching ||
      isTransactionsLoading
    ) {
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
              format(new Date(t.date_of_transaction), "d MMM yyyy"),
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
                  format(new Date(t.date_of_transaction), "d MMM yyyy") ===
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
                      <View className="mr-4 flex-1">
                        <Text
                          className="font-semibold"
                          numberOfLines={1}
                          ellipsizeMode="tail"
                        >
                          {t.merchant?.name}
                        </Text>
                        <View className="mt-1 flex-row items-center gap-2">
                          <Text className="text-sm text-gray-500">
                            {format(new Date(t.date_of_transaction), "h:mm a")}
                          </Text>
                          <View
                            className={`rounded-full px-2 py-1 ${t.status === TransactionStatus.IN_PROGRESS ? "bg-yellow-100" : "bg-emerald-100"}`}
                          >
                            <Text
                              className={`text-xs font-medium ${t.status === TransactionStatus.IN_PROGRESS ? "text-amber-600" : "text-emerald-600"}`}
                            >
                              {t.status === TransactionStatus.IN_PROGRESS
                                ? "IN PROGRESS"
                                : "FULLY PAID"}
                            </Text>
                          </View>
                        </View>
                      </View>
                      <Text className="text-base font-medium text-red-600">
                        -{formatCurrency(t.amount)}
                      </Text>
                    </View>
                  </View>
                </TouchableOpacity>
              ))}
          </View>
        </View>
      ))
    );
  };

  const bottomSheetRef = useRef<BottomSheet>(null);

  const closeFilterMenu = () => {
    bottomSheetRef.current?.close();
  };

  const applyFilters = () => {
    setDateFilter(tempDateFilter);
    setStatusFilter(tempStatusFilter);
    closeFilterMenu();
  };

  const clearFilters = () => {
    setDateFilter("all");
    setStatusFilter("all");
    setTempDateFilter("all");
    setTempStatusFilter("all");
    closeFilterMenu();
  };

  const renderBackdrop = (props: BottomSheetBackdropProps) => (
    <BottomSheetBackdrop
      {...props}
      disappearsOnIndex={-1}
      appearsOnIndex={0}
      opacity={0.5}
      onPress={closeFilterMenu}
    />
  );

  const RadioButtonGroup = ({
    options,
    selectedValue,
    onSelect,
    label,
  }: {
    options: { label: string; value: string }[];
    selectedValue: string;
    onSelect: (value: string) => void;
    label: string;
  }) => (
    <View className="mb-4">
      <Text className="mb-2 text-lg font-semibold">{label}</Text>
      <View className="flex-row flex-wrap">
        {options.map((option) => (
          <TouchableOpacity
            key={option.value}
            className={`mb-2 mr-2 rounded-full px-4 py-2 ${
              selectedValue === option.value ? "bg-blue-500" : "bg-gray-200"
            }`}
            onPress={() => onSelect(option.value)}
          >
            <Text
              className={`text-sm font-semibold ${
                selectedValue === option.value ? "text-white" : "text-gray-700"
              }`}
            >
              {option.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  const renderFilterMenu = () => (
    <BottomSheetView>
      <View className="px-8 py-4">
        <View className="mb-4 flex-row items-center justify-between">
          <View className="flex-row items-center gap-4">
            <Ionicons name="filter-outline" size={28} color="black" />
            <Text className="text-2xl font-bold">Filter Transactions</Text>
          </View>
          <TouchableOpacity onPress={clearFilters}>
            <Text className="text-blue-500">Clear All</Text>
          </TouchableOpacity>
        </View>

        <RadioButtonGroup
          label="Date Range"
          options={[
            { label: "All Time", value: "all" },
            { label: "Last 7 Days", value: "7days" },
            { label: "Last 30 Days", value: "30days" },
            { label: "Last 3 Months", value: "3months" },
            { label: "Last 6 Months", value: "6months" },
            { label: "Last Year", value: "1year" },
          ]}
          selectedValue={tempDateFilter}
          onSelect={setTempDateFilter}
        />

        <RadioButtonGroup
          label="Transaction Status"
          options={[
            { label: "All", value: "all" },
            { label: "Fully Paid", value: "fullypaid" },
            { label: "In Progress", value: "inprogress" },
          ]}
          selectedValue={tempStatusFilter}
          onSelect={setTempStatusFilter}
        />

        <Button type="primary" onPress={applyFilters}>
          <Text className="font-semibold text-white">Apply Filters</Text>
        </Button>
      </View>
    </BottomSheetView>
  );

  const renderActiveFilters = () => {
    if (dateFilter === "all" && statusFilter === "all") return null;

    return (
      <View className="mb-4 flex-row flex-wrap items-center">
        <Text className="mr-2 text-gray-500">Active Filters:</Text>
        {dateFilter !== "all" && (
          <View className="mr-2 rounded-full bg-blue-100 px-2 py-1">
            <Text className="text-sm font-medium text-blue-700">
              {dateFilter === "7days"
                ? "Last 7 Days"
                : dateFilter === "30days"
                  ? "Last 30 Days"
                  : dateFilter === "3months"
                    ? "Last 3 Months"
                    : dateFilter === "6months"
                      ? "Last 6 Months"
                      : dateFilter === "1year"
                        ? "Last Year"
                        : ""}
            </Text>
          </View>
        )}
        {statusFilter !== "all" && (
          <View className="mr-2 rounded-full bg-blue-100 px-2 py-1">
            <Text className="text-sm font-medium text-blue-700">
              {statusFilter === "fullypaid" ? "Fully Paid" : "In Progress"}
            </Text>
          </View>
        )}
        <TouchableOpacity onPress={clearFilters}>
          <Text className="text-blue-500">Clear</Text>
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <>
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
                onChangeText={(text) => setSearchQuery(text)}
              />
              <Ionicons
                name="search-outline"
                size={20}
                color="#d1d5db"
                className="absolute left-4 top-2"
              />
              {searchQuery.length > 0 && (
                <TouchableOpacity
                  className="absolute right-4 top-2"
                  onPress={() => setSearchQuery("")}
                >
                  <Ionicons name="close-circle" size={20} color="#9ca3af" />
                </TouchableOpacity>
              )}
            </View>
            <TouchableOpacity
              className="p-2"
              onPress={() => bottomSheetRef.current?.expand()}
            >
              <Ionicons name="filter-outline" size={28} color="black" />
            </TouchableOpacity>
          </View>

          {searchQuery.length > 0 && (
            <Text className="mb-4 text-gray-500">
              Search results for:{" "}
              <Text className="font-semibold">{searchQuery}</Text>
            </Text>
          )}

          {renderActiveFilters()}

          {/* ===== Transactions By Unique Date ===== */}
          {transactionList()}

          {transactions && transactions.length === 0 && (
            <EmptyPlaceholder message="No transactions found" />
          )}
        </View>
      </ScrollView>

      <BottomSheet
        ref={bottomSheetRef}
        index={-1}
        enablePanDownToClose={true}
        backdropComponent={renderBackdrop}
      >
        {renderFilterMenu()}
      </BottomSheet>
    </>
  );
}

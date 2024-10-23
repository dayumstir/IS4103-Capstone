// wallet/allPaymentHistory.tsx
import React, { useState, useRef, useMemo } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  TextInput,
  ActivityIndicator,
} from "react-native";
import { useGetPaymentHistoryQuery } from "../../../../redux/services/paymentService";
import { Ionicons } from "@expo/vector-icons";
import {
  format,
  isToday,
  isWithinInterval,
  subDays,
  subMonths,
} from "date-fns";
import { formatCurrency } from "../../../../utils/formatCurrency";
import EmptyPlaceholder from "../../../../components/emptyPlaceholder";
import { useRouter } from "expo-router";
import { useDebounce } from "use-debounce";
import BottomSheet, {
  BottomSheetBackdrop,
  BottomSheetBackdropProps,
  BottomSheetView,
} from "@gorhom/bottom-sheet";
import { Button } from "@ant-design/react-native";

export default function AllPaymentHistory() {
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearchQuery] = useDebounce(searchQuery, 300);

  const [dateFilter, setDateFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [tempDateFilter, setTempDateFilter] = useState("all");
  const [tempTypeFilter, setTempTypeFilter] = useState("all");

  const {
    data: paymentHistory,
    isFetching,
    isLoading: isPaymentHistoryLoading,
    refetch,
  } = useGetPaymentHistoryQuery();

  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = () => {
    setRefreshing(true);
    refetch().then(() => setRefreshing(false));
  };

  const router = useRouter();

  // Memoize the filtered payment history
  const filteredPaymentHistory = useMemo(() => {
    if (!paymentHistory || paymentHistory.length === 0) {
      return [];
    }

    const query = debouncedSearchQuery.toLowerCase();

    return paymentHistory.filter((record) => {
      // Apply search query
      const matchesSearch =
        record.payment_type.toLowerCase().includes(query) ||
        format(new Date(record.payment_date), "d MMM yyyy, h:mm a")
          .toLowerCase()
          .includes(query) ||
        record.amount.toString().includes(query);

      // Apply date filter
      let matchesDateFilter = true;
      if (dateFilter !== "all") {
        const paymentDate = new Date(record.payment_date);
        const now = new Date();

        switch (dateFilter) {
          case "7days":
            matchesDateFilter = isWithinInterval(paymentDate, {
              start: subDays(now, 7),
              end: now,
            });
            break;
          case "30days":
            matchesDateFilter = isWithinInterval(paymentDate, {
              start: subDays(now, 30),
              end: now,
            });
            break;
          case "3months":
            matchesDateFilter = isWithinInterval(paymentDate, {
              start: subMonths(now, 3),
              end: now,
            });
            break;
          case "6months":
            matchesDateFilter = isWithinInterval(paymentDate, {
              start: subMonths(now, 6),
              end: now,
            });
            break;
          case "1year":
            matchesDateFilter = isWithinInterval(paymentDate, {
              start: subMonths(now, 12),
              end: now,
            });
            break;
          default:
            matchesDateFilter = true;
        }
      }

      // Apply type filter
      let matchesTypeFilter = true;
      if (typeFilter !== "all") {
        switch (typeFilter) {
          case "topup":
            matchesTypeFilter = record.payment_type === "TOP_UP";
            break;
          case "instalment":
            matchesTypeFilter = record.payment_type === "INSTALMENT_PAYMENT";
            break;
          case "refund":
            matchesTypeFilter = record.payment_type === "REFUND";
            break;
          default:
            matchesTypeFilter = true;
        }
      }

      return matchesSearch && matchesDateFilter && matchesTypeFilter;
    });
  }, [paymentHistory, debouncedSearchQuery, dateFilter, typeFilter]);

  const paymentHistoryList = () => {
    if (
      debouncedSearchQuery !== searchQuery ||
      isFetching ||
      isPaymentHistoryLoading
    ) {
      return (
        <View className="mt-16">
          <ActivityIndicator size="large" />
        </View>
      );
    }

    if (filteredPaymentHistory.length === 0) {
      return <EmptyPlaceholder message="No transactions found" />;
    }

    // Unique dates for payment history
    const uniqueDates = [
      ...new Set(
        filteredPaymentHistory.map((t) =>
          format(new Date(t.payment_date), "d MMM yyyy")
        )
      ),
    ];

    return uniqueDates.length > 0 ? (
      uniqueDates.map((date) => (
        <View key={date} className="mb-4">
          <Text className="mb-2 text-xl font-bold">
            {isToday(new Date(date)) ? "Today" : date}
          </Text>
          <View className="flex-1 rounded-xl bg-white p-4">
            {filteredPaymentHistory
              .filter(
                (t) => format(new Date(t.payment_date), "d MMM yyyy") === date
              )
              .map((t, index, transactionsOnDate) => {
                // Determine payment history details
                let icon = "💰";
                let title = "Top Up";
                let amountColor = "text-green-600";
                let amountPrefix = "+";

                if (t.payment_type === "INSTALMENT_PAYMENT") {
                  icon = "💸";
                  title = "Instalment Payment";
                  amountColor = "text-red-600";
                  amountPrefix = "-";
                } else if (t.payment_type === "REFUND") {
                  icon = "💵";
                  title = "Refund";
                  amountColor = "text-green-600";
                  amountPrefix = "+";
                } else if (t.payment_type === "OTHER") {
                  icon = "🔄";
                  title = "Transaction";
                  amountColor = "text-gray-600";
                  amountPrefix = "";
                }

                return (
                  <View
                    key={t.payment_history_id}
                    className={`flex-row items-center justify-between border-gray-200 ${
                      index === 0 ? "pt-0" : "border-t pt-4"
                    } ${
                      index === transactionsOnDate.length - 1 ? "pb-0" : "pb-4"
                    }`}
                  >
                    <View className="flex-row items-center gap-4">
                      <View className="h-10 w-10 items-center justify-center rounded-full bg-gray-100">
                        <Text className="text-center text-2xl">{icon}</Text>
                      </View>
                      <View className="mr-4 flex-1">
                        <Text
                          className="font-semibold"
                          numberOfLines={1}
                          ellipsizeMode="tail"
                        >
                          {title}
                        </Text>
                        <Text className="text-sm text-gray-500">
                          {format(new Date(t.payment_date), "h:mm a")}
                        </Text>
                      </View>
                      <Text className={`text-base font-medium ${amountColor}`}>
                        {amountPrefix}
                        {formatCurrency(t.amount)}
                      </Text>
                    </View>
                  </View>
                );
              })}
          </View>
        </View>
      ))
    ) : (
      <EmptyPlaceholder message="No transactions found" />
    );
  };

  // Filter Menu Implementation
  const bottomSheetRef = useRef<BottomSheet>(null);

  const closeFilterMenu = () => {
    bottomSheetRef.current?.close();
  };

  const applyFilters = () => {
    setDateFilter(tempDateFilter);
    setTypeFilter(tempTypeFilter);
    closeFilterMenu();
  };

  const clearFilters = () => {
    setDateFilter("all");
    setTypeFilter("all");
    setTempDateFilter("all");
    setTempTypeFilter("all");
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
            <Text className="text-2xl font-bold">Filter Payment History</Text>
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
          label="Payment Type"
          options={[
            { label: "All", value: "all" },
            { label: "Top Up", value: "topup" },
            { label: "Instalment Payment", value: "instalment" },
            { label: "Refund", value: "refund" },
          ]}
          selectedValue={tempTypeFilter}
          onSelect={setTempTypeFilter}
        />

        <Button type="primary" onPress={applyFilters}>
          <Text className="font-semibold text-white">Apply Filters</Text>
        </Button>
      </View>
    </BottomSheetView>
  );

  const renderActiveFilters = () => {
    if (dateFilter === "all" && typeFilter === "all") return null;

    const getDateFilterLabel = () => {
      switch (dateFilter) {
        case "7days":
          return "Last 7 Days";
        case "30days":
          return "Last 30 Days";
        case "3months":
          return "Last 3 Months";
        case "6months":
          return "Last 6 Months";
        case "1year":
          return "Last Year";
        default:
          return "";
      }
    };

    const getTypeFilterLabel = () => {
      switch (typeFilter) {
        case "topup":
          return "Top Up";
        case "instalment":
          return "Instalment Payment";
        case "refund":
          return "Refund";
        default:
          return "";
      }
    };

    return (
      <View className="mb-4 flex-row flex-wrap items-center">
        <Text className="mr-2 text-gray-500">Active Filters:</Text>
        {dateFilter !== "all" && (
          <View className="mr-2 mb-2 rounded-full bg-blue-100 px-2 py-1">
            <Text className="text-sm font-medium text-blue-700">
              {getDateFilterLabel()}
            </Text>
          </View>
        )}
        {typeFilter !== "all" && (
          <View className="mr-2 mb-2 rounded-full bg-blue-100 px-2 py-1">
            <Text className="text-sm font-medium text-blue-700">
              {getTypeFilterLabel()}
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
          <Text className="mb-4 text-4xl font-bold">Payment History</Text>

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
                style={{ position: "absolute", left: 12, top: 10 }}
              />
              {searchQuery.length > 0 && (
                <TouchableOpacity
                  style={{ position: "absolute", right: 12, top: 10 }}
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

          {/* ===== Payment History By Date ===== */}
          {paymentHistoryList()}
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

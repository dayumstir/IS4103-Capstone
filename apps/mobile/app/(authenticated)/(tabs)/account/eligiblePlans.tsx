import { useState, useMemo } from "react";
import {
  View,
  Text,
  ScrollView,
  RefreshControl,
  ActivityIndicator,
  TouchableOpacity,
} from "react-native";
import { useGetInstalmentPlansQuery } from "../../../../redux/services/customerService";
import { IInstalmentPlan } from "@repo/interfaces";
import { formatCurrency } from "../../../../utils/formatCurrency";
import { Ionicons } from "@expo/vector-icons";

type SortKey =
  | "number_of_instalments"
  | "time_period"
  | "payment_frequency"
  | "interest_rate"
  | "minimum_amount"
  | "maximum_amount";

export default function EligiblePlansScreen() {
  const [refreshing, setRefreshing] = useState(false);
  const [sortKey, setSortKey] = useState<SortKey>("number_of_instalments");
  const [sortAsc, setSortAsc] = useState(true);
  const {
    data: instalmentPlans,
    isLoading,
    error,
    refetch,
  } = useGetInstalmentPlansQuery();

  const onRefresh = () => {
    setRefreshing(true);
    refetch().then(() => setRefreshing(false));
  };

  const sortedPlans = useMemo(() => {
    if (!instalmentPlans) return [];
    return [...instalmentPlans].sort((a, b) => {
      let aValue, bValue;
      switch (sortKey) {
        case "number_of_instalments":
          aValue = a.number_of_instalments;
          bValue = b.number_of_instalments;
          break;
        case "time_period":
          aValue = a.time_period;
          bValue = b.time_period;
          break;
        case "payment_frequency":
          aValue = (a.time_period * 7) / a.number_of_instalments;
          bValue = (b.time_period * 7) / b.number_of_instalments;
          break;
        case "interest_rate":
          aValue = a.interest_rate;
          bValue = b.interest_rate;
          break;
        case "minimum_amount":
          aValue = a.minimum_amount;
          bValue = b.minimum_amount;
          break;
        case "maximum_amount":
          aValue = a.maximum_amount;
          bValue = b.maximum_amount;
          break;
      }
      return sortAsc ? aValue - bValue : bValue - aValue;
    });
  }, [instalmentPlans, sortKey, sortAsc]);

  const toggleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortAsc(!sortAsc);
    } else {
      setSortKey(key);
      setSortAsc(true);
    }
  };

  const renderSortButton = (title: string, key: SortKey) => (
    <TouchableOpacity
      onPress={() => toggleSort(key)}
      className="mb-2 mr-2 flex-row items-center justify-between rounded-full bg-blue-100 px-4 py-2"
    >
      <Text className="font-medium text-blue-700">{title}</Text>
      {sortKey === key && (
        <Ionicons
          className="ml-2"
          name={sortAsc ? "chevron-up-outline" : "chevron-down-outline"}
          size={16}
          color="#3b82f6"
        />
      )}
    </TouchableOpacity>
  );

  const renderPlan = (plan: IInstalmentPlan) => (
    <View key={plan.instalment_plan_id} className="mb-4 rounded-xl bg-white">
      <View className="rounded-t-xl bg-blue-500 px-6 py-4">
        <Text
          className="text-xl font-bold text-white"
          numberOfLines={1}
          ellipsizeMode="tail"
        >
          {plan.name}
        </Text>
      </View>
      <View className="flex-row flex-wrap px-6 py-4">
        <View className="mb-4 w-1/2 pr-2">
          <View className="flex-row items-center">
            <Ionicons
              name="calendar-outline"
              size={20}
              color="#3b82f6"
              className="mr-4"
            />
            <View>
              <Text className="text-sm text-gray-500">Total Instalments</Text>
              <Text className="font-medium">{plan.number_of_instalments}</Text>
            </View>
          </View>
        </View>
        <View className="mb-4 w-1/2 pl-2">
          <View className="flex-row items-center">
            <Ionicons
              name="time-outline"
              size={20}
              color="#3b82f6"
              className="mr-4"
            />
            <View>
              <Text className="text-sm text-gray-500">Time Period</Text>
              <Text className="font-medium">{plan.time_period} weeks</Text>
            </View>
          </View>
        </View>

        <View className="mb-4 w-1/2 pr-2">
          <View className="flex-row items-center">
            <Ionicons
              name="repeat-outline"
              size={20}
              color="#3b82f6"
              className="mr-4"
            />
            <View>
              <Text className="text-sm text-gray-500">Payment Frequency</Text>
              <Text className="font-medium">
                Every{" "}
                {((plan.time_period * 7) / plan.number_of_instalments).toFixed(
                  1,
                )}{" "}
                days
              </Text>
            </View>
          </View>
        </View>
        <View className="mb-4 w-1/2 pl-2">
          <View className="flex-row items-center">
            <Ionicons
              name="trending-up-outline"
              size={20}
              color="#3b82f6"
              className="mr-4"
            />
            <View>
              <Text className="text-sm text-gray-500">Interest Rate</Text>
              <Text className="font-medium">{plan.interest_rate}%</Text>
            </View>
          </View>
        </View>
        <View className="mb-4 w-1/2 pr-2">
          <View className="flex-row items-center">
            <Ionicons
              name="cash-outline"
              size={20}
              color="#3b82f6"
              className="mr-4"
            />
            <View>
              <Text className="text-sm text-gray-500">Minimum Amount</Text>
              <Text className="font-medium">
                {formatCurrency(plan.minimum_amount)}
              </Text>
            </View>
          </View>
        </View>
        <View className="w-1/2 pl-2">
          <View className="flex-row items-center">
            <Ionicons
              name="cash-outline"
              size={20}
              color="#3b82f6"
              className="mr-4"
            />
            <View>
              <Text className="text-sm text-gray-500">Maximum Amount</Text>
              <Text className="font-medium">
                {formatCurrency(plan.maximum_amount)}
              </Text>
            </View>
          </View>
        </View>
      </View>
    </View>
  );

  if (isLoading) {
    return (
      <View className="flex-1 items-center justify-center">
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (error) {
    return (
      <View className="flex-1 items-center justify-center">
        <Text className="text-red-500">
          Error loading plans. Please try again.
        </Text>
      </View>
    );
  }

  return (
    <ScrollView
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      <View className="m-4">
        <Text className="mb-4 text-2xl font-bold">
          Eligible Instalment Plans
        </Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          className="mb-4"
        >
          <Text className="mr-2 items-center py-2 font-semibold text-gray-500">
            Sort By:
          </Text>
          {renderSortButton("Instalments", "number_of_instalments")}
          {renderSortButton("Time Period", "time_period")}
          {renderSortButton("Payment Frequency", "payment_frequency")}
          {renderSortButton("Interest Rate", "interest_rate")}
          {renderSortButton("Min Amount", "minimum_amount")}
          {renderSortButton("Max Amount", "maximum_amount")}
        </ScrollView>
        {sortedPlans.length > 0 ? (
          sortedPlans.map(renderPlan)
        ) : (
          <Text className="text-center text-gray-500">
            No eligible plans found.
          </Text>
        )}
      </View>
    </ScrollView>
  );
}

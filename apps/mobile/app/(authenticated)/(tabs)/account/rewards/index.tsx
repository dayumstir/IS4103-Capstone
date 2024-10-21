import {
  View,
  Text,
  ScrollView,
  Dimensions,
  RefreshControl,
  TouchableOpacity,
} from "react-native";
import { ActivityIndicator, Button } from "@ant-design/react-native";
import { router } from "expo-router";
import { createMaterialTopTabNavigator } from "@react-navigation/material-top-tabs";
import { AntDesign } from "@expo/vector-icons";
import { useState } from "react";
import { useGetAllVouchersQuery } from "../../../../../redux/services/voucherService";
import { useSelector } from "react-redux";
import { RootState } from "../../../../../redux/store";
import { IVoucher } from "@repo/interfaces";
import { format } from "date-fns";
import EmptyPlaceholder from "../../../../../components/emptyPlaceholder";

export default function RewardsPage() {
  const Tab = createMaterialTopTabNavigator();
  const { profile } = useSelector((state: RootState) => state.customer);
  const [refreshing, setRefreshing] = useState(false);
  const {
    data: vouchers,
    isLoading,
    error,
    refetch,
  } = useGetAllVouchersQuery({
    customer_id: profile!.customer_id.toString(),
  });

  const onRefresh = () => {
    setRefreshing(true);
    refetch().then(() => setRefreshing(false));
  };

  // TODO: Replace with actual cashback list
  const cashbackList = [
    { id: 1, amount: 5.5, merchant: "SuperMart", date: "2023-09-25" },
    { id: 2, amount: 2.75, merchant: "CoffeeHouse", date: "2023-09-23" },
    { id: 3, amount: 10.0, merchant: "ElectroStore", date: "2023-09-20" },
  ];

  if (isLoading) {
    return (
      <View className="flex-1 items-center justify-center">
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (error) {
    console.error(error);
    return (
      <View className="flex-1 items-center justify-center">
        <Text className="px-16 text-center text-lg font-semibold text-red-500">
          Error loading vouchers. Please close this page and try again.
        </Text>
      </View>
    );
  }

  const CashbackView = () => (
    <ScrollView
      className="bg-white"
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      {cashbackList.length > 0 ? (
        cashbackList.map((cashback, index) => (
          <View
            key={cashback.id}
            className={`mb-4 rounded-lg border border-gray-300 p-4 ${index === 0 ? "mt-4" : ""}`}
          >
            <View className="flex-row items-center justify-between">
              <View>
                <Text className="text-base font-bold">
                  ${cashback.amount.toFixed(2)} Cashback
                </Text>
                <Text className="text-sm text-gray-500">
                  From: {cashback.merchant}
                </Text>
              </View>
              <Text className="text-sm text-gray-500">
                Date: {cashback.date}
              </Text>
            </View>
          </View>
        ))
      ) : (
        <EmptyPlaceholder message="No cashback found" />
      )}
    </ScrollView>
  );

  const VoucherCard = ({ voucher }: { voucher: IVoucher }) => {
    return (
      <View className="w-full rounded-lg border border-gray-300 bg-white p-4">
        <View className="mb-2 flex-row items-center justify-between">
          <Text className="text-lg font-bold">
            {voucher.title.length > 25
              ? voucher.title.substring(0, 25) + "..."
              : voucher.title}
          </Text>

          <View
            className={`rounded px-2 py-1 ${voucher.is_active ? "bg-blue-500" : "bg-gray-500"}`}
          >
            <Text className="text-xs font-semibold text-white">
              {voucher.is_active ? "Active" : "Inactive"}
            </Text>
          </View>
        </View>

        <Text className="text-sm text-gray-800">
          {voucher.description.length > 80
            ? voucher.description.substring(0, 80) + "..."
            : voucher.description}
        </Text>

        <View className="mt-2 border-t border-gray-200 pt-2">
          <Text className="text-xs text-gray-600">
            Expires: {format(voucher.expiry_date, "d MMM yyyy")}
          </Text>

          <Text className="text-xs text-gray-600">
            Usage Limit: {voucher.usage_limit}
          </Text>
        </View>
      </View>
    );
  };

  const VoucherView = () => (
    <ScrollView
      className="bg-white"
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      {vouchers && vouchers.length > 0 ? (
        vouchers.map((voucherAssigned, index) => (
          <TouchableOpacity
            key={voucherAssigned.voucher_assigned_id}
            onPress={() =>
              router.push(
                `/account/rewards/${voucherAssigned.voucher.voucher_id}`,
              )
            }
            className={`${index === 0 ? "mt-4" : ""} ${index === vouchers.length - 1 ? "" : "mb-4"}`}
          >
            <VoucherCard voucher={voucherAssigned.voucher} />
          </TouchableOpacity>
        ))
      ) : (
        <EmptyPlaceholder message="No vouchers found" />
      )}
    </ScrollView>
  );

  return (
    <View className="m-4 flex-1 rounded-lg bg-white p-8">
      <View className="mb-4 flex flex-row items-center gap-3">
        <View className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-500">
          <AntDesign name="gift" size={20} color="white" />
        </View>
        <Text className="text-2xl font-bold">My Rewards</Text>
      </View>

      <Tab.Navigator
        screenOptions={{
          tabBarLabelStyle: {
            fontWeight: "600",
            textTransform: "none",
            textAlign: "center",
            fontSize: 14,
          },
          tabBarItemStyle: {
            width: (Dimensions.get("window").width - 80) / 2,
          },
        }}
      >
        <Tab.Screen name="Cashback" component={CashbackView} />
        <Tab.Screen name="Vouchers" component={VoucherView} />
      </Tab.Navigator>

      <View className="mt-4">
        <Button type="primary" onPress={() => router.navigate("/account")}>
          <Text className="text-center font-semibold text-white">
            Back to Account
          </Text>
        </Button>
      </View>
    </View>
  );
}

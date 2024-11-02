// app/mobile/app/(authenticated)/(tabs)/account/rewards/index.tsx
import {
  Dimensions,
  RefreshControl,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { ActivityIndicator, Button } from "@ant-design/react-native";
import { AntDesign } from "@expo/vector-icons";
import { router } from "expo-router";
import { createMaterialTopTabNavigator } from "@react-navigation/material-top-tabs";
import { format } from "date-fns";
import { useState } from "react";
import { useSelector } from "react-redux";

import { useGetAllVouchersQuery } from "../../../../../redux/services/voucherService";
import { useGetAllCashbackWalletsQuery } from "../../../../../redux/services/cashbackWalletService";
import { RootState } from "../../../../../redux/store";
import { IVoucherAssigned, ICashbackWallet } from "@repo/interfaces";
import EmptyPlaceholder from "../../../../../components/emptyPlaceholder";

export default function RewardsPage() {
  const Tab = createMaterialTopTabNavigator();
  const { profile } = useSelector((state: RootState) => state.customer);
  const [refreshing, setRefreshing] = useState(false);

  const { data: vouchersAssigned, isLoading: isLoadingVouchers, error: voucherError, refetch: refetchVouchers } = useGetAllVouchersQuery({
    customer_id: profile!.customer_id.toString(),
  });

  const { data: cashbackWallets, isLoading: isLoadingCashbacks, error: cashbackError, refetch: refetchCashbacks } = useGetAllCashbackWalletsQuery({
    customer_id: profile!.customer_id.toString(),
  });

  const onRefresh = () => {
    setRefreshing(true);
    Promise.all([refetchVouchers(), refetchCashbacks()]).then(() => setRefreshing(false));
  };

  // Loading state
  if (isLoadingVouchers || isLoadingCashbacks) {
    return (
      <View className="flex-1 items-center justify-center">
        <ActivityIndicator size="large" />
      </View>
    );
  }

  // Error state
  if (voucherError || cashbackError) {
    console.error(voucherError || cashbackError);
    return (
      <View className="flex-1 items-center justify-center">
        <Text className="px-16 text-center text-lg font-semibold text-red-500">
          Error loading rewards. Please close this page and try again.
        </Text>
      </View>
    );
  }

  // Cashback Tab Content
  const CashbackView = () => (
    <ScrollView
      className="bg-white"
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      {cashbackWallets && cashbackWallets.length > 0 ? (
        cashbackWallets.map((cashbackWallet, index) => (
          <TouchableOpacity
            key={cashbackWallet.cashback_wallet_id}
            onPress={() =>
              router.push({ pathname: `/account/rewards/cashbackWalletDetails`, params: { cashbackWallet: JSON.stringify(cashbackWallet) } })
            }
            className={`mb-4 rounded-lg border border-gray-300 p-4 ${index === 0 ? "mt-4" : ""}`}
          >
            <View className="flex-row items-center justify-between">
              <View>
                <Text className="text-base font-bold">
                  ${cashbackWallet.wallet_balance.toFixed(2)}
                </Text>
                <Text className="text-sm text-gray-500">
                  From: {cashbackWallet.merchant?.name}
                </Text>
              </View>
            </View>
          </TouchableOpacity>
        ))
      ) : (
        <EmptyPlaceholder message="No cashback wallets found" />
      )}
    </ScrollView>
  );

  // Voucher Card Component
  const VoucherAssignedCard = ({ voucherAssigned }: { voucherAssigned: IVoucherAssigned }) => (
    <View className="w-full rounded-lg border border-gray-300 bg-white p-4">
      <View className="mb-2 flex-row items-center justify-between">
        <Text className="text-lg font-bold">
          {voucherAssigned.voucher.title.length > 25
            ? voucherAssigned.voucher.title.substring(0, 25) + "..."
            : voucherAssigned.voucher.title}
        </Text>
        <View
          className={`rounded px-1 py-0.5 ${
            voucherAssigned.status === "AVAILABLE" ? "bg-blue-500" : "bg-gray-500"
          }`}
        >
          <Text className="text-xs font-semibold text-white">
            {voucherAssigned.status}
          </Text>
        </View>
      </View>
      <Text className="text-sm text-gray-800">
        {voucherAssigned.voucher.description.length > 80
          ? voucherAssigned.voucher.description.substring(0, 80) + "..."
          : voucherAssigned.voucher.description}
      </Text>
      <View className="mt-2 border-t border-gray-200 pt-2">
        <Text className="text-xs text-gray-600">
          Expires: {format(voucherAssigned.voucher.expiry_date, "d MMM yyyy")}
        </Text>
        <Text className="text-xs text-gray-600">Remaining Uses: {voucherAssigned.remaining_uses}</Text>
      </View>
    </View>
  );

  // Vouchers Tab Content
  const VoucherAssignedView = () => (
    <ScrollView
      className="bg-white"
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      {vouchersAssigned && vouchersAssigned.length > 0 ? (
        vouchersAssigned.map((voucherAssigned, index) => (
          <TouchableOpacity
            key={voucherAssigned.voucher_assigned_id}
            onPress={() =>
              router.push({ pathname: `/account/rewards/voucherAssignedDetails`, params: { voucherAssigned: JSON.stringify(voucherAssigned) } })
            }
            className={`${index === 0 ? "mt-4" : ""} ${
              index === vouchersAssigned.length - 1 ? "" : "mb-4"
            }`}
          >
            <VoucherAssignedCard voucherAssigned={voucherAssigned} />
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
        <Tab.Screen name="Vouchers" component={VoucherAssignedView} />
      </Tab.Navigator>

      <View className="mt-4">
        <Button type="primary" onPress={() => router.navigate("/account")}>
          <Text className="text-center font-semibold text-white">Back to Account</Text>
        </Button>
      </View>
    </View>
  );
}

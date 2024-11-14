// apps/mobile/app/(authenticated)/(tabs)/account/rewards/cashbackWalletDetails.tsx
import { View, Text } from "react-native";
import { Button } from "@ant-design/react-native";
import { format } from "date-fns";
import { useLocalSearchParams } from "expo-router";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { ICashbackWallet } from "@repo/interfaces";

export default function CashbackWalletDetails() {
  const { cashbackWallet } = useLocalSearchParams<{ cashbackWallet: string }>();
  const parsedCashbackWallet: ICashbackWallet = JSON.parse(cashbackWallet);

  if (!parsedCashbackWallet) {
    return (
      <View className="flex-1 items-center justify-center">
        <Text>Error: Cashback wallet not found</Text>
      </View>
    );
  }

  return (
    <View className="flex-1 p-4">
      <View className="mb-4 rounded-lg bg-white p-8">
        <View className="mb-4 flex-row items-center gap-4">
          <View className="h-12 w-12 items-center justify-center rounded-full bg-green-500">
            <MaterialCommunityIcons name="wallet-outline" size={24} color="white" />
          </View>
          <View>
            <Text className="text-2xl font-bold">Cashback Wallet</Text>
            <Text className="text-sm text-gray-500">
              ID: {parsedCashbackWallet.cashback_wallet_id}
            </Text>
          </View>
        </View>

        <View className="flex gap-2">
          <Text>
            <Text className="font-bold">Wallet Balance:</Text> ${parsedCashbackWallet.wallet_balance.toFixed(2)}
          </Text>
          <Text>
            <Text className="font-bold">Created At:</Text> {format(new Date(parsedCashbackWallet.createdAt), "d MMM yyyy")}
          </Text>
          <Text>
            <Text className="font-bold">Updated At:</Text> {format(new Date(parsedCashbackWallet.updatedAt), "d MMM yyyy")}
          </Text>
          <Text>
            <Text className="font-bold">Merchant Name:</Text> {parsedCashbackWallet.merchant?.name || 'Unknown Merchant'}
          </Text>
        </View>
      </View>

      {/* ===== Recent Cashback Wallet History ===== */}
      <View className="mb-4 rounded-lg bg-white p-8">
        <Text className="mb-2 text-xl font-bold">Recent Wallet History</Text>
        {/* Placeholder for now */}
        <View className="items-center gap-2 px-8 py-4">
          <Text className="text-center font-medium leading-6 text-gray-500">
            No recent history available.
          </Text>
          <Text className="text-center text-4xl">😊</Text>
        </View>
      </View>
    </View>
  );
}

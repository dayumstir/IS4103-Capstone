// apps/mobile/app/(authenticated)/(tabs)/account/rewards/voucherAssignedDetails.tsx
import { View, Text } from "react-native";
import { format } from "date-fns";
import { useLocalSearchParams } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { IVoucherAssigned } from "@repo/interfaces";

export default function VoucherAssignedDetails() {
  const { voucherAssigned } = useLocalSearchParams<{ voucherAssigned: string }>();
  const parsedVoucherAssigned: IVoucherAssigned = JSON.parse(voucherAssigned);

  if (!parsedVoucherAssigned) {
    return (
      <View className="flex-1 items-center justify-center">
        <Text>Error: Voucher not found</Text>
      </View>
    );
  }

  return (
    <View className="flex-1 p-4">
      <View className="mb-4 rounded-lg bg-white p-8">
        <View className="mb-4 flex-row items-center gap-4">
          <View className="h-12 w-12 items-center justify-center rounded-full bg-blue-500">
            <Ionicons name="ticket-outline" size={24} color="white" />
          </View>
          <View>
            <Text className="text-2xl font-bold">{parsedVoucherAssigned.voucher.title}</Text>
            <Text className="text-sm text-gray-500">
              ID: {parsedVoucherAssigned.voucher_assigned_id}
            </Text>
          </View>
        </View>

        <Text className="mb-8 text-gray-600">{parsedVoucherAssigned.voucher.description}</Text>

        <View className="flex gap-2">
          <Text>
            <Text className="font-bold">Discount:</Text>{" "}
            {parsedVoucherAssigned.voucher.percentage_discount
              ? `${parsedVoucherAssigned.voucher.percentage_discount}%`
              : `$${parsedVoucherAssigned.voucher.amount_discount}`}
          </Text>
          <Text>
            <Text className="font-bold">Expiry Date:</Text>{" "}
            {format(parsedVoucherAssigned.voucher.expiry_date, "d MMM yyyy")}
          </Text>
          <Text>
            <Text className="font-bold">Remaining Uses:</Text>{" "}
            {parsedVoucherAssigned.remaining_uses} / {parsedVoucherAssigned.voucher.usage_limit}
          </Text>
          <Text>
            <Text className="font-bold">Status:</Text>{" "}
            {parsedVoucherAssigned.status}
          </Text>
        </View>

        <View className="mt-8">
          <Text className="mb-2 font-semibold">Terms and Conditions:</Text>
          <Text className="text-sm text-gray-600">{parsedVoucherAssigned.voucher.terms}</Text>
        </View>
      </View>
    </View>
  );
}

import { View, Text } from "react-native";
import { ActivityIndicator, Button } from "@ant-design/react-native";
import { format } from "date-fns";
import { useGetVoucherByIdQuery } from "../../../../../redux/services/voucherService";
import { useLocalSearchParams } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
export default function VoucherDetails() {
  const { voucherId } = useLocalSearchParams<{ voucherId: string }>();
  const { data: voucher, isLoading, error } = useGetVoucherByIdQuery(voucherId);

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
        <Text>Error loading voucher details</Text>
      </View>
    );
  }

  if (!voucher) {
    return (
      <View className="flex-1 items-center justify-center">
        <Text>Error: Voucher not found</Text>
      </View>
    );
  }

  return (
    <View className="flex-1 p-4">
      {voucher && (
        <>
          <View className="mb-4 rounded-lg bg-white p-8">
            <View className="mb-4 flex-row items-center gap-4">
              <View className="h-12 w-12 items-center justify-center rounded-full bg-blue-500">
                <Ionicons name="ticket-outline" size={24} color="white" />
              </View>
              <View>
                <Text className="text-2xl font-bold">{voucher.title}</Text>
                <Text className="text-sm text-gray-500">
                  ID: {voucher.voucher_id}
                </Text>
              </View>
            </View>

            <Text className="mb-8 text-gray-600">{voucher.description}</Text>

            <View className="flex gap-2">
              <Text>
                <Text className="font-bold">Discount:</Text>{" "}
                {voucher.percentage_discount
                  ? `${voucher.percentage_discount}%`
                  : `$${voucher.amount_discount}`}
              </Text>
              <Text>
                <Text className="font-bold">Expiry Date:</Text>{" "}
                {format(voucher.expiry_date, "d MMM yyyy")}
              </Text>
              <Text>
                <Text className="font-bold">Usage Limit:</Text>{" "}
                {voucher.usage_limit}
              </Text>
              <Text>
                <Text className="font-bold">Status:</Text>{" "}
                {voucher.is_active ? "Active" : "Inactive"}
              </Text>
            </View>

            <View className="mt-8">
              <Text className="mb-2 font-semibold">Terms and Conditions:</Text>
              <Text className="text-sm text-gray-600">{voucher.terms}</Text>
            </View>
          </View>
        </>
      )}

      <Button type="primary">
        <Text className="font-semibold text-white">Use Voucher</Text>
      </Button>
    </View>
  );
}

// app/mobile/app/(authenticated)/(tabs)/account/rewards/_layout.tsx
import { Stack, router } from "expo-router";
import Ionicons from "@expo/vector-icons/Ionicons";
import { Text, TouchableOpacity } from "react-native";

export default function RewardsLayout() {
  return (
    <Stack>
      <Stack.Screen
        name="index"
        options={{
          headerTitle: "Rewards",
          headerLeft: () => (
            <TouchableOpacity
              className="flex-row items-center"
              onPress={() => router.navigate("/account")}
            >
              <Ionicons name="chevron-back" size={24} color="#3b82f6" />
              <Text className="text-xl text-blue-500 ml-1">Account</Text>
            </TouchableOpacity>
          ),
        }}
      />
      <Stack.Screen
        name="voucherAssignedDetails"
        options={{ headerTitle: "Voucher Details" }}
      />
    </Stack>
  );
}

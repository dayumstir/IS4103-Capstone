import { Stack } from "expo-router";
import { Text, TouchableOpacity } from "react-native";
import { router } from "expo-router";
import Ionicons from "@expo/vector-icons/Ionicons";

export default function IssuesLayout() {
  return (
    <Stack>
      <Stack.Screen
        name="index"
        options={{
          headerTitle: "Rewards",
          headerLeft: () => (
            <TouchableOpacity
              className="flex-row gap-1"
              onPress={() => router.navigate("/account")}
            >
              <Ionicons name="chevron-back" size={24} color="#3b82f6" />
              <Text className="text-xl text-blue-500">Account</Text>
            </TouchableOpacity>
          ),
        }}
      />
      <Stack.Screen
        name="[voucherId]"
        options={{ headerTitle: "Voucher Details" }}
      />
    </Stack>
  );
}

// payments/instalments/_layout.tsx
import { router, Stack } from "expo-router";
import { Text, TouchableOpacity } from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";

export default function InstalmentsLayout() {
  return (
    <Stack>
      <Stack.Screen
        name="[instalmentPaymentId]"
        options={{
          headerTitle: "Instalment Details",
          headerLeft: () => (
            <TouchableOpacity
              className="flex-row gap-1"
              onPress={() => {
                router.back();
              }}
            >
              <Ionicons name="chevron-back" size={24} color="#3b82f6" />
              <Text className="text-xl text-blue-500">Back</Text>
            </TouchableOpacity>
          ),
        }}
      />
    </Stack>
  );
}

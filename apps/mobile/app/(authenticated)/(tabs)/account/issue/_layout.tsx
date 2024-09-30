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
          headerTitle: "My Issues",
          headerLeft: () => (
            <TouchableOpacity
              className="flex-row gap-1"
              onPress={() => router.back()}
            >
              <Ionicons name="chevron-back" size={24} color="#3b82f6" />
              <Text className="text-xl text-blue-500">Account</Text>
            </TouchableOpacity>
          ),
        }}
      />
      <Stack.Screen name="newIssue" options={{ headerTitle: "New Issue" }} />
      <Stack.Screen
        name="[issueId]"
        options={{ headerTitle: "Issue Details" }}
      />
    </Stack>
  );
}

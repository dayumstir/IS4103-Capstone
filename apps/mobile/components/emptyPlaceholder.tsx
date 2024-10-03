import { View, Text } from "react-native";
import { FontAwesome } from "@expo/vector-icons";

interface EmptyPlaceholderProps {
  message?: string;
}

export default function EmptyPlaceholder({
  message = "No data found",
}: EmptyPlaceholderProps) {
  return (
    <View className="min-h-96 flex-1 items-center justify-center">
      <FontAwesome name="inbox" size={72} color="#93c5fd" />
      <Text className="text-center text-lg text-gray-500">{message}</Text>
    </View>
  );
}

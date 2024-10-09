import { View, Text } from "react-native";
import { formatCurrency } from "../../utils/formatCurrency";
import Feather from "@expo/vector-icons/Feather";
import { ActivityIndicator, Button } from "@ant-design/react-native";

export default function VerifyPurchaseScreen({
  merchantName,
  price,
  isLoading,
  onNext,
  onCancel,
}: {
  merchantName: string;
  price: number;
  isLoading: boolean;
  onNext: () => void;
  onCancel: () => void;
}) {
  return (
    <View className="flex-1 items-center justify-center gap-16 bg-blue-600 px-12">
      <View className="flex flex-col items-center justify-center gap-4">
        <Feather name="credit-card" size={64} color="white" />
        <Text className="text-lg font-semibold text-white">You are paying</Text>
      </View>

      <View className="flex flex-col items-center justify-center gap-8 pb-12">
        {isLoading ? (
          <View className="my-4">
            <ActivityIndicator size="large" color="white" />
          </View>
        ) : (
          <>
            <Text className="text-3xl font-bold text-white">
              {merchantName}
            </Text>
            <Text className="text-6xl font-bold text-white">
              {formatCurrency(price)}
            </Text>
          </>
        )}
      </View>

      <View className="flex w-full gap-4">
        <Button onPress={onNext}>
          <Text className="font-semibold text-blue-500">Next</Text>
        </Button>

        <Button type="ghost" onPress={onCancel}>
          <Text className="font-semibold text-white">Cancel</Text>
        </Button>
      </View>
    </View>
  );
}

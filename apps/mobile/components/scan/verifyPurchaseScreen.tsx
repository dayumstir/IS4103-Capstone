import { View, Text, TouchableOpacity } from "react-native";
import { formatCurrency } from "../../utils/formatCurrency";
import Feather from "@expo/vector-icons/Feather";

export default function VerifyPurchaseScreen({
  merchantName,
  price,
  onNext,
  onCancel,
}: {
  merchantName: string;
  price: number;
  onNext: () => void;
  onCancel: () => void;
}) {
  return (
    <View className="flex-1 items-center justify-center gap-4 bg-blue-600 px-16">
      <Feather name="credit-card" size={48} color="white" />
      <Text className="text-center text-lg text-white">You are paying</Text>
      <Text className="text-3xl font-bold text-white">{merchantName}</Text>
      <Text className="py-8 text-5xl font-bold text-white">
        {formatCurrency(price)}
      </Text>

      <View className="flex w-full gap-4">
        <TouchableOpacity
          className="w-full rounded-md bg-white p-3 shadow-sm"
          onPress={onNext}
        >
          <Text className="text-center text-lg font-semibold text-blue-600">
            Next
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          className="w-full rounded-md border-2 border-white bg-transparent p-3"
          onPress={onCancel}
        >
          <Text className="rounded-md text-center text-lg font-semibold text-white">
            Cancel
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

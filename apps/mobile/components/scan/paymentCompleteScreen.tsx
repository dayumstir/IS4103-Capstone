import { View, Text, TouchableOpacity } from "react-native";
import Feather from "@expo/vector-icons/Feather";
import AntDesign from "@expo/vector-icons/AntDesign";
import { ITransaction } from "../../interfaces/transactionInterface";
import { formatCurrency } from "../../utils/formatCurrency";

export default function PaymentCompleteScreen({
  transaction,
  merchantName,
  onViewPaymentHistory,
  onBackToHome,
}: {
  transaction: ITransaction;
  merchantName: string;
  onViewPaymentHistory: () => void;
  onBackToHome: () => void;
}) {
  return (
    <View className="flex-1 items-center justify-center bg-blue-600 p-8">
      <View className="w-full max-w-md rounded-3xl bg-white p-6 shadow-lg">
        <View className="mb-6 items-center justify-center">
          <Feather name="check-circle" size={60} color="#2563eb" />
        </View>

        <Text className="mb-2 text-center text-3xl font-bold">
          Payment Successful!
        </Text>
        <Text className="mb-6 text-center text-gray-600">
          Your transaction has been processed.
        </Text>

        {/* TODO: Use instalment? (first payment) or full amount */}
        <View className="mb-6 rounded-xl bg-gray-50 p-4">
          <Text className="mb-4 font-semibold">Transaction Details</Text>
          <View className="flex-row flex-wrap">
            <Text className="w-1/2 pb-2 text-gray-600">Amount:</Text>
            <Text className="w-1/2 pb-2 font-medium">
              {formatCurrency(transaction.amount)}
            </Text>
            <Text className="w-1/2 pb-2 text-gray-600">To:</Text>
            <Text className="w-1/2 pb-2 font-medium">{merchantName}</Text>
            <Text className="w-1/2 pb-2 text-gray-600">Date:</Text>
            <Text className="w-1/2 font-medium">
              {new Date(transaction.date).toLocaleDateString()}
            </Text>
            <Text className="w-1/2 pb-2 text-gray-600">Transaction ID:</Text>
            <Text className="w-1/2 pb-2 font-medium">
              {transaction.transaction_id}
            </Text>
          </View>
        </View>

        <View className="flex-col gap-3">
          <TouchableOpacity
            className="w-full rounded-md bg-blue-600 p-3"
            onPress={onViewPaymentHistory}
          >
            <Text className="text-center font-semibold text-white">
              View Payment History
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            className="w-full flex-row items-center justify-center rounded-md border border-gray-300 bg-white p-2.5"
            onPress={onBackToHome}
          >
            <AntDesign name="arrowleft" size={16} className="mr-2" />
            <Text className="font-semibold">Back to Home</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

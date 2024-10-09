import { View, Text } from "react-native";
import Feather from "@expo/vector-icons/Feather";
import AntDesign from "@expo/vector-icons/AntDesign";
import { ITransaction } from "@repo/interfaces";
import { formatCurrency } from "../../utils/formatCurrency";
import { format } from "date-fns";
import { Button } from "@ant-design/react-native";

export default function TransactionCompleteScreen({
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
    <View className="flex-1 items-center justify-center bg-blue-500 p-4">
      <View className="w-full max-w-md rounded-3xl bg-white p-8 shadow">
        <View className="mb-6 items-center justify-center">
          <Feather name="check-circle" size={60} color="#3b82f6" />
        </View>

        <Text className="mb-2 text-center text-3xl font-bold">
          Transaction Successful!
        </Text>
        <Text className="mb-6 text-center text-gray-600">
          Your transaction has been processed.
        </Text>

        {/* ===== Transaction Details ===== */}
        <View className="mb-6 rounded-xl bg-gray-100 p-4">
          <Text className="mb-4 font-semibold">Transaction Details</Text>
          <View className="flex-row flex-wrap">
            <Text className="w-1/2 pb-3 text-gray-600">Total Amount:</Text>
            <Text className="w-1/2 pb-3 font-medium">
              {formatCurrency(transaction.amount)}
            </Text>
            
            <Text className="w-1/2 pb-3 text-gray-600">To:</Text>
            <Text className="w-1/2 pb-3 font-medium">{merchantName}</Text>
            
            <Text className="w-1/2 pb-3 text-gray-600">Date:</Text>
            <Text className="w-1/2 font-medium">
              {format(new Date(transaction.date_of_transaction), "dd MMM yyyy")}
            </Text>
            
            <Text className="w-1/2 pb-3 text-gray-600">Transaction ID:</Text>
            <Text className="w-1/2 pb-3 font-medium">
              {transaction.transaction_id}
            </Text>
          </View>
        </View>

        <View className="flex-col gap-3">
          <Button type="primary" onPress={onViewPaymentHistory}>
            <Text className="text-center font-semibold text-white">
              View Transaction History
            </Text>
          </Button>
          <Button type="ghost" onPress={onBackToHome}>
            <AntDesign
              name="arrowleft"
              size={16}
              color="#3b82f6"
              className="mr-2"
            />
            <Text className="font-semibold text-blue-500">Back to Home</Text>
          </Button>
        </View>
      </View>
    </View>
  );
}

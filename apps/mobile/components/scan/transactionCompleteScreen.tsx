import { View, Text } from "react-native";
import AntDesign from "@expo/vector-icons/AntDesign";
import { TransactionResult } from "@repo/interfaces";
import { formatCurrency } from "../../utils/formatCurrency";
import { format } from "date-fns";
import { Button } from "@ant-design/react-native";

export default function TransactionCompleteScreen({
  transaction,
  merchantName,
  onViewPaymentHistory,
  onBackToHome,
}: {
  transaction: TransactionResult;
  merchantName: string;
  onViewPaymentHistory: () => void;
  onBackToHome: () => void;
}) {
  return (
    <View className="flex-1 items-center justify-center bg-green-500 p-4">
      <View className="w-full max-w-md rounded-3xl bg-white p-8 shadow">
        <View className="mb-6 items-center justify-center">
          <AntDesign name="checkcircle" size={60} color="#22c55e" />
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
            <Text className="w-2/5 pb-3 text-gray-600">Total Amount:</Text>
            <Text className="w-3/5 pb-3 font-medium">
              {formatCurrency(transaction.amount)}
            </Text>

            <Text className="w-2/5 pb-3 text-gray-600">Merchant:</Text>
            <Text
              className="w-3/5 pb-3 font-medium"
              numberOfLines={1}
              ellipsizeMode="tail"
            >
              {merchantName}
            </Text>

            <Text className="w-2/5 text-gray-600">Date:</Text>
            <Text className="w-3/5 font-medium">
              {format(transaction.date_of_transaction, "d MMM yyyy, h:mm a")}
            </Text>

            {/* ===== Divider ===== */}
            <View className="my-3 h-px w-full bg-gray-300" />

            <Text className="w-2/5 pb-3 text-gray-600">Payments:</Text>
            <Text className="w-3/5 pb-3 font-medium">
              {transaction.instalment_plan.number_of_instalments} instalments
            </Text>

            <Text className="w-2/5 pb-3 text-gray-600">Payment Freq:</Text>
            <Text className="w-3/5 pb-3 font-medium">
              {`${(
                (transaction.instalment_plan.time_period * 7) /
                transaction.instalment_plan.number_of_instalments
              ).toFixed(1)} days`}
            </Text>

            <Text className="w-2/5 pb-3 text-gray-600">First Payment:</Text>
            <Text className="w-3/5 pb-3 font-medium">
              {format(
                transaction.instalment_payments[0].due_date,
                "d MMM yyyy, h:mm a",
              )}
            </Text>

            <Text className="w-2/5 pb-3 text-gray-600">Transaction ID:</Text>
            <Text
              className="w-3/5 font-medium"
              numberOfLines={1}
              ellipsizeMode="tail"
            >
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

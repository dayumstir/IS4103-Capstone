import { IssueStatus } from "@repo/interfaces";
import { View, Text } from "react-native";
import AntDesign from "@expo/vector-icons/AntDesign";

export const IssueStatusBadge = ({ status }: { status: IssueStatus }) => {
  switch (status) {
    case IssueStatus.PENDING_OUTCOME:
      return (
        <View className="flex-row items-center gap-1 self-start rounded-full border border-orange-500 bg-orange-100 px-2 py-1">
          <AntDesign name="clockcircleo" size={12} color="#f97316" />
          <Text className="text-xs font-semibold text-orange-500">Pending</Text>
        </View>
      );
    case IssueStatus.RESOLVED:
      return (
        <View className="flex-row items-center gap-1 self-start rounded-full border border-green-500 bg-green-100 px-2 py-1">
          <AntDesign name="checkcircleo" size={12} color="#22c55e" />
          <Text className="text-xs font-semibold text-green-500">Resolved</Text>
        </View>
      );
    case IssueStatus.CANCELLED:
      return (
        <View className="flex-row items-center gap-1 self-start rounded-full border border-red-500 bg-red-100 px-2 py-1">
          <AntDesign name="closecircleo" size={12} color="#ef4444" />
          <Text className="text-xs font-semibold text-red-500">Cancelled</Text>
        </View>
      );
    default:
      return (
        <View className="self-start rounded-full border border-black bg-gray-100 px-2 py-1">
          <Text className="text-xs font-semibold text-black">Unknown</Text>
        </View>
      );
  }
};

import { Text, View, ScrollView, TouchableOpacity } from "react-native";
import { router } from "expo-router";
import { useGetAllIssuesQuery } from "../../../../../redux/services/issueService";
import { ActivityIndicator, Button } from "@ant-design/react-native";
import { format } from "date-fns";
import AntDesign from "@expo/vector-icons/AntDesign";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { IssueStatusBadge } from "../../../../../components/issueStatusBadge";
import { useSelector } from "react-redux";
import { RootState } from "../../../../../redux/store";

export default function AllIssuesPage() {
  const { profile } = useSelector((state: RootState) => state.customer);
  const {
    data: issues,
    isLoading,
    error,
  } = useGetAllIssuesQuery({ customer_id: profile!.customer_id.toString() });

  if (isLoading) {
    return (
      <View className="flex-1 items-center justify-center">
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (error) {
    return (
      <View className="flex-1 items-center justify-center">
        <Text className="px-16 text-center text-lg font-semibold text-red-500">
          Error loading issues. Please close this page and try again.
        </Text>
      </View>
    );
  }

  return (
    <View className="flex-1 p-4">
      {/* ===== Header ===== */}
      <View className="flex flex-row justify-between">
        <Text className="my-auto text-2xl font-semibold">
          Total Issues: {issues?.length}
        </Text>
        <Button
          type="primary"
          onPress={() => router.push("/account/issue/newIssue")}
        >
          <Text className="text-center font-semibold text-white">
            New Issue
          </Text>
          <MaterialCommunityIcons
            name="circle-edit-outline"
            size={18}
            color="white"
            className="ml-2"
          />
        </Button>
      </View>

      {/* ===== List of Issues ===== */}
      <ScrollView className="mt-4">
        <View className="rounded-lg bg-white px-8 py-4">
          {issues &&
            issues.length > 0 &&
            issues.map((issue, index) => (
              <View
                key={issue.issue_id}
                className={`flex-row items-center justify-between py-4 ${
                  index !== issues.length - 1 ? "border-b border-gray-200" : ""
                }`}
              >
                {/* ===== Issue Details ===== */}
                <View className="flex-1 gap-1">
                  <Text className="text-lg font-semibold">{issue.title}</Text>
                  <Text className="pb-1 text-sm text-gray-600">
                    {format(issue.create_time, "dd MMM yyyy")}
                  </Text>
                  <IssueStatusBadge status={issue.status} />
                </View>

                {/* ===== View Details Button ===== */}
                <TouchableOpacity
                  className="ml-4 flex-row items-center gap-1 rounded-md border border-blue-500 px-4 py-2"
                  onPress={() =>
                    router.push(`/account/issue/${issue.issue_id}`)
                  }
                >
                  <Text className="text-center text-sm font-semibold text-blue-500">
                    View Details
                  </Text>
                  <AntDesign name="right" size={12} color="#3b82f6" />
                </TouchableOpacity>
              </View>
            ))}
        </View>
      </ScrollView>
    </View>
  );
}

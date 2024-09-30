import { View, Text, ScrollView, Image } from "react-native";
import { ActivityIndicator } from "@ant-design/react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useGetIssueByIdQuery } from "../../../../../redux/services/issueService";
import { IssueStatusBadge } from "../../../../../components/issueStatusBadge";
import { format } from "date-fns";

export default function IssueDetailsPage() {
  const router = useRouter();
  const { issueId } = useLocalSearchParams<{ issueId: string }>();
  const { data: issue, isLoading, error } = useGetIssueByIdQuery(issueId);

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
        <Text>Error loading issue details</Text>
      </View>
    );
  }

  if (!issue) {
    return (
      <View className="flex-1 items-center justify-center">
        <Text>Error: Issue not found</Text>
      </View>
    );
  }

  return (
    <ScrollView>
      <View className="m-4 flex-1 gap-4 rounded-lg bg-white p-4">
        <View className="border-b border-gray-200 pb-4">
          <Text className="text-2xl font-bold">Issue Details</Text>
        </View>

        <View className="flex-row items-center justify-between">
          <Text className="text-2xl font-semibold">{issue.title}</Text>
          <IssueStatusBadge status={issue.status} />
        </View>

        <Text className="text-sm text-gray-500">
          Date Created: {format(issue.create_time, "dd MMM yyyy")}
        </Text>

        <Text className="pb-4">{issue.description}</Text>

        {issue.merchant_id && (
          <Text className="font-semibold">Merchant: {issue.merchant_id}</Text>
        )}

        <Text className="font-semibold">
          {/* TODO: Replace with actual transaction ID */}
          Transaction ID: clh9tuuqh0000356g4r11fk1x
        </Text>

        {/* ===== Attached Images ===== */}
        {issue.images && issue.images.length > 0 && (
          <View>
            <Text className="mb-2 font-semibold">Supporting Images:</Text>
            <View className="flex-row flex-wrap">
              {issue.images.map((image, index) => (
                <View key={index} className="m-2">
                  <Image
                    source={{
                      uri: `data:image/jpeg;base64,${image.toString("base64")}`,
                    }}
                    className="h-24 w-24 rounded-md border border-gray-300"
                  />
                </View>
              ))}
            </View>
          </View>
        )}
      </View>
    </ScrollView>
  );
}

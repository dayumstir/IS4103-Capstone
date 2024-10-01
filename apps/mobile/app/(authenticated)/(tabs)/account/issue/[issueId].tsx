import { View, Text, ScrollView, Image, TouchableOpacity } from "react-native";
import { ActivityIndicator } from "@ant-design/react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useGetIssueByIdQuery } from "../../../../../redux/services/issueService";
import { IssueStatusBadge } from "../../../../../components/issueStatusBadge";
import { format } from "date-fns";
import { Buffer } from "buffer";

function getImageMimeType(buffer: Buffer): string {
  const signature = buffer.toString("hex", 0, 4);
  switch (signature) {
    case "ffd8ffe0":
    case "ffd8ffe1":
    case "ffd8ffe2":
      return "image/jpeg";
    case "89504e47":
      return "image/png";
    default:
      return "image/jpeg";
  }
}

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
      <View className="m-4 flex-1 gap-4 rounded-lg bg-white p-8">
        <View className="border-b border-gray-200 pb-4">
          <Text className="text-2xl font-bold">Issue Details</Text>
        </View>

        <View className="flex flex-row items-center justify-between">
          <View className="flex-1">
            <Text className="break-words text-2xl font-semibold">
              {issue.title}
            </Text>
          </View>
          <View className="ml-4">
            <IssueStatusBadge status={issue.status} />
          </View>
        </View>

        <Text className="text-sm text-gray-500">
          Date Created: {format(issue.create_time, "dd MMM yyyy")}
        </Text>

        <Text className="pb-4">{issue.description}</Text>

        {issue.merchant_id && (
          // TODO: Replace with actual merchant name
          <Text className="font-semibold">Merchant: {issue.merchant_id}</Text>
        )}

        {issue.transaction_id && (
          <Text className="font-semibold">
            Transaction ID: {issue.transaction_id}
          </Text>
        )}

        {/* ===== Attached Images ===== */}
        {issue.images && issue.images.length > 0 && (
          <View>
            <Text className="mb-2 font-semibold">Supporting Images:</Text>
            <View className="flex-row flex-wrap">
              {issue.images.map((image, index) => (
                <TouchableOpacity
                  key={index}
                  className="m-2"
                  onPress={() => {
                    // Open full-screen image viewer
                    router.push({
                      pathname: "/account/issue/imageViewer",
                      params: {
                        imageUri: `data:image/${getImageMimeType(image)};base64,${Buffer.from(image).toString("base64")}`,
                      },
                    });
                  }}
                >
                  <Image
                    source={{
                      uri: `data:image/${getImageMimeType(image)};base64,${Buffer.from(image).toString("base64")}`,
                    }}
                    className="h-24 w-24 rounded-md border border-gray-300"
                  />
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}
      </View>
    </ScrollView>
  );
}

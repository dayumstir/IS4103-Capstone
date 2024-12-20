import {
  View,
  Text,
  ScrollView,
  Image,
  TouchableOpacity,
  Alert,
} from "react-native";
import { ActivityIndicator, Button } from "@ant-design/react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import {
  useCancelIssueMutation,
  useGetIssueByIdQuery,
} from "../../../../../redux/services/issueService";
import { IssueStatusBadge } from "../../../../../components/issueStatusBadge";
import { format } from "date-fns";
import { Buffer } from "buffer";
import { useGetMerchantByIdQuery } from "../../../../../redux/services/merchantService";
import { AntDesign } from "@expo/vector-icons";
import { IssueStatus } from "@repo/interfaces";
import Ionicons from "@expo/vector-icons/Ionicons";

export default function IssueDetailsPage() {
  const router = useRouter();
  const { issueId } = useLocalSearchParams<{ issueId: string }>();
  const { data: issue, isLoading, error } = useGetIssueByIdQuery(issueId);
  const [cancelIssue] = useCancelIssueMutation();

  // Skip if issue.merchant_id doesn't exist
  const { data: merchant } = useGetMerchantByIdQuery(issue?.merchant_id ?? "", {
    skip: !issue?.merchant_id,
  });

  const getImageMimeType = (buffer: Buffer) => {
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
  };

  if (isLoading) {
    return (
      <View className="flex-1 items-center justify-center">
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (error) {
    console.error(error);
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
      <View className="m-4 flex-1 gap-2 rounded-lg bg-white p-8">
        <View className="border-b border-gray-200 pb-4">
          <Text className="text-2xl font-bold">Issue Details</Text>

          {/* ===== Outcome (if any)  ===== */}
          {issue.outcome && (
            <View className="mt-4 rounded-md border-l-4 border-blue-500 bg-blue-100 p-4">
              <View className="mb-2 flex-row items-center">
                <AntDesign
                  name="infocirlceo"
                  size={20}
                  color="#3b82f6"
                  className="mr-2"
                />
                <Text className="text-xl font-semibold">Outcome</Text>
              </View>

              <Text className="text-gray-700">{issue.outcome}</Text>
            </View>
          )}
        </View>

        <View className="mt-2 flex flex-row items-center justify-between">
          <View className="flex-1">
            <Text className="break-words text-2xl font-semibold">
              {issue.title}
            </Text>
          </View>
          <View className="ml-4">
            <IssueStatusBadge status={issue.status} />
          </View>
        </View>

        <View>
          <Text className="text-sm text-gray-600">
            Issue ID: {issue.issue_id}
          </Text>
          <Text className="mt-1 text-sm text-gray-600">
            Date Created: {format(issue.create_time, "d MMM yyyy, h:mm a")}
          </Text>
        </View>

        <Text className="mt-4">{issue.description}</Text>

        {issue.transaction_id && (
          <TouchableOpacity
            onPress={() => router.push(`/payments/${issue.transaction_id}`)}
            className="mt-4 flex-row items-center rounded-md bg-blue-50 p-4"
          >
            <Ionicons
              name="receipt-outline"
              size={24}
              color="#3b82f6"
              className="mr-4"
            />
            <View>
              <Text className="font-medium text-blue-500">
                View Transaction Details
              </Text>
              <Text className="text-xs text-blue-500">
                ID: {issue.transaction_id}
              </Text>
            </View>
            <Ionicons
              name="chevron-forward"
              size={20}
              color="#3b82f6"
              className="ml-auto"
            />
          </TouchableOpacity>
        )}

        {/* ===== Attached Images ===== */}
        {issue.images && issue.images.length > 0 && (
          <View className="mt-4">
            <Text className="mb-2 font-semibold">Supporting Images:</Text>
            <View className="flex flex-row flex-wrap gap-6">
              {issue.images.map((image, index) => (
                <TouchableOpacity
                  key={index}
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
                    className="h-36 w-36 rounded-md border border-gray-300"
                  />
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        {/* ===== Cancel Issue Button ===== */}
        {issue.status === IssueStatus.PENDING_OUTCOME && (
          <View className="mt-6">
            <Button
              type="warning"
              onPress={() => {
                Alert.alert(
                  "Cancel Issue",
                  "Are you sure you want to cancel this issue? \n\n Note: This action cannot be undone.",
                  [
                    {
                      text: "No",
                    },
                    {
                      text: "Yes",
                      style: "destructive",
                      onPress: () => {
                        cancelIssue({ issue_id: issueId });
                        router.replace("/account/issue");
                      },
                    },
                  ],
                );
              }}
            >
              <Text className="text-center font-semibold text-white">
                Cancel Issue
              </Text>
            </Button>
          </View>
        )}
      </View>
    </ScrollView>
  );
}

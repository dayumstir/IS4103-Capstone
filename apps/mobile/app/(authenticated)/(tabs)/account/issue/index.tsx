import {
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  RefreshControl,
} from "react-native";
import { router } from "expo-router";
import { useGetAllIssuesQuery } from "../../../../../redux/services/issueService";
import { ActivityIndicator, Button } from "@ant-design/react-native";
import { format } from "date-fns";
import AntDesign from "@expo/vector-icons/AntDesign";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { IssueStatusBadge } from "../../../../../components/issueStatusBadge";
import { useSelector } from "react-redux";
import { RootState } from "../../../../../redux/store";
import { createMaterialTopTabNavigator } from "@react-navigation/material-top-tabs";
import { IIssue, IssueStatus } from "../../../../../interfaces/issueInterface";
import { useState } from "react";
import EmptyPlaceholder from "../../../../../components/emptyPlaceholder";

export default function AllIssuesPage() {
  const Tab = createMaterialTopTabNavigator();
  const { profile } = useSelector((state: RootState) => state.customer);
  const {
    data: issues,
    isLoading,
    error,
    refetch,
  } = useGetAllIssuesQuery({ customer_id: profile!.customer_id.toString() });

  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = () => {
    setRefreshing(true);
    refetch().then(() => setRefreshing(false));
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
        <Text className="px-16 text-center text-lg font-semibold text-red-500">
          Error loading issues. Please close this page and try again.
        </Text>
      </View>
    );
  }

  const PendingIssuesView = () => (
    <ScrollView
      className="bg-white"
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      <IssueList
        issues={
          issues
            ?.filter((issue) => issue.status === IssueStatus.PENDING_OUTCOME)
            .sort(
              (a, b) =>
                new Date(b.create_time).getTime() -
                new Date(a.create_time).getTime(),
            ) || []
        }
      />
    </ScrollView>
  );

  const ClosedIssuesView = () => (
    <ScrollView
      className="bg-white"
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      <IssueList
        issues={
          issues
            ?.filter(
              (issue) =>
                issue.status === IssueStatus.RESOLVED ||
                issue.status === IssueStatus.CANCELLED,
            )
            .sort(
              (a, b) =>
                new Date(b.create_time).getTime() -
                new Date(a.create_time).getTime(),
            ) || []
        }
      />
    </ScrollView>
  );

  const IssueList = ({ issues }: { issues: IIssue[] }) => (
    <View className="rounded-lg">
      {issues && issues.length > 0 ? (
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
              className="flex-row items-center gap-1 px-2 py-4"
              onPress={() => router.push(`/account/issue/${issue.issue_id}`)}
            >
              <Text className="text-center text-sm font-semibold text-blue-500">
                View Details
              </Text>
              <AntDesign name="right" size={12} color="#3b82f6" />
            </TouchableOpacity>
          </View>
        ))
      ) : (
        <EmptyPlaceholder message="No issues found" />
      )}
    </View>
  );

  return (
    <View className="m-4 flex-1 rounded-lg bg-white p-8">
      {/* ===== Header ===== */}
      <View className="flex flex-row items-center gap-3 pb-4">
        <View className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-500">
          <AntDesign name="warning" size={24} color="white" className="mb-1" />
        </View>
        <Text className="my-auto text-2xl font-bold">My Issues</Text>
      </View>

      {/* ===== Tab Navigation ===== */}
      <View className="flex-1">
        <Tab.Navigator
          screenOptions={{
            tabBarLabelStyle: {
              fontWeight: "600",
              textTransform: "none",
              textAlign: "center",
              fontSize: 14,
            },
            tabBarItemStyle: {
              width: (Dimensions.get("window").width - 80) / 2,
            },
          }}
        >
          <Tab.Screen name="Pending" component={PendingIssuesView} />
          <Tab.Screen name="Closed" component={ClosedIssuesView} />
        </Tab.Navigator>
      </View>

      {/* ===== New Issue Button ===== */}
      <View className="mt-4">
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
    </View>
  );
}

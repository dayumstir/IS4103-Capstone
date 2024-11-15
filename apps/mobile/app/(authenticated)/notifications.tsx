// apps/mobile/app/notifications.tsx
import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  TextInput,
  Modal,
  ActivityIndicator,
  TouchableWithoutFeedback,
} from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { BlurView } from "expo-blur";
import Toast from "react-native-toast-message";
import { format } from "date-fns";
import {
  useGetCustomerNotificationsQuery,
  useGetNotificationQuery,
  useUpdateNotificationMutation,
} from "../../redux/services/notificationService";
import { NotificationPriority } from "@repo/interfaces";

export default function NotificationsScreen() {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");
  const [refreshing, setRefreshing] = useState(false);
  const [selectedNotificationId, setSelectedNotificationId] = useState("");
  const [isNotificationModalVisible, setIsNotificationModalVisible] = useState(false);

  // Fetch customer notifications
  const {
    data: notifications,
    isLoading,
    refetch,
  } = useGetCustomerNotificationsQuery(searchTerm);

  // Fetch selected notification details
  const { data: notification, isLoading: isNotificationLoading } =
    useGetNotificationQuery(selectedNotificationId, {
      skip: !selectedNotificationId,
    });

  // Update notification as read
  const [updateNotification] = useUpdateNotificationMutation();

  // Refresh notifications
  const onRefresh = async () => {
    setRefreshing(true);
    try {
      await refetch();
    } catch (error) {
      console.error("Error refreshing notifications:", error);
    } finally {
      setRefreshing(false);
    }
  };

  const handleSearchChange = (text: string) => {
    setSearchTerm(text);
  };

  // Handle notification details modal
  const handleViewNotificationDetails = async (notificationId: string) => {
    setSelectedNotificationId(notificationId);
    setIsNotificationModalVisible(true);

    // Mark notification as read if unread
    const notificationToUpdate = notifications?.find(
      (n) => n.notification_id === notificationId
    );

    if (notificationToUpdate && !notificationToUpdate.is_read) {
      try {
        await updateNotification({
          notification_id: notificationId,
          is_read: true,
        }).unwrap();
      } catch (error) {
        console.error("Error marking notification as read:", error);
      }
    }
  };

  // Mark all notifications as read
  const handleMarkAllAsRead = async () => {
    const unreadNotifications =
      notifications?.filter((notification) => !notification.is_read) || [];

    try {
      await Promise.all(
        unreadNotifications.map((notification) =>
          updateNotification({
            notification_id: notification.notification_id,
            is_read: true,
          }).unwrap()
        )
      );
      Toast.show({
        type: "success",
        text1: "All notifications marked as read",
      });
    } catch (error) {
      console.error("Error marking notifications as read:", error);
      Toast.show({
        type: "error",
        text1: "Error marking notifications as read",
      });
    }
  };

  const handleModalClose = () => {
    setIsNotificationModalVisible(false);
    setSelectedNotificationId("");
  };

  const handleNavigate = (path: string) => {
    handleModalClose();
    router.push(path);
  };

  return (
    <View className="flex-1 bg-white">
      {/* Header */}
      <View className="m-4 flex-row items-center justify-between">
        <Text className="text-2xl font-bold">Notifications</Text>
        <TouchableOpacity
          onPress={handleMarkAllAsRead}
          disabled={
            !(notifications?.some((notification) => !notification.is_read))
          }
        >
          <Text
            className={`font-semibold ${
              notifications?.some((notification) => !notification.is_read)
                ? "text-blue-500"
                : "text-gray-400"
            }`}
          >
            Mark All as Read
          </Text>
        </TouchableOpacity>
      </View>

      {/* Search Bar */}
      <View className="mx-4 mb-4">
        <View className="flex-row items-center rounded-full border border-gray-300 px-4 py-2">
          <Ionicons name="search" size={20} color="#6b7280" />
          <TextInput
            placeholder="Search notifications"
            value={searchTerm}
            onChangeText={handleSearchChange}
            className="ml-2 flex-1"
          />
        </View>
      </View>

      {/* Notifications List */}
      {isLoading ? (
        <ActivityIndicator size="large" className="mt-4" />
      ) : notifications && notifications.length > 0 ? (
        <ScrollView
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        >
          {notifications.map((notification) => (
            <TouchableOpacity
              key={notification.notification_id}
              onPress={() =>
                handleViewNotificationDetails(notification.notification_id)
              }
              className={`mx-4 mb-2 rounded-lg border ${
                !notification.is_read ? "border-blue-500" : "border-gray-300"
              } p-4`}
            >
              <View className="flex-row items-center justify-between">
                <Text
                  className={`text-lg font-semibold ${
                    !notification.is_read ? "text-blue-700" : "text-gray-800"
                  }`}
                >
                  {notification.title}
                </Text>
                {notification.priority === NotificationPriority.HIGH ? (
                  <Ionicons name="alert-circle" size={20} color="#ef4444" />
                ) : (
                  <Ionicons name="information-circle" size={20} color="#3b82f6" />
                )}
              </View>
              <Text className="mt-1 text-sm text-gray-600">
                {notification.description}
              </Text>
              <Text className="mt-1 text-xs text-gray-500">
                {format(
                  new Date(notification.create_time),
                  "d MMM yyyy, h:mm a"
                )}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      ) : (
        <View className="flex-1 items-center justify-center">
          <Text className="text-gray-500">No notifications found.</Text>
        </View>
      )}

      {/* Notification Details Modal */}
      <Modal
        visible={isNotificationModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={handleModalClose}
      >
        <TouchableWithoutFeedback onPress={handleModalClose}>
          <BlurView
            intensity={50}
            tint="dark"
            style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
          >
            <View className="w-11/12 max-h-3/4 rounded-lg bg-white p-6 shadow-lg">
              <View className="flex-row items-center justify-between">
                <Text className="text-xl font-bold">Notification Details</Text>
                <TouchableOpacity onPress={handleModalClose}>
                  <Ionicons name="close" size={24} color="black" />
                </TouchableOpacity>
              </View>
              {isNotificationLoading ? (
                <ActivityIndicator size="large" className="mt-4" />
              ) : notification ? (
                <ScrollView className="mt-4">
                  <Text className="mb-2 text-lg font-semibold">
                    {notification.title}
                  </Text>
                  <Text className="text-base text-gray-700">
                    {notification.description}
                  </Text>
                  <Text className="mt-4 text-sm text-gray-500">
                    {format(
                      new Date(notification.create_time),
                      "d MMM yyyy, h:mm a"
                    )}
                  </Text>
                  {notification.issue_id && (
                    <TouchableOpacity
                      onPress={() =>
                        handleNavigate(`account/issue/${notification.issue_id}`)
                      }
                      className="mt-4"
                    >
                      <Text className="text-blue-500">View Issue Details</Text>
                    </TouchableOpacity>
                  )}
                </ScrollView>
              ) : (
                <Text className="text-gray-500">Notification not found.</Text>
              )}
            </View>
          </BlurView>
        </TouchableWithoutFeedback>
      </Modal>
    </View>
  );
}

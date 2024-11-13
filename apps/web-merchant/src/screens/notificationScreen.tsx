import {
  Card,
  Table,
  Tag,
  Empty,
  Button,
  Descriptions,
  Modal,
  Input,
} from "antd";
import { format } from "date-fns";
import { INotification } from "@repo/interfaces";
import {
  useGetMerchantNotificationsQuery,
  useGetNotificationQuery,
  useUpdateNotificationMutation,
} from "../redux/services/notification";
import { useState } from "react";
import { EyeOutlined, RightOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
const { Search } = Input;

enum NotificationPriority {
  HIGH = "HIGH",
  LOW = "LOW",
}

export default function NotificationsScreen() {
  const navigate = useNavigate();

  const [searchTerm, setSearchTerm] = useState("");
  const { data: notifications, isLoading } =
    useGetMerchantNotificationsQuery(searchTerm);

  const [selectedNotificationId, setSelectedNotificationId] = useState("");
  const { data: notification } = useGetNotificationQuery(
    selectedNotificationId ?? "",
    {
      skip: !selectedNotificationId,
    },
  );

  const [updateNotification] = useUpdateNotificationMutation();

  const [isNotificationModalVisible, setIsNotificationModalVisible] =
    useState(false);

  const handleSearch = (value: string) => {
    setSearchTerm(value);
  };

  const handleViewNotificationDetails = (notification: INotification) => {
    setSelectedNotificationId(notification.notification_id);
    setIsNotificationModalVisible(true);
    updateNotification({
      ...notification,
      is_read: true,
    });
  };

  const handleMarkAllAsRead = async () => {
    const unreadNotifications =
      notifications?.filter((notification) => !notification.is_read) || [];

    try {
      await Promise.all(
        unreadNotifications.map((notification) =>
          updateNotification({
            ...notification,
            is_read: true,
          }),
        ),
      );
    } catch (error) {
      console.error("Error marking notifications as read:", error);
    }
  };

  const columns = [
    {
      title: "Title",
      dataIndex: "title",
      key: "title",
      render: (text: string, record: INotification) => (
        <span className={!record.is_read ? "font-bold" : ""}>{text}</span>
      ),
    },
    {
      title: "Description",
      dataIndex: "description",
      key: "description",
      render: (text: string, record: INotification) => (
        <span className={!record.is_read ? "font-bold" : ""}>{text}</span>
      ),
    },
    {
      title: "Created At",
      dataIndex: "create_time",
      key: "create_time",
      render: (date: string, record: INotification) => (
        <span className={!record.is_read ? "font-bold" : ""}>
          {format(new Date(date), "d MMM yyyy, h:mm a")}
        </span>
      ),
      sorter: (a: INotification, b: INotification) =>
        new Date(a.create_time).getTime() - new Date(b.create_time).getTime(),
    },
    {
      title: "Priority",
      dataIndex: "priority",
      key: "priority",
      render: (priority: NotificationPriority) => (
        <Tag color={priority === NotificationPriority.HIGH ? "red" : "blue"}>
          {priority}
        </Tag>
      ),
      filters: [
        { text: "HIGH", value: NotificationPriority.HIGH },
        { text: "LOW", value: NotificationPriority.LOW },
      ],
      onFilter: (value: React.Key | boolean, record: INotification) =>
        record.priority === value,
    },
    {
      title: "Actions",
      key: "actions",
      render: (notification: INotification) => (
        <Button
          onClick={() => handleViewNotificationDetails(notification)}
          icon={<EyeOutlined />}
        >
          View Details
        </Button>
      ),
    },
  ];

  return (
    <div className="w-full">
      <Card>
        <div className="flex items-center justify-between pb-4">
          <h1 className="text-2xl font-bold">Notifications</h1>
          <Button
            type="primary"
            onClick={handleMarkAllAsRead}
            disabled={
              !notifications?.some((notification) => !notification.is_read)
            }
          >
            Mark All as Read
          </Button>
        </div>

        <Search
          placeholder="Search notifications"
          onSearch={handleSearch}
          style={{ marginBottom: 16 }}
        />

        {/* ===== Notifications Table ===== */}
        <Table
          columns={columns}
          dataSource={notifications}
          loading={isLoading}
          rowKey="notification_id"
          locale={{
            emptyText: <Empty description="No notifications found" />,
          }}
          rowClassName={(record) => (!record.is_read ? "bg-blue-50" : "")}
        />
      </Card>

      <Modal
        title="Notification Details"
        open={isNotificationModalVisible}
        onCancel={() => setIsNotificationModalVisible(false)}
        footer={null}
      >
        <Descriptions bordered column={1}>
          <Descriptions.Item label="Title">
            {notification?.title}
          </Descriptions.Item>
          <Descriptions.Item label="Description">
            {notification?.description}
          </Descriptions.Item>
          <Descriptions.Item label="Priority">
            <Tag
              color={
                notification?.priority === NotificationPriority.HIGH
                  ? "red"
                  : "blue"
              }
            >
              {notification?.priority}
            </Tag>
          </Descriptions.Item>
          <Descriptions.Item label="Created At">
            {notification?.create_time &&
              format(new Date(notification.create_time), "PPpp")}
          </Descriptions.Item>
          {notification?.transaction_id && (
            <Descriptions.Item label="Related Transaction">
              <Button
                type="link"
                onClick={() =>
                  navigate(
                    `/business-management/transactions/${notification?.transaction_id}`,
                  )
                }
              >
                View Transaction Details
                <RightOutlined />
              </Button>
            </Descriptions.Item>
          )}
          {notification?.issue_id && (
            <Descriptions.Item label="Related Issue">
              <Button
                type="link"
                onClick={() =>
                  navigate(
                    `/business-management/issues/${notification?.issue_id}`,
                  )
                }
              >
                View Issue Details
                <RightOutlined />
              </Button>
            </Descriptions.Item>
          )}
        </Descriptions>
      </Modal>
    </div>
  );
}

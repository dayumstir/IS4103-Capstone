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
} from "../redux/services/notification";
import { useState } from "react";
import { EyeOutlined } from "@ant-design/icons";

const { Search } = Input;

enum NotificationPriority {
  HIGH = "HIGH",
  LOW = "LOW",
}

export default function NotificationsScreen() {
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

  const [isNotificationModalVisible, setIsNotificationModalVisible] =
    useState(false);

  const columns = [
    {
      title: "Notification ID",
      dataIndex: "notification_id",
      key: "notification_id",
    },
    {
      title: "Title",
      dataIndex: "title",
      key: "title",
    },
    {
      title: "Description",
      dataIndex: "description",
      key: "description",
    },
    {
      title: "Created At",
      dataIndex: "create_time",
      key: "create_time",
      render: (date: string) => format(new Date(date), "d MMM yyyy, h:mm a"),
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
          onClick={() => {
            setSelectedNotificationId(notification.notification_id);
            setIsNotificationModalVisible(true);
          }}
          icon={<EyeOutlined />}
        >
          View Details
        </Button>
      ),
    },
  ];

  const handleSearch = (value: string) => {
    setSearchTerm(value);
  };

  return (
    <div className="w-full px-8 py-4">
      <Card>
        <div className="flex items-center justify-between pb-4">
          <h1 className="text-2xl font-bold">Notifications</h1>
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
        </Descriptions>
      </Modal>
    </div>
  );
}

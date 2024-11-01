import React, { useState } from "react";
import {
  Spin,
  Popconfirm,
  Button,
  Card,
  Table,
  Empty,
  Tag,
  Input,
  Image,
  Form,
  Modal,
  Descriptions,
  message,
  Select,
} from "antd";
import {
  useCreateNotificationMutation,
  useGetAllNotificationsQuery,
  useViewNotificationDetailsQuery,
} from "../redux/services/notificationService";
import {
  INotification,
  NotificationPriority,
} from "@repo/interfaces/notificationInterface";
import { useViewCustomerProfileQuery } from "../redux/services/customerService";
import { useViewMerchantProfileQuery } from "../redux/services/merchantService";
import { useViewAdminProfileQuery } from "../redux/services/adminService";
import { Link } from "react-router-dom";
import { PlusOutlined } from "@ant-design/icons";

const { Search } = Input;

const NotificationsScreen = () => {
  const adminId = localStorage.getItem("adminId") as string;
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isCreateModalVisible, setCreateModalVisible] = useState(false);
  const [form] = Form.useForm();
  const [isModified, setIsModified] = useState(false);
  const [currentNotification, setCurrentNotification] =
    useState<INotification | null>(null);
  const { data: notifications } = useGetAllNotificationsQuery(searchTerm);
  const [currentCustomerId, setCurrentCustomerId] = useState("");
  const { data: currentCustomer } = useViewCustomerProfileQuery(
    currentCustomerId,
    { skip: !currentCustomerId },
  );
  const [currentMerchantId, setCurrentMerchantId] = useState("");
  const { data: currentMerchant } = useViewMerchantProfileQuery(
    currentMerchantId,
    { skip: !currentMerchantId },
  );
  const [currentNotificationId, setCurrentNotificationId] = useState("");
  const { data: notification } = useViewNotificationDetailsQuery(
    currentNotificationId,
    {
      skip: !currentNotificationId,
    },
  );
  const [currentAdminId, setCurrentAdminId] = useState("");
  const { data: currentAdmin } = useViewAdminProfileQuery(currentAdminId, {
    skip: !currentAdminId,
  });
  const [createNotification] = useCreateNotificationMutation();

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const showNotificationModal = (notification: INotification) => {
    setCurrentNotification(notification);
    setCurrentNotificationId(notification.notification_id);
    form.setFieldsValue(notification);
    setIsModalVisible(true);
  };

  const handleCreateNotification = async (
    values: Omit<INotification, "notification_id">,
  ) => {
    try {
      const result = await createNotification(values).unwrap();
      message.success(`New notification "${result.title}" has been created.`);
      form.resetFields();
    } catch (error) {
      console.error("Error creating notification:", error);
      message.error("Failed to create notification");
    }
  };

 

  const columns = [
    {
      title: "Title",
      dataIndex: "title",
      key: "title",
      sorter: (a: INotification, b: INotification) =>
        a.title.localeCompare(b.title),
      width: 350,
    },
    {
      title: "Description",
      dataIndex: "description",
      key: "description",
      width: 500,
      render: (text: string) => (
        <div
          style={{
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
            maxWidth: "400px", // Ensure this matches the column width
          }}
        >
          {text}
        </div>
      ),
    },
    {
      title: "Sent to",
      dataIndex: "user",
      key: "user",
      width: 350,
      filters: [
        { text: "Customer", value: "customer" },
        { text: "Merchant", value: "merchant" },
      ],
      onFilter: (value, record: INotification) => {
        if (value === "customer") {
          return !!record.customer_id;
        }
        return (
          value === "merchant" && !record.customer_id && !!record.merchant_id
        );
      },
      render: (text, record: INotification) => {
        if (record && record.customer_id) {
          setCurrentCustomerId(record.customer_id);
        }
        if (record && record.merchant_id) {
          setCurrentMerchantId(record.merchant_id);
        }
        if (record && record.admin_id) {
          setCurrentAdminId(record.admin_id);
        }
        if (record.customer_id && record.merchant_id) {
          return (
            <>
              <Tag>Customer</Tag>
              {currentCustomer?.email}
            </>
          );
        } else if (record.customer_id) {
          return (
            <>
              <Tag>Customer</Tag>
              {currentCustomer?.email}
            </>
          );
        } else if (record.merchant_id) {
          return (
            <>
              <Tag>Merchant</Tag>
              {currentMerchant?.email}
            </>
          );
        }
        return null;
      },
    },
    {
      title: "Priority",
      dataIndex: "priority",
      key: "priority",
      width: 200,
      filters: [
        { text: "High", value: "HIGH" },
        { text: "Low", value: "LOW" },
      ],
      onFilter: (value: string, record: INotification) =>
        record.priority === value,
      render: (text: string) => {
        let color = "geekblue";
        switch (text) {
          case "HIGH":
            color = "volcano";
            break;
        }
        return <Tag color={color}>{text}</Tag>;
      },
    },
    {
      key: "actions",
      width: 1,
      render: (text: string, record: INotification) => (
        <div className="whitespace-nowrap">
          <Button onClick={() => showNotificationModal(record)}>
            View Details
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="w-full px-8 py-4">
      <Card title="View All Notifications">
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 16,
          }}
        >
          <Search
            placeholder="Search by title"
            onChange={handleSearchChange}
            value={searchTerm}
            style={{ marginRight: "16px", flexGrow: 1 }}
          />
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => setCreateModalVisible(true)}
          >
            Create Notification
          </Button>
        </div>
        <Table
          dataSource={notifications}
          columns={columns}
          locale={{
            emptyText: <Empty description="No notifications found"></Empty>,
          }}
        />
      </Card>
      <Modal
        title="Notification Details"
        visible={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        width={1000}
      >
        <Descriptions bordered column={2}>
          <Descriptions.Item label="Title" span={2}>
            {currentNotification?.title}
          </Descriptions.Item>
          <Descriptions.Item label="Description" span={2}>
            {currentNotification?.description}
          </Descriptions.Item>
          <Descriptions.Item label="Priority" span={2}>
            {currentNotification?.priority}
          </Descriptions.Item>
          <Descriptions.Item label="Time Created">
            {currentNotification?.create_time &&
              new Date(currentNotification?.create_time).toDateString()}
            ,{" "}
            {currentNotification?.create_time &&
              new Date(currentNotification?.create_time).toLocaleTimeString()}
          </Descriptions.Item>
          {currentMerchant?.merchant_id && (
            <Descriptions.Item label="Merchant" span={2}>
              <Link to={`/admin/merchant/${currentMerchant.merchant_id}`}>
                {currentMerchant.name}
              </Link>
            </Descriptions.Item>
          )}
          {currentCustomer?.customer_id && (
            <Descriptions.Item label="Customer" span={2}>
              <Link to={`/admin/customer/${currentCustomer.customer_id}`}>
                {currentCustomer.name}
              </Link>
            </Descriptions.Item>
          )}
          {currentAdmin?.admin_id && (
            <Descriptions.Item label="Admin" span={2}>
              {currentAdmin.name}
            </Descriptions.Item>
          )}
        </Descriptions>
      </Modal>
      <Modal
    title="Create New Notification"
    visible={isCreateModalVisible}
    onCancel={() => setCreateModalVisible(false)}
    footer={null}
  >
    <Form form={form} layout="vertical" onFinish={handleCreateNotification}>
      <Form.Item
        label="Title"
        name="title"
        rules={[{ required: true, message: "Please enter a title" }]}
      >
        <Input />
      </Form.Item>

      <Form.Item
        label="Description"
        name="description"
        rules={[{ required: true, message: "Please enter a description" }]}
      >
        <Input.TextArea />
      </Form.Item>

      <Form.Item
        label="Priority"
        name="priority"
        rules={[{ required: true, message: "Please select a priority" }]}
      >
        <Select>
          <Select.Option value="HIGH">High</Select.Option>
          <Select.Option value="MEDIUM">Medium</Select.Option>
          <Select.Option value="LOW">Low</Select.Option>
        </Select>
      </Form.Item>

      <Form.Item
        label="Customer ID"
        name="customer_id"
        rules={[{ required: false, message: "Enter customer ID if available" }]}
      >
        <Input />
      </Form.Item>

      <Form.Item
        label="Merchant ID"
        name="merchant_id"
        rules={[{ required: false, message: "Enter merchant ID if available" }]}
      >
        <Input />
      </Form.Item>

      <Form.Item>
        <Button type="primary" htmlType="submit">
          Submit
        </Button>
      </Form.Item>
    </Form>
  </Modal>;
    </div>
  );
};

export default NotificationsScreen;

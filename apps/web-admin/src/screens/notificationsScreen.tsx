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
import {
  useGetAllCustomersQuery,
  useViewCustomerProfileQuery,
} from "../redux/services/customerService";
import {
  useGetAllMerchantsQuery,
  useViewMerchantProfileQuery,
} from "../redux/services/merchantService";
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

  const [currentNotificationId, setCurrentNotificationId] = useState("");
  const { data: notification } = useViewNotificationDetailsQuery(
    currentNotificationId,
    {
      skip: !currentNotificationId,
    },
  );
  const { data: currentCustomer } = useViewCustomerProfileQuery(
    currentCustomerId,
    { skip: !currentCustomerId },
  );
  const [currentMerchantId, setCurrentMerchantId] = useState("");
  const { data: currentMerchant } = useViewMerchantProfileQuery(
    currentMerchantId,
    { skip: !currentMerchantId },
  );
  const [currentAdminId, setCurrentAdminId] = useState("");
  const { data: currentAdmin } = useViewAdminProfileQuery(currentAdminId, {
    skip: !currentAdminId,
  });
  const [createNotification] = useCreateNotificationMutation();
  const { data: customerOptions } = useGetAllCustomersQuery(undefined);
  const { data: merchantOptions } = useGetAllMerchantsQuery(undefined);

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const showNotificationModal = (notification: INotification) => {
    setCurrentNotification(notification);
    setCurrentNotificationId(notification.notification_id);
    form.setFieldsValue(notification);
    setIsModalVisible(true);
  };

  const showCreateNotificationModal = () => {
    setCreateModalVisible(true);
    form.resetFields();
    setCurrentCustomerId(""); // Clear previous state
    setCurrentMerchantId("");
  };

  const handleSelectAll = (field, options) => {
    const selectedAll = form.getFieldValue(field).length === options.length;
    form.setFieldsValue({
      [field]: selectedAll ? [] : options.map((option) => option.value),
    });
  };

  const handleCreateNotification = async (values) => {
    const { customer_ids = [], merchant_ids = [], ...restValues } = values;

    try {
      // Create notifications for each selected customer
      const customerNotifications = customer_ids.map((customer_id) => ({
        ...restValues,
        customer_id,
        merchant_id: null, // Ensure only customer is set
      }));

      // Create notifications for each selected merchant
      const merchantNotifications = merchant_ids.map((merchant_id) => ({
        ...restValues,
        merchant_id,
        customer_id: null, // Ensure only merchant is set
      }));

      // Combine customer and merchant notifications
      const allNotifications = [
        ...customerNotifications,
        ...merchantNotifications,
      ];

      // Create all notifications
      await Promise.all(
        allNotifications.map((notification) =>
          createNotification(notification).unwrap(),
        ),
      );

      message.success("Notifications have been created successfully.");
      setCreateModalVisible(false);
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
        if (value === "customer") return !!record.customer_id;
        return value === "merchant" && !!record.merchant_id;
      },
      render: (text, record: INotification) => {
        return (
          <>
            {record.customer_id && (
              <>
                <Tag>Customer</Tag>
                {
                  customerOptions?.find(
                    (c) => c.customer_id === record.customer_id,
                  )?.email
                }
              </>
            )}
            {record.merchant_id && (
              <>
                <Tag>Merchant</Tag>
                {
                  merchantOptions?.find(
                    (m) => m.merchant_id === record.merchant_id,
                  )?.email
                }
              </>
            )}
          </>
        );
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
            onClick={showCreateNotificationModal}
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
          {currentNotification?.merchant_id && (
            <Descriptions.Item label="Merchant" span={2}>
              <Link to={`/admin/merchant/${currentNotification.merchant_id}`}>
                {
                  merchantOptions?.find(
                    (m) => m.merchant_id === currentNotification.merchant_id,
                  )?.name
                }
              </Link>
            </Descriptions.Item>
          )}
          {currentNotification?.customer_id && (
            <Descriptions.Item label="Customer" span={2}>
              <Link to={`/admin/customer/${currentNotification.customer_id}`}>
                {
                  customerOptions?.find(
                    (c) => c.customer_id === currentNotification.customer_id,
                  )?.name
                }
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
              <Select.Option value="LOW">Low</Select.Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="customer_ids"
            label="Customer Email"
            dependencies={["merchant_ids"]}
            rules={[
              {
                validator: (_, value) => {
                  const merchantEmail = form.getFieldValue("merchant_email");
                  if (value || merchantEmail) {
                    return Promise.resolve();
                  }
                  return Promise.reject(
                    new Error(
                      "Please select at least one customer or merchant",
                    ),
                  );
                },
              },
            ]}
          >
            <Select
              mode="multiple"
              showSearch
              placeholder="Select customer(s)"
              onChange={(selected) => {
                // Check if "Select All" was selected
                if (selected.includes("all-customers")) {
                  // Toggle Select All
                  const allCustomerIds = (customerOptions ?? []).map(
                    (customer) => customer.customer_id,
                  );
                  const isAllSelected =
                    selected.length - 1 === allCustomerIds.length;

                  // Set all customer IDs or clear selection based on current state
                  form.setFieldsValue({
                    customer_ids: isAllSelected ? [] : allCustomerIds,
                  });
                } else {
                  // If a regular customer is selected, update form value normally
                  form.setFieldsValue({ customer_ids: selected });
                }
              }}
              options={[
                { label: "Select All Customers", value: "all-customers" },
                ...(customerOptions ?? []).map((customer) => ({
                  label: customer.email,
                  value: customer.customer_id,
                })),
              ]}
            />
          </Form.Item>

          <Form.Item
            name="merchant_ids"
            label="Merchant Email"
            dependencies={["customer_ids"]}
            rules={[
              {
                validator: (_, value) => {
                  const customerEmail = form.getFieldValue("customer_email");
                  if (value || customerEmail) {
                    return Promise.resolve();
                  }
                  return Promise.reject(
                    new Error(
                      "Please select at least one customer or merchant",
                    ),
                  );
                },
              },
            ]}
          >
            <Select
              mode="multiple"
              showSearch
              placeholder="Select merchant(s)"
              onChange={(selected) => {
                if (selected.includes("all-merchants")) {
                  const allMerchantIds = (merchantOptions ?? []).map(
                    (merchant) => merchant.merchant_id,
                  );
                  const isAllSelected =
                    selected.length - 1 === allMerchantIds.length;

                  form.setFieldsValue({
                    merchant_ids: isAllSelected ? [] : allMerchantIds,
                  });
                } else {
                  form.setFieldsValue({ merchant_ids: selected });
                }
              }}
              options={[
                { label: "Select All Merchants", value: "all-merchants" },
                ...(merchantOptions ?? []).map((merchant) => ({
                  label: merchant.email,
                  value: merchant.merchant_id,
                })),
              ]}
            />
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit">
              Submit
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default NotificationsScreen;

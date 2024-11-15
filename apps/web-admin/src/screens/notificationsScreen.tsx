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
import { useGetProfileByIdQuery } from "../redux/services/adminService";
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
  const { data: currentAdmin } = useGetProfileByIdQuery(currentAdminId, {
    skip: !currentAdminId,
  });
  const [createNotification] = useCreateNotificationMutation();
  const { data: customerOptions } = useGetAllCustomersQuery(undefined);
  const { data: merchantOptions } = useGetAllMerchantsQuery(undefined);

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const groupNotifications = (notifications) => {
    return notifications.reduce((acc, notification) => {
      const formattedCreateTime = new Date(notification.create_time)
        .toISOString()
        .slice(0, 19);
      // Find an existing group with the same title, description, and create time
      const existingGroup = acc.find(
        (item) =>
          item.title === notification.title &&
          item.description === notification.description &&
          item.create_time === formattedCreateTime,
      );

      if (existingGroup) {
        // Add the user to the existing group
        if (notification.customer_id) {
          existingGroup.customer_ids.push(notification.customer_id);
        }
        if (notification.merchant_id) {
          existingGroup.merchant_ids.push(notification.merchant_id);
        }
      } else {
        // Create a new group entry if none found
        acc.push({
          ...notification,
          create_time: formattedCreateTime,
          customer_ids: notification.customer_id
            ? [notification.customer_id]
            : [],
          merchant_ids: notification.merchant_id
            ? [notification.merchant_id]
            : [],
        });
      }

      return acc;
    }, []);
  };

  const showNotificationModal = (notification) => {
    setCurrentNotification(notification);
    const isGrouped = notification.customer_ids || notification.merchant_ids;
    setCurrentNotification({
      ...notification,
      customer_ids: isGrouped ? notification.customer_ids : [],
      merchant_ids: isGrouped ? notification.merchant_ids : [],
    });
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

  const groupedNotifications = groupNotifications(notifications || []);

  const handleCreateNotification = async (values) => {
    const { customer_ids = [], merchant_ids = [], ...restValues } = values;

    try {
      // Create a notification for each selected customer
      const customerNotifications = customer_ids.map((customer_id) => ({
        ...restValues,
        customer_id,
        merchant_id: null, // Only set the customer ID, merchant is null
      }));

      // Create a notification for each selected merchant
      const merchantNotifications = merchant_ids.map((merchant_id) => ({
        ...restValues,
        merchant_id,
        customer_id: null, // Only set the merchant ID, customer is null
      }));

      // Combine customer and merchant notifications into a single array
      const allNotifications = [
        ...customerNotifications,
        ...merchantNotifications,
      ];

      // Send each notification to the server individually
      for (const notification of allNotifications) {
        await createNotification(notification).unwrap();
      }

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
      render: (text, record) => {
        const customerCount = record.customer_ids?.length || 0;
        const merchantCount = record.merchant_ids?.length || 0;

        return (
          <>
            {customerCount > 1 && <Tag>{`Customers: ${customerCount}`}</Tag>}
            {merchantCount > 1 && <Tag>{`Merchants: ${merchantCount}`}</Tag>}
            {customerCount === 1 && (
              <Tag>
                Customer:{" "}
                {
                  customerOptions?.find(
                    (c) => c.customer_id === record.customer_ids[0],
                  )?.email
                }
              </Tag>
            )}
            {merchantCount === 1 && (
              <Tag>
                Merchant:{" "}
                {
                  merchantOptions?.find(
                    (m) => m.merchant_id === record.merchant_ids[0],
                  )?.email
                }
              </Tag>
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
          dataSource={groupedNotifications}
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
        footer={null}
      >
        <Descriptions bordered column={2}>
          <Descriptions.Item label="Title" span={2}>
            {currentNotification?.title}
          </Descriptions.Item>
          <Descriptions.Item label="Description" span={2}>
            {currentNotification?.description}
          </Descriptions.Item>
          <Descriptions.Item label="Priority" span={2}>
            <Tag
              color={
                currentNotification?.priority === "HIGH"
                  ? "volcano"
                  : "geekblue"
              }
            >
              {currentNotification?.priority}
            </Tag>
          </Descriptions.Item>
          <Descriptions.Item label="Time Created">
            {currentNotification?.create_time &&
              new Date(currentNotification?.create_time).toDateString()}
            ,{" "}
            {currentNotification?.create_time &&
              new Date(currentNotification?.create_time).toLocaleTimeString()}
          </Descriptions.Item>

          {/* Display the Issue ID as a link if present */}
          {currentNotification?.issue_id && (
            <Descriptions.Item label="Issue ID" span={2}>
              <Link to={`/issue/${currentNotification.issue_id}`}>
                {currentNotification.issue_id}
              </Link>
            </Descriptions.Item>
          )}

          {/* Display the Transaction ID as a link if present */}
          {currentNotification?.transaction_id && (
            <Descriptions.Item label="Transaction ID" span={2}>
              <Link to={`/transaction/${currentNotification.transaction_id}`}>
                {currentNotification.transaction_id}
              </Link>
            </Descriptions.Item>
          )}

          {currentNotification?.customer_ids?.length > 0 && (
            <Descriptions.Item label="Customers" span={2}>
              {currentNotification.customer_ids.map((customerId) => {
                const customer = customerOptions?.find(
                  (c) => c.customer_id === customerId,
                );
                return (
                  <div key={customerId}>
                    {customer?.email ? (
                      <>
                        <Tag>Customer</Tag> {customer.email}
                      </>
                    ) : (
                      <span>Unknown Customer</span>
                    )}
                  </div>
                );
              })}
            </Descriptions.Item>
          )}

          {/* Display the list of merchants */}
          {currentNotification?.merchant_ids?.length > 0 && (
            <Descriptions.Item label="Merchants" span={2}>
              {currentNotification.merchant_ids.map((merchantId) => {
                const merchant = merchantOptions?.find(
                  (m) => m.merchant_id === merchantId,
                );
                return (
                  <div key={merchantId}>
                    {merchant?.email ? (
                      <>
                        <Tag>Merchant</Tag> {merchant.email}
                      </>
                    ) : (
                      <span>Unknown Merchant</span>
                    )}
                  </div>
                );
              })}
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
              ({ getFieldValue }) => ({
                validator(_, value) {
                  const merchantIds = getFieldValue("merchant_ids");
                  if (value?.length || merchantIds?.length) {
                    return Promise.resolve();
                  }
                  return Promise.reject(
                    new Error(
                      "Please select at least one customer or merchant",
                    ),
                  );
                },
              }),
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
              ({ getFieldValue }) => ({
                validator(_, value) {
                  const customerIds = getFieldValue("customer_ids");
                  if (value?.length || customerIds?.length) {
                    return Promise.resolve();
                  }
                  return Promise.reject(
                    new Error(
                      "Please select at least one customer or merchant",
                    ),
                  );
                },
              }),
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

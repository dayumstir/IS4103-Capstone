import { useState, useEffect } from "react";
import {
  Form,
  Input,
  Button,
  Table,
  Card,
  message,
  Popconfirm,
  Empty,
  InputNumber,
  DatePicker,
  FormInstance,
  Modal,
  Descriptions,
  Divider,
  AutoComplete
} from "antd";
import { PlusOutlined, EyeOutlined, StopOutlined } from "@ant-design/icons";

import { 
  useGetVouchersQuery, 
  useCreateVoucherMutation, 
  useDeactivateVoucherMutation,
  useGetVoucherDetailsQuery, 
  useAssignVoucherMutation
} from "../redux/services/voucherService";
import { useGetAllCustomersQuery } from "../redux/services/customerService";
import { IVoucher } from "../interfaces/voucherInterface";

const { Search } = Input;

export default function VoucherScreen() {
  const [form] = Form.useForm();
  const [assignForm] = Form.useForm();
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedVoucherId, setSelectedVoucherId] = useState<string | null>(null);
  const [customerSearch, setCustomerSearch] = useState(""); // State for customer search input
  const [selectedCustomerId, setSelectedCustomerId] = useState<string | null>(null); // For storing selected customer ID

  // Fetch customer data based on search
  const { data: customerOptions, refetch: fetchCustomers } = useGetAllCustomersQuery(customerSearch, {
    skip: !customerSearch, // Don't fetch if the search is empty
  });

  const { data: vouchers, isLoading } = useGetVouchersQuery(searchTerm);
  const [createVoucher] = useCreateVoucherMutation();
  const [deactivateVoucher] = useDeactivateVoucherMutation();
  const [assignVoucher] = useAssignVoucherMutation();

  // Fetch the voucher details
  const { data: voucherDetails, refetch: fetchVoucherDetails } = useGetVoucherDetailsQuery(selectedVoucherId ?? "", {
    skip: !selectedVoucherId, // Only fetch when a voucher is selected
  });

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  // Handle voucher creation
  const handleCreateVoucher = async (newVoucher: Omit<IVoucher, "voucher_id">) => {
    try {
      const result = await createVoucher(newVoucher).unwrap();
      message.success(`New voucher "${result.title}" has been created.`);
      form.resetFields();
    } catch (error) {
      console.error("Error creating voucher:", error);
      message.error("Failed to create voucher");
    }
  };

  // Handle voucher deactivation
  const handleDeactivateVoucher = async (voucher: any) => {
    if (!voucher.is_active) {
      message.warning(`The voucher "${voucher.title}" is already deactivated.`);
      return;
    }

    try {
      await deactivateVoucher(voucher.voucher_id).unwrap();
      message.success(`Voucher "${voucher.title}" has been deactivated.`);
    } catch (error) {
      console.error("Error deactivating voucher:", error);
      message.error("Failed to deactivate voucher");
    }
  };

  // Handle assign voucher to customer
  const handleAssignVoucher = async (values: { customer_name: string }) => {
    if (!selectedVoucherId || !selectedCustomerId) {
      message.error("Customer name is required.");
      return;
    }
    try {
      await assignVoucher({ customer_id: selectedCustomerId, voucher_id: selectedVoucherId }).unwrap();
      message.success(`Voucher assigned to customer "${values.customer_name}".`);
      assignForm.resetFields(); // Clear the form
      fetchVoucherDetails(); // Refetch the voucher details
    } catch (error) {
      console.error("Error assigning voucher:", error);
      message.error("Failed to assign voucher");
    }
  };


  // Open modal and fetch voucher details
  const handleViewDetails = (voucher_id: string) => {
    setSelectedVoucherId(voucher_id);
    setIsModalOpen(true);
    fetchVoucherDetails();
  };

  // Close the modal
  const handleModalClose = () => {
    setIsModalOpen(false);
    setSelectedVoucherId(null);
    setCustomerSearch(""); // Clear the customer search on close
    setSelectedCustomerId(null); // Reset selected customer ID
    assignForm.resetFields(); // Clear the assign form fields
  };

  // When customer search term changes, refetch the customer list
  useEffect(() => {
    if (customerSearch) {
      fetchCustomers();
    }
  }, [customerSearch]);

  // Handle customer selection from AutoComplete
  const handleCustomerSelect = (customerName: string) => {
    const selectedCustomer = customerOptions?.find((customer) => customer.name === customerName);
    if (selectedCustomer) {
      setSelectedCustomerId(selectedCustomer.customer_id);
    }
  };

  const tableColumns = [
    {
      title: "Title",
      dataIndex: "title",
      key: "title",
      sorter: (a: IVoucher, b: IVoucher) => a.title.localeCompare(b.title),
    },
    {
      title: "Description",
      dataIndex: "description",
      key: "description",
    },
    {
      title: "Percentage Discount",
      dataIndex: "percentage_discount",
      key: "percentage_discount",
      render: (discount: number) => `${discount}%`,
      sorter: (a: IVoucher, b: IVoucher) => a.percentage_discount - b.percentage_discount,
    },
    {
      title: "Amount Discount",
      dataIndex: "amount_discount",
      key: "amount_discount",
      render: (amount: number) => `$${amount}`,
      sorter: (a: IVoucher, b: IVoucher) => a.amount_discount - b.amount_discount,
    },
    {
      title: "Expiry Date",
      dataIndex: "expiry_date",
      key: "expiry_date",
      render: (date: string) => new Date(date).toLocaleDateString(),
      sorter: (a: IVoucher, b: IVoucher) => new Date(a.expiry_date).getTime() - new Date(b.expiry_date).getTime(),
    },
    {
      title: "Usage Limit",
      dataIndex: "usage_limit",
      key: "usage_limit",
      sorter: (a: IVoucher, b: IVoucher) => a.usage_limit - b.usage_limit,
    },

    {
      title: "Actions",
      key: "actions",
      width: 1,
      sorter: (a: IVoucher, b: IVoucher) => (a.is_active === b.is_active ? 0 : a.is_active ? -1 : 1),
      render: (text: string, record: any) => (
        <div className="flex flex-col gap-2">
          <Button
            icon={<EyeOutlined />}
            onClick={() => handleViewDetails(record.voucher_id)}
          >
            View Voucher Details
          </Button>
          <Popconfirm
            title={`Are you sure you want to deactivate this voucher?`}
            onConfirm={() => handleDeactivateVoucher(record)}
            okText="Yes"
            cancelText="No"
          >
            <Button icon={<StopOutlined />} danger disabled={!record.is_active}>
              {record.is_active ? "Deactivate" : "Not In Use"}
            </Button>
          </Popconfirm>
        </div>
      ),
    },
  ];

  const assignedVoucherColumns = [
    {
      title: "Customer Name",
      dataIndex: ["customer", "name"],
      key: "customerName",
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
    },
    {
      title: "Date Issued",
      dataIndex: "date_time_issued",
      key: "date_time_issued",
      render: (date: string) => new Date(date).toLocaleDateString(),
    },
    {
      title: "Remaining Uses",
      dataIndex: "remaining_uses",
      key: "remaining_uses",
    },
  ];

  const renderForm = (formInstance: FormInstance) => (
    <Form
      form={formInstance}
      name="voucher"
      onFinish={handleCreateVoucher}
      layout="vertical"
      validateTrigger={['onBlur', 'onSubmit']}
    >
      <div className="grid grid-cols-2 gap-x-8">
        <Form.Item
          name="title"
          label="Voucher Title"
          rules={[{ required: true, message: "Please input the voucher title!" }]}
        >
          <Input />
        </Form.Item>

        <Form.Item
          name="description"
          label="Description"
          rules={[{ required: true, message: "Please input the description!" }]}
        >
          <Input />
        </Form.Item>

        <Form.Item
          name="percentage_discount"
          label="Percentage Discount"
          rules={[
            { required: true, message: "Please input the percentage discount!" },
            {
              type: 'number',
              min: 0,
              max: 100,
              message: "Percentage discount must be between 0 and 100",
            },
          ]}
        >
          <InputNumber className="w-full" step={1} />
        </Form.Item>

        <Form.Item
          name="amount_discount"
          label="Amount Discount"
          rules={[
            { required: true, message: "Please input the amount discount!" },
            {
              type: 'number',
              min: 0,
              message: "Amount discount must be greater than 0",
            },
          ]}
        >
          <InputNumber className="w-full" step={1} />
        </Form.Item>

        <Form.Item
          name="expiry_date"
          label="Expiry Date"
          rules={[{ required: true, message: "Please select the expiry date!" }]}
        >
          <DatePicker className="w-full" />
        </Form.Item>

        <Form.Item
          name="usage_limit"
          label="Usage Limit"
          rules={[
            { required: true, message: "Please input the usage limit!" },
            {
              type: 'number',
              min: 1,
              message: "Usage limit must be greater than 0",
            },
          ]}
        >
          <InputNumber className="w-full" step={1} />
        </Form.Item>

        <Form.Item
          name="terms"
          label="Terms"
          rules={[{ required: true, message: "Please input the terms!" }]}
        >
          <Input />
        </Form.Item>
      </div>

      <Form.Item>
        <Button
          type="primary"
          htmlType="submit"
          icon={<PlusOutlined />}
        >
          Create Voucher
        </Button>
      </Form.Item>

    </Form>
  );

  return (
    <div className="w-full px-8 py-4">
      {/* ===== Create Voucher ===== */}
      <Card className="mb-8 border border-gray-300" title="Create Voucher">
        {renderForm(form)}
      </Card>

      {/* ===== View and Manage Vouchers ===== */}
      <Card className="mb-8 border border-gray-300" title="View and Manage Vouchers">
        <Search
          placeholder="Search by title or description"
          onChange={handleSearchChange}
          value={searchTerm}
          style={{ marginBottom: 16 }}
        />
        <Table
          dataSource={vouchers}
          columns={tableColumns}
          rowKey="voucher_id"
          pagination={{
            current: currentPage,
            pageSize: pageSize,
            total: vouchers ? vouchers.length : 0, // Assuming total count of vouchers is known
            onChange: (page, pageSize) => {
              setCurrentPage(page);
              setPageSize(pageSize);
            },
            showSizeChanger: true, // Show option to change page size
            pageSizeOptions: ['5', '10', '20', '50'], // Page size options
          }}
          loading={isLoading}
          locale={{
            emptyText: <Empty description="No vouchers found"></Empty>,
          }}
        />
      </Card>

      <Modal
        title="Voucher Details"
        open={isModalOpen}
        onCancel={handleModalClose}
        width={1000}
        centered
        footer={false}
      >
        {voucherDetails ? (
          <>
            <Descriptions bordered column={2}>
              <Descriptions.Item label="Title">{voucherDetails.title}</Descriptions.Item>
              <Descriptions.Item label="Description">{voucherDetails.description}</Descriptions.Item>
              <Descriptions.Item label="Percentage Discount">{voucherDetails.percentage_discount}%</Descriptions.Item>
              <Descriptions.Item label="Amount Discount">${voucherDetails.amount_discount}</Descriptions.Item>
              <Descriptions.Item label="Expiry Date">{new Date(voucherDetails.expiry_date).toLocaleDateString()}</Descriptions.Item>
              <Descriptions.Item label="Usage Limit">{voucherDetails.usage_limit}</Descriptions.Item>
              <Descriptions.Item label="Terms">{voucherDetails.terms}</Descriptions.Item>
            </Descriptions>

            <Divider />

            {/* Assigned Vouchers Table */}
            <Table
              columns={assignedVoucherColumns}
              dataSource={voucherDetails.vouchersAssigned}
              rowKey="voucher_assigned_id"
              pagination={false}
              locale={{
                emptyText: <Empty description="No assigned vouchers found" />,
              }}
            />

            <Divider />

            {/* Assign Voucher */}
            {voucherDetails.is_active && (
              <Card className="mb-8 border border-gray-300" title="Assign Voucher">
                <Form
                  form={assignForm}
                  layout="vertical"
                  onFinish={handleAssignVoucher}
                >
                  <Form.Item
                    name="customer_name"
                    label="Customer Name"
                    rules={[{ required: true, message: "Please input the customer name!" }]}
                  >
                    <AutoComplete
                      options={customerOptions?.map((customer) => ({ value: customer.name }))}
                      onSearch={(value) => setCustomerSearch(value)}
                      onSelect={handleCustomerSelect}
                      placeholder="Search customer by name"
                      allowClear
                    />
                  </Form.Item>
                  <Form.Item>
                    <Button type="primary" htmlType="submit">
                      Assign Voucher
                    </Button>
                  </Form.Item>
                </Form>
              </Card>
            )}
          </>
        ) : (
          <p>Loading...</p>
        )}
      </Modal>
    </div>
  )
}
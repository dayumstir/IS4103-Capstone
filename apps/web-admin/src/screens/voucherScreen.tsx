import { useState } from "react";
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
  Spin,
  Select
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
  const [createVoucherForm] = Form.useForm();
  const [assignVoucherForm] = Form.useForm();
  const [voucherSearch, setVoucherSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedVoucherId, setSelectedVoucherId] = useState<string | null>(null);

  const [createVoucher] = useCreateVoucherMutation();
  const [deactivateVoucher] = useDeactivateVoucherMutation();
  const [assignVoucher] = useAssignVoucherMutation();
  
  // Handle voucher creation
  const handleCreateVoucher = async (newVoucher: Partial<IVoucher>) => {
    try {
      const result = await createVoucher(newVoucher).unwrap();
      message.success(`New voucher "${result.title}" has been created.`);
      createVoucherForm.resetFields();
    } catch (error) {
      console.error("Error creating voucher:", error);
      message.error("Failed to create voucher");
    }
  };

  // Handle voucher deactivation
  const handleDeactivateVoucher = async (voucher: IVoucher) => {
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
  const { data: customerOptions, isLoading: isCustomersLoading } = useGetAllCustomersQuery(undefined, {
    skip: !isModalOpen,
  });

  const handleAssignVoucher = async (values: { customer_email: string }) => {
    if (!selectedVoucherId) {
      message.error("No voucher selected.");
      return;
    }

    try {
      await assignVoucher({ voucher_id: selectedVoucherId, email: values.customer_email }).unwrap();
      message.success(`Voucher assigned to customer "${values.customer_email}".`);
      assignVoucherForm.resetFields(); // Clear the form
      fetchVoucherDetails(); // Refetch the voucher details
    } catch (error) {
      console.error("Error assigning voucher:", error);
      message.error("Failed to assign voucher");
    }
  };

  // Handle search/get vouchers
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setVoucherSearch(e.target.value);
  };

  const { data: vouchers, isLoading } = useGetVouchersQuery(voucherSearch);
  
  // Fetch the voucher details
  const { data: voucherDetails, refetch: fetchVoucherDetails } = useGetVoucherDetailsQuery(selectedVoucherId ?? "", {
    skip: !selectedVoucherId, // Only fetch when a voucher is selected
  });

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
    assignVoucherForm.resetFields(); // Clear the assign form fields
  };

  const voucherColumns = [
    { title: "Title", dataIndex: "title", key: "title", sorter: (a: IVoucher, b: IVoucher) => a.title.localeCompare(b.title) },
    { title: "Description", dataIndex: "description", key: "description", sorter: (a: IVoucher, b: IVoucher) => a.description.localeCompare(b.description) },
    { title: "Percentage Discount", dataIndex: "percentage_discount", key: "percentage_discount", render: (discount: number) => `${discount}%`, sorter: (a: IVoucher, b: IVoucher) => a.percentage_discount - b.percentage_discount },
    { title: "Amount Discount", dataIndex: "amount_discount", key: "amount_discount", render: (amount: number) => `$${amount}`, sorter: (a: IVoucher, b: IVoucher) => a.amount_discount - b.amount_discount },
    { title: "Expiry Date", dataIndex: "expiry_date", key: "expiry_date", render: (date: string) => new Date(date).toLocaleDateString(), sorter: (a: IVoucher, b: IVoucher) => new Date(a.expiry_date).getTime() - new Date(b.expiry_date).getTime() },
    { title: "Usage Limit", dataIndex: "usage_limit", key: "usage_limit", sorter: (a: IVoucher, b: IVoucher) => a.usage_limit - b.usage_limit },
    {
      title: "Actions",
      key: "actions",
      sorter: (a: IVoucher, b: IVoucher) => (a.is_active === b.is_active ? 0 : a.is_active ? -1 : 1),
      render: (_: string, voucher: IVoucher) => (
        <div className="flex flex-col gap-2">
          <Button
            icon={<EyeOutlined />}
            onClick={() => handleViewDetails(voucher.voucher_id)}
          >
            View Voucher Details
          </Button>
          <Popconfirm
            title={`Are you sure you want to deactivate this voucher?`}
            onConfirm={() => handleDeactivateVoucher(voucher)}
            okText="Yes"
            cancelText="No"
          >
            <Button icon={<StopOutlined />} danger disabled={!voucher.is_active}>
              {voucher.is_active ? "Deactivate" : "Not In Use"}
            </Button>
          </Popconfirm>
        </div>
      ),
    },
  ];

  const assignedVoucherColumns = [
    { title: "Customer Email", dataIndex: ["customer", "email"], key: "customerEmail" },
    { title: "Status", dataIndex: "status", key: "status" },
    { title: "Date Issued", dataIndex: "date_time_issued", key: "date_time_issued", render: (date: string) => new Date(date).toLocaleDateString() },
    { title: "Remaining Uses", dataIndex: "remaining_uses", key: "remaining_uses" },
  ];

  const renderCreateVoucherForm = (formInstance: FormInstance) => (
    <Form
      form={formInstance}
      name="voucher"
      onFinish={(values) => {
        // Automatically set the filled value and enforce that one field is filled
        const voucherData = {
          ...values,
          percentage_discount: values.percentage_discount || 0,
          amount_discount: values.amount_discount || 0,
        };
        handleCreateVoucher(voucherData);
      }}
      layout="vertical"
    >
      <div className="grid grid-cols-2 gap-x-8">
        <Form.Item
          name="title"
          label="Voucher Title"
          rules={[{ required: true, message: "Please input the voucher title!" }]}
        >
          <Input placeholder="Enter voucher title" />
        </Form.Item>

        <Form.Item
          name="description"
          label="Description"
          rules={[{ required: true, message: "Please input the description!" }]}
        >
          <Input placeholder="Enter description" />
        </Form.Item>

        <Form.Item
          name="percentage_discount"
          label="Percentage Discount (Choose 1)"
          rules={[
            {
              validator: (_, value) => {
                const amountDiscount = formInstance.getFieldValue("amount_discount");
                if (value && amountDiscount) {
                  return Promise.reject(new Error("Only one discount type can be applied (either percentage or amount)"));
                }
                if (!value && !amountDiscount) {
                  return Promise.reject(new Error("Please input either percentage discount or amount discount"));
                }
                if (value < 0 || value > 100) {
                  return Promise.reject(new Error("Percentage discount must be between 0 and 100"));
                }
                return Promise.resolve();
              },
            },
          ]}
        >
          <InputNumber className="w-full" step={1} placeholder="Enter percentage discount (0-100)" />
        </Form.Item>

        <Form.Item
          name="amount_discount"
          label="Amount Discount (Choose 1)"
          rules={[
            {
              validator: (_, value) => {
                const percentageDiscount = formInstance.getFieldValue("percentage_discount");
                if (value && percentageDiscount) {
                  return Promise.reject(new Error("Only one discount type can be applied (either percentage or amount)"));
                }
                if (!value && !percentageDiscount) {
                  return Promise.reject(new Error("Please input either percentage discount or amount discount"));
                }
                if (value < 0) {
                  return Promise.reject(new Error("Amount discount must be greater than or equal to 0"));
                }
                return Promise.resolve();
              },
            },
          ]}
        >
          <InputNumber className="w-full" step={1} placeholder="Enter amount discount (>= 0)" />
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
          <InputNumber className="w-full" step={1} placeholder="Enter usage limit (>= 1)" />
        </Form.Item>

        <Form.Item
          name="terms"
          label="Terms"
          rules={[{ required: true, message: "Please input the terms!" }]}
        >
          <Input placeholder="Enter terms" />
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
        {renderCreateVoucherForm(createVoucherForm)}
      </Card>

      {/* ===== View and Manage Vouchers ===== */}
      <Card className="mb-8 border border-gray-300" title="View and Manage Vouchers">
        <Search
          placeholder="Search by title"
          onChange={handleSearchChange}
          value={voucherSearch}
          style={{ marginBottom: 16 }}
        />
        <Table
          dataSource={vouchers}
          columns={voucherColumns}
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
                {isCustomersLoading ? (
                  <Spin />
                ) : (
                  <Form
                    form={assignVoucherForm}
                    layout="vertical"
                    onFinish={handleAssignVoucher}
                  >
                    <Form.Item
                      name="customer_email"
                      label="Customer Email"
                      rules={[{ required: true, message: "Please select the customer!" }]}
                    >
                      <Select
                        showSearch
                        placeholder="Select a customer"
                        options={customerOptions?.map((customer) => ({
                          label: customer.email,
                          value: customer.email,
                        }))}
                      />
                    </Form.Item>
                    <Form.Item>
                      <Button type="primary" htmlType="submit">
                        Assign Voucher
                      </Button>
                    </Form.Item>
                  </Form>
                )}
              </Card>
            )}
          </>
        ) : (
          <Spin />
        )}
      </Modal>
    </div>
  );
}

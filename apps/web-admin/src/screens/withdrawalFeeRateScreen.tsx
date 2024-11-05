import { useState } from "react";
import {
  Form,
  Input,
  Button,
  Table,
  Card,
  message,
  Modal,
  Popconfirm,
  Empty,
  InputNumber,
  FormInstance,
  Select,
} from "antd";
import { PlusOutlined, EditOutlined, DeleteOutlined } from "@ant-design/icons";
import { IWithdrawalFeeRate } from "../interfaces/withdrawalFeeRateInterface";
import {
  useCreateWithdrawalFeeRateMutation,
  useGetWithdrawalFeeRatesQuery,
  useUpdateWithdrawalFeeRateMutation,
  useDeleteWithdrawalFeeRateMutation,
} from "../redux/services/withdrawalFeeRateService";
import {
  useGetMerchantSizesQuery,
} from "../redux/services/merchantSizeService";

export default function WithdrawalFeeRateScreen() {
  const [form] = Form.useForm();
  const [editForm] = Form.useForm();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRate, setEditingRate] = useState<IWithdrawalFeeRate | null>(null);

  const { data: withdrawalFeeRates, isLoading } = useGetWithdrawalFeeRatesQuery();
  const { data: merchantSizes } = useGetMerchantSizesQuery(); // Fetch merchant sizes
  const [createWithdrawalFeeRate]  = useCreateWithdrawalFeeRateMutation();
  const [updateWithdrawalFeeRate] = useUpdateWithdrawalFeeRateMutation();
  const [deleteWithdrawalFeeRate] = useDeleteWithdrawalFeeRateMutation(); 

  const merchantSizeMap = merchantSizes?.reduce((acc, size) => {
    acc[size.merchant_size_id] = size.name;
    return acc;
  }, {} as Record<string, string>);

  const tableColumns = [
    {
      title: "Fee Name",
      dataIndex: "name",
      key: "name",
      sorter: (a: IWithdrawalFeeRate, b: IWithdrawalFeeRate) => a.name.localeCompare(b.name),
    },
    {
      title: "Merchant Size",
      dataIndex: "merchant_size_id",
      key: "merchant_size_id",
      render: (text: string) => merchantSizeMap[text] || 'N/A',
      sorter: (a: IWithdrawalFeeRate, b: IWithdrawalFeeRate) =>
        (merchantSizeMap[a.merchant_size_id] || '').localeCompare(merchantSizeMap[b.merchant_size_id] || ''),
    },
    {
      title: <div className="whitespace-nowrap">Wallet Balance Min ($)</div>,
      dataIndex: "wallet_balance_min",
      key: "wallet_balance_min",
      width: 1,
      render: (text: string) => <div className="whitespace-nowrap">{text}</div>,
      sorter: (a: IWithdrawalFeeRate, b: IWithdrawalFeeRate) => a.wallet_balance_min - b.wallet_balance_min,
    },
    {
      title: <div className="whitespace-nowrap">Wallet Balance Max ($)</div>,
      dataIndex: "wallet_balance_max",
      key: "wallet_balance_max",
      width: 1,
      render: (text: string) => <div className="whitespace-nowrap">{text}</div>,
      sorter: (a: IWithdrawalFeeRate, b: IWithdrawalFeeRate) => a.wallet_balance_max - b.wallet_balance_max,
    },
    {
      title: <div className="whitespace-nowrap">Transaction Fee (%)</div>,
      dataIndex: "percentage_transaction_fee",
      key: "transaction_fee",
      width: 1,
      render: (text: string) => <div className="whitespace-nowrap">{text}</div>,
      sorter: (a: IWithdrawalFeeRate, b: IWithdrawalFeeRate) => a.percentage_transaction_fee - b.percentage_transaction_fee,
    },
    {
      title: <div className="whitespace-nowrap">Withdrawal Fee (%)</div>,
      dataIndex: "percentage_withdrawal_fee",
      key: "withdrawal_fee",
      width: 1,
      render: (text: string) => <div className="whitespace-nowrap">{text}</div>,
      sorter: (a: IWithdrawalFeeRate, b: IWithdrawalFeeRate) => a.percentage_withdrawal_fee - b.percentage_withdrawal_fee,
    },
    {
      title: "Actions",
      key: "actions",
      width: 1,
      render: (text: string, record: IWithdrawalFeeRate) => (
        <div className="whitespace-nowrap">
          <Button
            className="mr-2"
            icon={<EditOutlined />}
            onClick={() => handleEditRate(record)}
          >
            Edit
          </Button>
          <Popconfirm
            title="Are you sure you want to delete this withdrawal fee rate?"
            onConfirm={() => handleDeleteRate(record.withdrawal_fee_rate_id)}
            okText="Yes"
            cancelText="No"
          >
            <Button icon={<DeleteOutlined />} danger>
              Delete
            </Button>
          </Popconfirm>
        </div>
      ),
    },
  ];
  
  const checkOverlappingRanges = (
    wallet_balance_min: number,
    wallet_balance_max: number,
    merchant_size_id?: string,
    excludeTierId?: string,
  ): boolean => {
    const existingRates = withdrawalFeeRates || [];
    return existingRates.some((tier: IWithdrawalFeeRate) => {
      if (excludeTierId && tier.withdrawal_fee_rate_id === excludeTierId) {
        return false; // Skip the current tier being edited
      }
      return (
        tier.merchant_size_id.toString() === merchant_size_id && // Check for the same merchant size
        (
          (wallet_balance_min >= tier.wallet_balance_min && 
           wallet_balance_min <= tier.wallet_balance_max) ||
          (wallet_balance_max >= tier.wallet_balance_min && 
           wallet_balance_max <= tier.wallet_balance_max) ||
          (wallet_balance_min <= tier.wallet_balance_min && 
           wallet_balance_max >= tier.wallet_balance_max)
        )
      );
    });
  };

  
  const handleCreateRate = async (
    newWithdrawalFeeRate: Omit<IWithdrawalFeeRate, "withdrawal_fee_rate_id">,
  ) => {
    const { wallet_balance_min, wallet_balance_max } = newWithdrawalFeeRate;
    if (wallet_balance_min >= wallet_balance_max) {
      message.error(
        "Minimum wallet balance must be less than maximum wallet balance.",
      );
      return;
    }
    
    if (checkOverlappingRanges(wallet_balance_min, wallet_balance_max, newWithdrawalFeeRate.merchant_size_id.toString())) {
      message.error(
        "The new wallet balance range overlaps with an existing tier. Please adjust the range.",
      );
      return;
  
    }
    try {
      await createWithdrawalFeeRate(newWithdrawalFeeRate).unwrap();
      message.success(
        `New  withdrawal fee rate "${newWithdrawalFeeRate.name}" has been created.`,
      );
      form.resetFields();
    } catch (error) {
      console.error("Error creating withdrawal fee rate:", error);
      message.error("Failed to create withdrawal fee rate");
    }
  };

  const handleEditRate = (rate: IWithdrawalFeeRate) => {
    setEditingRate(rate);
    editForm.setFieldsValue(rate);
    setIsModalOpen(true);
  };


  const handleUpdateRate = async (
    values: Omit<IWithdrawalFeeRate, "withdrawal_fee_rate_id">,
  ) => {
    if (!editingRate) {
      message.error("No withdrawal fee rate selected for editing");
      return;
    }

    const { wallet_balance_min, wallet_balance_max } = values;
    if (wallet_balance_min >= wallet_balance_max) {
      message.error(
        "Minimum withdrawal fee rate must be less than maximum withdrawal fee rate.",
      );
      return;
    }
    
    if (
      checkOverlappingRanges(
        wallet_balance_min,
        wallet_balance_max,
        editingRate.merchant_size_id.toString(),
        editingRate.withdrawal_fee_rate_id,
      )
    ) {
      message.error(
        "The updated wallet balance range overlaps with an existing tier. Please adjust the range.",
      );
      return;
    }

    const updatedRate: IWithdrawalFeeRate = {
      ...values,
      withdrawal_fee_rate_id: editingRate.withdrawal_fee_rate_id,
    };

    try {
      await updateWithdrawalFeeRate(updatedRate).unwrap();
      setIsModalOpen(false);
      setEditingRate(null);
      message.success(`Withdrawal Fee Rate "${updatedRate.name}" has been updated.`);
    } catch (error) {
      console.error("Error updating withdrawal Fee Rate:", error);
      message.error("Failed to update withdrawal Fee Rate");
    }
  };

  const handleDeleteRate = async (id: string) => {
    try {
      await deleteWithdrawalFeeRate(id).unwrap(); // Call the delete mutation
      message.success("Withdrawal Fee Rate has been deleted.");
      //refetch(); // Refresh the data after deletion
    } catch (error) {
      console.error("Error deleting withdrawal fee rate:", error);
      message.error("Failed to delete withdrawal fee rate");
    }
  };

  const renderForm = (formInstance: FormInstance) => (
    <Form
      form={formInstance}
      name="withdrawal_fee_rate"
      onFinish={formInstance === form ? handleCreateRate : handleUpdateRate}
      layout="vertical"
    >
      <Form.Item
        name="name"
        label="Withdrawal Fee Rate Name"
        rules={[
          { required: true, message: "Please input the Withdrawal Fee Rate Name!" },
        ]}
      >
        <Input />
      </Form.Item>

      <div className="grid grid-cols-2 gap-x-8">
        <Form.Item
          name="wallet_balance_min"
          label="Minimum Wallet Balance ($)"
          rules={[
            {
              required: true,
              message: "Please input the Minimum Wallet Balance!",
            },
            {
              type: "number",
              message: "Minimum Wallet Balance must be a number",
            },
          ]}
        >
          <InputNumber className="w-full" step={1} precision={0} />
        </Form.Item>

        <Form.Item
          name="wallet_balance_max"
          label="Maximum Wallet Balance ($)"
          rules={[
            {
              required: true,
              message: "Please input the Maximum Wallet Balance!",
            },
            {
              type: "number",
              message: "Wallet Balance must be a number",
            },
            ({ getFieldValue }) => ({
              validator(_, value) {
                if (!value || getFieldValue("wallet_balance_min") < value) {
                  return Promise.resolve();
                }
                return Promise.reject(
                  new Error("Max balance must be greater than min balance!"),
                );
              },
            }),
          ]}
        >
          <InputNumber className="w-full" step={1} precision={0} />
        </Form.Item>

        <Form.Item
          name="percentage_transaction_fee"
          label="Percentage Transaction Fee (%)"
          rules={[
            {
              required: true,
              message: "Please input the Percentage Transaction Fee",
            },
            {
              type: "number",
              min: 0,
              max: 100,
              message: "Percentage Transaction Fee must be a number",
            },
          ]}
        >
          <InputNumber className="w-full" step={0.01} precision={2} />
        </Form.Item>

        <Form.Item
          name="percentage_withdrawal_fee"
          label="Percentage Withdrawal Fee (%)" 
          rules={[
            {
              required: true,
              message: "Please input the Percentage Withdrawal Fee",
            },
            {
              type: "number",
              min: 0,
              max: 100,
              message: "Percentage Withdrawal Fee must be a number",
            },
          ]}
        >
           <InputNumber className="w-full" step={0.01} precision={2} />
        </Form.Item>

        <Form.Item
        name="merchant_size_id"
        label="Merchant Size"
        rules={[{ required: true, message: "Please select a Merchant Size!" }]}
      >
        <Select placeholder="Select Merchant Size">
          {merchantSizes?.map((size) => (
            <Select.Option key={size.merchant_size_id} value={size.merchant_size_id}>
              {size.name}
            </Select.Option>
          ))}
        </Select>
      </Form.Item>
      </div>

      <Form.Item>
        <Button
          type="primary"
          htmlType="submit"
          icon={formInstance === form ? <PlusOutlined /> : <EditOutlined />}
        >
          {formInstance === form ? "Create Withdrawal Fee Rate" : "Update Withdrawal Fee Rate"}
        </Button>
      </Form.Item>
    </Form>
  );

  return (
    <div className="w-full px-8 py-4">
      {/* ===== Create Withdrawal Fee Terms ===== */}
      <Card
        className="mb-8 border border-gray-300"
        title="Create Withdrawal Fee Terms"
      >
        {renderForm(form)}
      </Card>

      {/* ===== View and Manage Withdrawal Fee Terms ===== */}
      <Card
        className="mb-8 border border-gray-300"
        title="View and Manage Withdrawal Fee Terms"
      >
        <Table
          dataSource={withdrawalFeeRates}
          columns={tableColumns}
          rowKey="withdrawal_fee_rate_id"
          pagination={false}
          loading={isLoading}
          locale={{
            emptyText: <Empty description="No withdrawal fee rates found"></Empty>,
          }}
        />
      </Card>

      {/* ===== Edit Withdrawal Fee Modal ===== */}
      <Modal
        title="Edit withdrawal fee rates"
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        footer={null}
        centered
      >
        {renderForm(editForm)}
      </Modal>
    </div>
  );
}



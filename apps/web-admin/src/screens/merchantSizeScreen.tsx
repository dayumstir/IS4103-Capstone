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
} from "antd";
import { PlusOutlined, EditOutlined, DeleteOutlined } from "@ant-design/icons";
import { IMerchantSize } from "@repo/interfaces";
import {
  useCreateMerchantSizeMutation,
  useGetMerchantSizesQuery,
  useUpdateMerchantSizeMutation,
  useDeleteMerchantSizeMutation,
} from "../redux/services/merchantSizeService";

export default function MerchantSizeScreen() {
  const [form] = Form.useForm();
  const [editForm] = Form.useForm();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRate, setEditingRate] = useState<IMerchantSize | null>(null);

  const { data: merchantSizes, isLoading } = useGetMerchantSizesQuery();
  const [createMerchantSize] = useCreateMerchantSizeMutation();
  const [updateMerchantSize] = useUpdateMerchantSizeMutation();
  const [deleteMerchantSize] = useDeleteMerchantSizeMutation();

  const tableColumns = [
    {
      title: "Name",
      dataIndex: "name",
      key: "name",
    },
    {
      title: <div className="whitespace-nowrap">Monthly Revenue Min ($)</div>,
      dataIndex: "monthly_revenue_min",
      key: "monthly_revenue_min",
      width: 1,
      render: (text: string) => {
        // Convert the value to a number and format it to 2 decimal places
        const formattedText = parseFloat(text).toFixed(2);
        return <div className="whitespace-nowrap">{formattedText}</div>;
      },
    },
    {
      title: <div className="whitespace-nowrap">Monthly Revenue Max ($)</div>,
      dataIndex: "monthly_revenue_max",
      key: "monthly_revenue_max",
      width: 1,
      render: (text: string) => {
        // Convert the value to a number and format it to 2 decimal places
        const formattedText = parseFloat(text).toFixed(2);
        return <div className="whitespace-nowrap">{formattedText}</div>;
      },
    },
    
    {
      title: "Actions",
      key: "actions",
      width: 1,
      render: (text: string, record: IMerchantSize) => (
        <div className="whitespace-nowrap">
          <Button
            className="mr-2"
            icon={<EditOutlined />}
            onClick={() => handleEditRate(record)}
          >
            Edit
          </Button>
          <Popconfirm
            title="Are you sure you want to delete this Merchant Size?"
            onConfirm={() => handleDeleteRate(record.merchant_size_id)}
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
    monthly_revenue_min: number,
    monthly_revenue_max: number,
    excludeTierId?: string,
  ): boolean => {
    const existingRates = merchantSizes || [];
    return existingRates.some((tier: IMerchantSize) => {
      if (excludeTierId && tier.merchant_size_id === excludeTierId) {
        return false; // Skip the current tier being edited
      }
      return (
        (monthly_revenue_min >= tier.monthly_revenue_min &&
          monthly_revenue_min <= tier.monthly_revenue_max) ||
        (monthly_revenue_max >= tier.monthly_revenue_min &&
          monthly_revenue_max <= tier.monthly_revenue_max) ||
        (monthly_revenue_min <= tier.monthly_revenue_min &&
          monthly_revenue_max >= tier.monthly_revenue_max)
      );
    });
  };

  const handleCreateRate = async (
    newMerchantSize: Omit<IMerchantSize, "merchant_size_id">,
  ) => {
    const { monthly_revenue_min, monthly_revenue_max } = newMerchantSize;
    if (monthly_revenue_min >= monthly_revenue_max) {
      message.error(
        "Minimum wallet balance must be less than maximum wallet balance.",
      );
      return;
    }

    if (checkOverlappingRanges(monthly_revenue_min, monthly_revenue_max)) {
      message.error(
        "The monthly revenue range overlaps with an existing merchant size. Please adjust the range.",
      );
      return;
    }
    try {
      await createMerchantSize(newMerchantSize).unwrap();
      message.success(
        `New Merchant Size"${newMerchantSize.name}" has been created.`,
      );
      form.resetFields();
    } catch (error) {
      console.error("Error creating Merchant Size:", error);
      message.error("Failed to create Merchant Size");
    }
  };

  const handleEditRate = (rate: IMerchantSize) => {
    setEditingRate(rate);
    editForm.setFieldsValue(rate);
    setIsModalOpen(true);
  };

  const handleUpdateRate = async (
    values: Omit<IMerchantSize, "merchant_size_id">,
  ) => {
    if (!editingRate) {
      message.error("No Merchant Size selected for editing");
      return;
    }

    const { monthly_revenue_min, monthly_revenue_max } = values;
    if (monthly_revenue_min >= monthly_revenue_max) {
      message.error(
        "Minimum Merchant Size must be less than maximum Merchant Size.",
      );
      return;
    }

    if (
      checkOverlappingRanges(
        monthly_revenue_min,
        monthly_revenue_max,
        editingRate.merchant_size_id,
      )
    ) {
      message.error(
        "The updated wallet balance range overlaps with an existing tier. Please adjust the range.",
      );
      return;
    }

    const updatedRate: IMerchantSize = {
      ...values,
      merchant_size_id: editingRate.merchant_size_id,
    };

    try {
      await updateMerchantSize(updatedRate).unwrap();
      setIsModalOpen(false);
      setEditingRate(null);
      message.success(`Merchant Size "${updatedRate.name}" has been updated.`);
    } catch (error) {
      console.error("Error updating Merchant Size:", error);
      message.error("Failed to update Merchant Size");
    }
  };

  // TODO: Implement delete
  const handleDeleteRate = async (id: string) => {
    try {
      await deleteMerchantSize(id).unwrap(); // Call the delete mutation
      message.success("Merchant Size has been deleted.");
      //refetch(); // Refresh the data after deletion
    } catch (error) {
      console.error("Error deleting  Merchant Size:", error);
      message.error("Failed to delete Merchant Size");
    }
  };

  const renderForm = (formInstance: FormInstance) => (
    <Form
      form={formInstance}
      name="merchant_size"
      onFinish={formInstance === form ? handleCreateRate : handleUpdateRate}
      layout="vertical"
    >
      <Form.Item
        name="name"
        label="Merchant Size Name"
        rules={[
          { required: true, message: "Please input the Merchant Size name!" },
        ]}
      >
        <Input />
      </Form.Item>

      <div className="grid grid-cols-2 gap-x-8">
        <Form.Item
          name="monthly_revenue_min"
          label="Monthly Revenue Min ($)"
          rules={[
            {
              required: true,
              message: "Please input the Minimum Monthly Revenue",
            },
            {
              type: "number",
              message: "Minimum Monthly Revenue must be a number",
            },
          ]}
        >
          <InputNumber className="w-full" step={1} precision={2} />
        </Form.Item>

        <Form.Item
          name="monthly_revenue_max"
          label="Monthly Revenue Max ($)"
          rules={[
            {
              required: true,
              message: "Please input the Monthly Revenue Max!",
            },
            {
              type: "number",
              message: "Monthly Revenue Max must be a number",
            },
            ({ getFieldValue }) => ({
              validator(_, value) {
                if (!value || getFieldValue("monthly_revenue_min") < value) {
                  return Promise.resolve();
                }
                return Promise.reject(
                  new Error(
                    "Monthly Revenue Max must be Bigger than Monthly Revenue Min!",
                  ),
                );
              },
            }),
          ]}
        >
          <InputNumber className="w-full" step={1} precision={2} />
        </Form.Item>
      </div>

      <Form.Item>
        <Button
          type="primary"
          htmlType="submit"
          icon={formInstance === form ? <PlusOutlined /> : <EditOutlined />}
        >
          {formInstance === form
            ? "Create Merchant Size"
            : "Update Merchant Size"}
        </Button>
      </Form.Item>
    </Form>
  );

  return (
    <div className="w-full px-8 py-4">
      {/* ===== Create Merchant Size Terms ===== */}
      <Card
        className="mb-8 border border-gray-300"
        title="Create Merchant Size Terms"
      >
        {renderForm(form)}
      </Card>

      {/* ===== View and Manage Merchant Size ===== */}
      <Card
        className="mb-8 border border-gray-300"
        title="View and Manage Merchant Size"
      >
        <Table
          dataSource={merchantSizes}
          columns={tableColumns}
          rowKey="merchant_size_id"
          pagination={false}
          loading={isLoading}
          locale={{
            emptyText: <Empty description="No Merchant Size found"></Empty>,
          }}
        />
      </Card>

      {/* ===== Edit Merchant Size Modal ===== */}
      <Modal
        title="Edit Merchant Size"
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

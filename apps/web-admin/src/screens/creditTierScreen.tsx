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
import { ICreditTier } from "../interfaces/creditTierInterface";
import {
  useGetCreditTiersQuery,
  useCreateCreditTierMutation,
  useUpdateCreditTierMutation,
} from "../redux/services/creditTierService";

export default function CreditTierScreen() {
  const [form] = Form.useForm();
  const [editForm] = Form.useForm();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTier, setEditingTier] = useState<ICreditTier | null>(null);

  const { data: creditTiers, isLoading } = useGetCreditTiersQuery();
  const [createCreditTier] = useCreateCreditTierMutation();
  const [updateCreditTier] = useUpdateCreditTierMutation();

  const tableColumns = [
    {
      title: "Name",
      dataIndex: "name",
      key: "name",
    },
    {
      title: <div className="whitespace-nowrap">Min Credit Score</div>,
      dataIndex: "min_credit_score",
      key: "min_credit_score",
      width: 1,
      render: (text: string) => <div className="whitespace-nowrap">{text}</div>,
    },
    {
      title: <div className="whitespace-nowrap">Max Credit Score</div>,
      dataIndex: "max_credit_score",
      key: "max_credit_score",
      width: 1,
      render: (text: string) => <div className="whitespace-nowrap">{text}</div>,
    },
    {
      title: "Actions",
      key: "actions",
      width: 1,
      render: (text: string, record: ICreditTier) => (
        <div className="whitespace-nowrap">
          <Button
            className="mr-2"
            icon={<EditOutlined />}
            onClick={() => handleEditTier(record)}
          >
            Edit
          </Button>
          <Popconfirm
            title="Are you sure you want to delete this credit tier?"
            onConfirm={() => handleDeleteTier(record.credit_tier_id)}
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
    min_credit_score: number,
    max_credit_score: number,
    excludeTierId?: string,
  ): boolean => {
    const existingTiers = creditTiers || [];
    return existingTiers.some((tier: ICreditTier) => {
      if (excludeTierId && tier.credit_tier_id === excludeTierId) {
        return false; // Skip the current tier being edited
      }
      return (
        (min_credit_score >= tier.min_credit_score &&
          min_credit_score <= tier.max_credit_score) ||
        (max_credit_score >= tier.min_credit_score &&
          max_credit_score <= tier.max_credit_score) ||
        (min_credit_score <= tier.min_credit_score &&
          max_credit_score >= tier.max_credit_score)
      );
    });
  };

  const handleCreateTier = async (
    newCreditTier: Omit<ICreditTier, "credit_tier_id">,
  ) => {
    const { min_credit_score, max_credit_score } = newCreditTier;
    if (min_credit_score >= max_credit_score) {
      message.error(
        "Minimum credit score must be less than maximum credit score.",
      );
      return;
    }

    if (checkOverlappingRanges(min_credit_score, max_credit_score)) {
      message.error(
        "The new credit tier range overlaps with an existing tier. Please adjust the range.",
      );
      return;
    }
    try {
      await createCreditTier(newCreditTier).unwrap();
      message.success(
        `New credit tier "${newCreditTier.name}" has been created.`,
      );
      form.resetFields();
    } catch (error) {
      console.error("Error creating credit tier:", error);
      message.error("Failed to create credit tier");
    }
  };

  const handleEditTier = (tier: ICreditTier) => {
    setEditingTier(tier);
    editForm.setFieldsValue(tier);
    setIsModalOpen(true);
  };

  const handleUpdateTier = async (
    values: Omit<ICreditTier, "credit_tier_id">,
  ) => {
    if (!editingTier) {
      message.error("No credit tier selected for editing");
      return;
    }

    const { min_credit_score, max_credit_score } = values;
    if (min_credit_score >= max_credit_score) {
      message.error(
        "Minimum credit score must be less than maximum credit score.",
      );
      return;
    }

    if (
      checkOverlappingRanges(
        min_credit_score,
        max_credit_score,
        editingTier.credit_tier_id,
      )
    ) {
      message.error(
        "The updated credit tier range overlaps with an existing tier. Please adjust the range.",
      );
      return;
    }

    const updatedTier: ICreditTier = {
      ...values,
      credit_tier_id: editingTier.credit_tier_id,
    };

    try {
      await updateCreditTier(updatedTier).unwrap();
      setIsModalOpen(false);
      setEditingTier(null);
      message.success(`Credit tier "${updatedTier.name}" has been updated.`);
    } catch (error) {
      console.error("Error updating credit tier:", error);
      message.error("Failed to update credit tier");
    }
  };

  // TODO: Implement delete credit tier
  const handleDeleteTier = (id: string) => {
    message.success("Credit tier has been deleted.");
  };

  const renderForm = (formInstance: FormInstance) => (
    <Form
      form={formInstance}
      name="credit_tier"
      onFinish={formInstance === form ? handleCreateTier : handleUpdateTier}
      layout="vertical"
    >
      <Form.Item
        name="name"
        label="Credit Tier Name"
        rules={[
          { required: true, message: "Please input the credit tier name!" },
        ]}
      >
        <Input />
      </Form.Item>

      <div className="grid grid-cols-2 gap-x-8">
        <Form.Item
          name="min_credit_score"
          label="Minimum Credit Score"
          rules={[
            {
              required: true,
              message: "Please input the minimum credit score!",
            },
            {
              type: "number",
              min: 0,
              max: 1000,
              message: "Credit score must be between 0 and 1000",
            },
          ]}
        >
          <InputNumber className="w-full" />
        </Form.Item>

        <Form.Item
          name="max_credit_score"
          label="Maximum Credit Score"
          rules={[
            {
              required: true,
              message: "Please input the maximum credit score!",
            },
            {
              type: "number",
              min: 0,
              max: 1000,
              message: "Credit score must be between 0 and 1000",
            },
            ({ getFieldValue }) => ({
              validator(_, value) {
                if (!value || getFieldValue("min_credit_score") < value) {
                  return Promise.resolve();
                }
                return Promise.reject(
                  new Error("Max score must be greater than min score!"),
                );
              },
            }),
          ]}
        >
          <InputNumber className="w-full" />
        </Form.Item>
      </div>

      <Form.Item>
        <Button
          type="primary"
          htmlType="submit"
          icon={formInstance === form ? <PlusOutlined /> : <EditOutlined />}
        >
          {formInstance === form ? "Create Credit Tier" : "Update Credit Tier"}
        </Button>
      </Form.Item>
    </Form>
  );

  return (
    <div className="w-full px-8 py-4">
      {/* ===== Create Credit Tier Terms ===== */}
      <Card
        className="mb-8 border border-gray-300"
        title="Create Credit Tier Terms"
      >
        {renderForm(form)}
      </Card>

      {/* ===== View and Manage Credit Tier Terms ===== */}
      <Card
        className="mb-8 border border-gray-300"
        title="View and Manage Credit Tier Terms"
      >
        <Table
          dataSource={creditTiers}
          columns={tableColumns}
          rowKey="credit_tier_id"
          pagination={false}
          loading={isLoading}
          locale={{
            emptyText: <Empty description="No credit tiers found"></Empty>,
          }}
        />
      </Card>

      {/* ===== Edit Credit Tier Modal ===== */}
      <Modal
        title="Edit Credit Tier"
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

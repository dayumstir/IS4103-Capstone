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
  Select,
  FormInstance,
  Tag,
} from "antd";
import { PlusOutlined, EditOutlined, DeleteOutlined } from "@ant-design/icons";
import { IInstalmentPlan } from "../interfaces/instalmentPlanInterface";
import {
  useGetInstalmentPlansQuery,
  useCreateInstalmentPlanMutation,
  useUpdateInstalmentPlanMutation,
} from "../redux/services/instalmentPlanService";
import { formatCurrency } from "../utils/formatCurrency";

export default function InstalmentPlanScreen() {
  const [form] = Form.useForm();
  const [editForm] = Form.useForm();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPlan, setEditingPlan] = useState<IInstalmentPlan | null>(null);

  const { data: instalmentPlans, isLoading } = useGetInstalmentPlansQuery();
  const [createInstalmentPlan] = useCreateInstalmentPlanMutation();
  const [updateInstalmentPlan] = useUpdateInstalmentPlanMutation();

  const handleCreatePlan = async (
    newInstalmentPlan: Omit<IInstalmentPlan, "instalment_plan_id">,
  ) => {
    try {
      const result = await createInstalmentPlan(newInstalmentPlan).unwrap();
      message.success(`New instalment plan "${result.name}" has been created.`);
      form.resetFields();
    } catch (error) {
      console.error("Error creating instalment plan:", error);
      message.error("Failed to create instalment plan");
    }
  };

  const handleEditPlan = (plan: IInstalmentPlan) => {
    setEditingPlan(plan);
    // Data from db is string, need to convert them back to number
    editForm.setFieldsValue({
      ...plan,
      interest_rate: Number(plan.interest_rate),
      minimum_amount: Number(plan.minimum_amount),
      maximum_amount: Number(plan.maximum_amount),
    });
    setIsModalOpen(true);
  };

  const handleUpdatePlan = async (
    values: Omit<IInstalmentPlan, "instalment_plan_id">,
  ) => {
    if (!editingPlan) {
      message.error("No instalment plan selected for editing");
      return;
    }

    const updatedPlan: IInstalmentPlan = {
      ...values,
      instalment_plan_id: editingPlan.instalment_plan_id,
    };

    try {
      await updateInstalmentPlan(updatedPlan).unwrap();
      setIsModalOpen(false);
      setEditingPlan(null);
      message.success(
        `Instalment plan "${updatedPlan.name}" has been updated.`,
      );
    } catch (error) {
      console.error("Error updating instalment plan:", error);
      message.error("Failed to update instalment plan");
    }
  };

  // TODO: Implement delete instalment plan
  const handleDeletePlan = (id: string) => {
    message.success("Instalment plan has been deleted.");
  };

  const tableColumns = [
    {
      title: "Name",
      dataIndex: "name",
      key: "name",
    },
    {
      title: "Instalments",
      dataIndex: "number_of_instalments",
      key: "number_of_instalments",
    },
    {
      title: "Time Period (in weeks)",
      dataIndex: "time_period",
      key: "time_period",
    },
    {
      title: "Payment Frequency",
      dataIndex: "frequency",
      key: "frequency",
      render: (text: string, record: IInstalmentPlan) => {
        const frequency =
          (record.time_period * 7) / record.number_of_instalments;
        return `Every ${frequency.toFixed(1)} days`;
      },
    },
    {
      title: "Interest Rate",
      dataIndex: "interest_rate",
      key: "interest_rate",
      render: (rate: string) => `${Number(rate).toFixed(2)}%`,
    },
    {
      title: "Min Amount",
      dataIndex: "minimum_amount",
      key: "minimum_amount",
      render: (amount: string) => formatCurrency(Number(amount)),
    },
    {
      title: "Max Amount",
      dataIndex: "maximum_amount",
      key: "maximum_amount",
      render: (amount: string) => formatCurrency(Number(amount)),
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (text: string) => (
        <Tag color={text === "Active" ? "green" : "volcano"}>{text}</Tag>
      ),
    },
    {
      title: "Description",
      dataIndex: "description",
      key: "description",
    },
    {
      title: "Actions",
      key: "actions",
      width: 1,
      render: (text: string, record: IInstalmentPlan) => (
        <div className="flex flex-col gap-2">
          <Button
            icon={<EditOutlined />}
            onClick={() => handleEditPlan(record)}
          >
            Edit
          </Button>
          <Popconfirm
            title="Are you sure you want to delete this instalment plan?"
            onConfirm={() => handleDeletePlan(record.instalment_plan_id)}
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

  const renderForm = (formInstance: FormInstance) => (
    <Form
      form={formInstance}
      name="instalment_plan"
      onFinish={formInstance === form ? handleCreatePlan : handleUpdatePlan}
      layout="vertical"
    >
      <div className="grid grid-cols-2 gap-x-8">
        <Form.Item
          name="name"
          label="Plan Name"
          rules={[{ required: true, message: "Please input the plan name!" }]}
        >
          <Input />
        </Form.Item>

        <Form.Item
          name="number_of_instalments"
          label="Number of Instalments"
          rules={[
            {
              required: true,
              message: "Please input the number of instalments!",
            },
            {
              type: "number",
              min: 0,
              max: 50,
              message: "Number of instalments must be between 0 and 50",
            },
          ]}
        >
          <InputNumber className="w-full" step={1} precision={0} />
        </Form.Item>

        <Form.Item
          name="interest_rate"
          label="Interest Rate (%)"
          rules={[
            { required: true, message: "Please input the interest rate!" },
            {
              type: "number",
              min: 0,
              max: 100,
              message: "Interest rate must be between 0% and 100%",
            },
          ]}
        >
          <InputNumber className="w-full" step={0.01} precision={2} />
        </Form.Item>

        <Form.Item
          name="time_period"
          label="Time Period (in weeks)"
          rules={[
            { required: true, message: "Please input the time period!" },
            {
              type: "number",
              min: 0,
              max: 50,
              message: "Time period must be between 0 and 50",
            },
          ]}
        >
          <InputNumber className="w-full" step={1} precision={0} />
        </Form.Item>

        <Form.Item
          name="minimum_amount"
          label="Minimum Amount ($)"
          rules={[
            { required: true, message: "Please input the minimum amount!" },
            { type: "number", min: 0, message: "Amount must be positive" },
          ]}
        >
          <InputNumber className="w-full" step={0.01} precision={2} />
        </Form.Item>

        <Form.Item
          name="maximum_amount"
          label="Maximum Amount ($)"
          rules={[
            { required: true, message: "Please input the maximum amount!" },
            { type: "number", min: 0, message: "Amount must be positive" },
            ({ getFieldValue }) => ({
              validator(_, value) {
                if (!value || getFieldValue("minimum_amount") < value) {
                  return Promise.resolve();
                }
                return Promise.reject(
                  new Error(
                    "Maximum amount must be greater than minimum amount!",
                  ),
                );
              },
            }),
          ]}
        >
          <InputNumber className="w-full" step={0.01} precision={2} />
        </Form.Item>

        <Form.Item
          name="status"
          label="Status"
          rules={[{ required: true, message: "Please select the status!" }]}
        >
          <Select>
            <Select.Option value="Active">Active</Select.Option>
            <Select.Option value="Inactive">Inactive</Select.Option>
          </Select>
        </Form.Item>

        <Form.Item
          name="description"
          label="Description"
          rules={[{ required: true, message: "Please input the description!" }]}
        >
          <Input />
        </Form.Item>
      </div>

      <Form.Item>
        <Button
          type="primary"
          htmlType="submit"
          icon={formInstance === form ? <PlusOutlined /> : <EditOutlined />}
        >
          {formInstance === form
            ? "Create Instalment Plan"
            : "Update Instalment Plan"}
        </Button>
      </Form.Item>
    </Form>
  );

  return (
    <div className="w-full px-8 py-4">
      {/* ===== Create Instalment Plan ===== */}
      <Card
        className="mb-8 border border-gray-300"
        title="Create Instalment Plan"
      >
        {renderForm(form)}
      </Card>

      {/* ===== View and Manage Instalment Plans ===== */}
      <Card
        className="mb-8 border border-gray-300"
        title="View and Manage Instalment Plans"
      >
        <Table
          dataSource={instalmentPlans}
          columns={tableColumns}
          rowKey="instalment_plan_id"
          pagination={false}
          loading={isLoading}
          locale={{
            emptyText: <Empty description="No instalment plans found"></Empty>,
          }}
        />
      </Card>

      {/* ===== Edit Instalment Plan Modal ===== */}
      <Modal
        title="Edit Instalment Plan"
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

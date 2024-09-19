import React, { useState } from "react";
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
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createInstalmentPlan,
  fetchInstalmentPlanList,
  updateInstalmentPlan,
} from "../api/instalmentPlanApi";

export default function InstalmentPlanAdmin() {
  const [form] = Form.useForm();
  const [editForm] = Form.useForm();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPlan, setEditingPlan] = useState<IInstalmentPlan | null>(null);
  const queryClient = useQueryClient();

  const instalmentPlanListQuery = useQuery({
    queryKey: ["instalment-plans"],
    queryFn: fetchInstalmentPlanList,
  });

  const createInstalmentPlanMutation = useMutation({
    mutationFn: createInstalmentPlan,
    onSettled: async () => {
      return await queryClient.invalidateQueries({
        queryKey: ["instalment-plans"],
      });
    },
    onError: (error) => {
      message.error(`Failed to create instalment plan: ${error.message}`);
    },
    onSuccess: (newInstalmentPlan) => {
      message.success(
        `New instalment plan "${newInstalmentPlan.name}" has been created.`,
      );
    },
  });

  const updateInstalmentPlanMutation = useMutation({
    mutationFn: updateInstalmentPlan,
    onSettled: async () => {
      return await queryClient.invalidateQueries({
        queryKey: ["instalment-plans"],
      });
    },
    onError: (error) => {
      message.error(`Failed to update instalment plan: ${error.message}`);
    },
  });

  const handleCreatePlan = (
    newInstalmentPlan: Omit<IInstalmentPlan, "instalment_plan_id">,
  ) => {
    createInstalmentPlanMutation.mutate(newInstalmentPlan);
    form.resetFields();
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

  const handleUpdatePlan = (
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

    updateInstalmentPlanMutation.mutate(updatedPlan);
    setIsModalOpen(false);
    setEditingPlan(null);
    message.success(`Instalment plan "${updatedPlan.name}" has been updated.`);
  };

  // TODO: Implement delete instalment plan
  const handleDeletePlan = (id: string) => {
    message.success("Instalment plan has been deleted.");
  };

  const columns = [
    {
      title: "Name",
      dataIndex: "name",
      key: "name",
    },
    {
      title: "Description",
      dataIndex: "description",
      key: "description",
    },
    {
      title: "Frequency",
      dataIndex: "frequency",
      key: "frequency",
    },
    {
      title: <div className="whitespace-nowrap">Interest Rate (%)</div>,
      dataIndex: "interest_rate",
      key: "interest_rate",
      width: 1,
    },
    {
      title: <div className="whitespace-nowrap">Minimum Amount ($)</div>,
      dataIndex: "minimum_amount",
      key: "minimum_amount",
      width: 1,
    },
    {
      title: <div className="whitespace-nowrap">Maximum Amount ($)</div>,
      dataIndex: "maximum_amount",
      key: "maximum_amount",
      width: 1,
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      width: 1,
      render: (text: string) => (
        <Tag color={text === "Active" ? "green" : "volcano"}>{text}</Tag>
      ),
    },
    {
      title: "Actions",
      key: "actions",
      width: 1,
      render: (text: string, record: IInstalmentPlan) => (
        <div className="whitespace-nowrap">
          <Button
            className="mr-2"
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
          name="frequency"
          label="Frequency"
          rules={[{ required: true, message: "Please select the frequency!" }]}
        >
          <Select>
            <Select.Option value="Weekly">Weekly</Select.Option>
            <Select.Option value="Every 2 Weeks">Every 2 Weeks</Select.Option>
            <Select.Option value="Monthly">Monthly</Select.Option>
            <Select.Option value="Quarterly">Quarterly</Select.Option>
            <Select.Option value="Yearly">Yearly</Select.Option>
          </Select>
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
              message: "Interest rate must be positive",
            },
          ]}
        >
          <InputNumber className="w-full" step={0.01} />
        </Form.Item>

        <Form.Item
          name="minimum_amount"
          label="Minimum Amount ($)"
          rules={[
            { required: true, message: "Please input the minimum amount!" },
            { type: "number", min: 0, message: "Amount must be positive" },
          ]}
        >
          <InputNumber className="w-full" step={0.01} />
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
          <InputNumber className="w-full" step={0.01} />
        </Form.Item>
      </div>

      <Form.Item
        name="description"
        label="Description"
        rules={[{ required: true, message: "Please input the description!" }]}
      >
        <Input.TextArea rows={1} />
      </Form.Item>

      <Form.Item>
        <Button type="primary" htmlType="submit" icon={<PlusOutlined />}>
          {formInstance === form
            ? "Create Instalment Plan"
            : "Update Instalment Plan"}
        </Button>
      </Form.Item>
    </Form>
  );

  return (
    <div className="px-8 py-20">
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
          dataSource={instalmentPlanListQuery.data}
          columns={columns}
          rowKey="instalment_plan_id"
          pagination={false}
          loading={instalmentPlanListQuery.isLoading}
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

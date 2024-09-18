import React, { useState } from "react";
import { Button, Modal, Popconfirm, Table, TableProps, Tag } from "antd";
import { PlusOutlined } from "@ant-design/icons";
import InstalmentPlanForm from "../components/instalmentPlanForm";
import { useQuery } from "@tanstack/react-query";
import { IInstalmentPlan } from "../interfaces/instalmentPlanInterface";

export default function InstalmentPlanPage() {
  const [plans, setPlans] = useState<IInstalmentPlan[]>([]);
  const [editingPlan, setEditingPlan] = useState<IInstalmentPlan | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const fetchInstalmentPlanList = async () => {
    const response = await fetch("http://localhost:3000/instalmentPlan");
    return response.json();
  };

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["instalment-plans"],
    queryFn: fetchInstalmentPlanList,
  });

  const handleDelete = (id: string) => {
    setPlans(plans.filter((plan) => plan.instalment_plan_id !== id));
  };

  const handleSubmit = (plan: IInstalmentPlan) => {
    setPlans([...plans, plan]);
    setIsModalOpen(false);
  };

  const columns: TableProps<IInstalmentPlan>["columns"] = [
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
      title: "Interest Rate (%)",
      dataIndex: "interest_rate",
      key: "interest_rate",
    },
    {
      title: "Minimum Amount ($)",
      dataIndex: "minimum_amount",
      key: "minimum_amount",
    },
    {
      title: "Maximum Amount ($)",
      dataIndex: "maximum_amount",
      key: "maximum_amount",
    },
    {
      title: "Status",
      key: "status",
      dataIndex: "status",
      render: (status) => (
        <Tag color={status === "Active" ? "green" : "volcano"} key={status}>
          {status.toUpperCase()}
        </Tag>
      ),
    },
    {
      title: "Actions",
      key: "actions",
      render: () => (
        <div className="flex gap-2">
          <Button
            className="font-semibold"
            onClick={() => {
              setIsModalOpen(false);
              setEditingPlan(editingPlan);
            }}
          >
            Edit
          </Button>
          <Popconfirm
            title="Delete the task"
            description="Are you sure to delete this task?"
            onConfirm={() => handleDelete(editingPlan!.instalment_plan_id)}
            okText="Yes"
            cancelText="No"
          >
            <Button className="font-semibold" type="primary" danger>
              Delete
            </Button>
          </Popconfirm>
        </div>
      ),
    },
  ];

  if (isLoading) return <div>Loading...</div>;
  if (isError) return <div>Error: {error.message}</div>;

  return (
    <div>
      <div className="flex items-center justify-between pb-8">
        <h1 className="text-2xl font-bold text-black">Instalment Plans</h1>
        <Button
          className="font-semibold"
          type="primary"
          onClick={() => {
            setEditingPlan(null);
            setIsModalOpen(true);
          }}
          icon={<PlusOutlined className="font-bold" />}
        >
          Create New Plan
        </Button>
      </div>

      <Table columns={columns} dataSource={data} />
      <Modal
        title={
          editingPlan ? "Edit Instalment Plan" : "Create New Instalment Plan"
        }
        okText={editingPlan ? "Save Changes" : "Create"}
        cancelText="Cancel"
        open={isModalOpen}
        onOk={() => {
          setIsModalOpen(false);
          handleSubmit(editingPlan!);
        }}
        onCancel={() => {
          setIsModalOpen(false);
        }}
        centered
        footer={null}
      >
        <InstalmentPlanForm
          handleSubmit={handleSubmit}
          handleCancel={() => setIsModalOpen(false)}
          editingPlan={editingPlan}
        />
      </Modal>
    </div>
  );
}

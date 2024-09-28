import React from "react";
import {
  Spin,
  Popconfirm,
  Button,
  Card,
  Table,
  Empty,
  Tag,
  message,
} from "antd";
import { useNavigate } from "react-router-dom";
import { ExclamationCircleOutlined } from "@ant-design/icons";
import { useGetAllCustomersQuery, useUpdateCustomerStatusMutation } from '../redux/services/customerService';
import { ICustomer } from "../interfaces/customerInterface";


const AllCustomersScreen = () => {
  const { data: customers, isLoading } = useGetAllCustomersQuery();
  const [updateCustomer] = useUpdateCustomerStatusMutation();
  const navigate = useNavigate();


  const columns = [
    {
      title: "Name",
      dataIndex: "name",
      key: "name",
    },
    {
      title: "Email",
      dataIndex: "email",
      key: "email",
    },
    {
      title: "Contact Number",
      dataIndex: "contact_number",
      key: "contact_number",
    },
    {
      title: "Credit Score",
      dataIndex: "credit_score",
      key: "credit_score",
    },
    {
      title: "Credit Tier ID",
      dataIndex: "credit_tier_id",
      key: "credit_tier_id",
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (text: string) => {
        let color = "geekblue";
        if (text === "ACTIVE") {
          color = "green";
        } else if (text === "SUSPENDED") {
          color = "volcano";
        }
        return <Tag color={color}>{text}</Tag>;
      },
    },
    {
      key: "actions",
      width: 1,
      render: (text: string, record: ICustomer) => (
        <div className="whitespace-nowrap">
          <Button
            className="mr-2"
            onClick={() => navigate(`/admin/customer/${record.customer_id}`)}
          >
            View Profile
          </Button>
          <Popconfirm
            title={
              record.status === "SUSPENDED"
                ? "Customer is suspended. Would you like to unsuspend the customer?"
                : "Are you sure you would like to suspend the customer?"
            }
            onConfirm={() =>
              updateCustomer(
                record.customer_id,
                record.status === "SUSPENDED" ? "ACTIVE" : "SUSPENDED",
              )
            }
            okText="Yes"
            cancelText="No"
          >
            <Button
              icon={<ExclamationCircleOutlined />}
              danger
              disabled={
                record.status !== "ACTIVE" && record.status !== "SUSPENDED"
              }
            >
              {record.status === "SUSPENDED" ? "Unsuspend" : "Suspend"}
            </Button>
          </Popconfirm>
        </div>
      ),
    },
  ];

  return (
    <div style={{ padding: "20px 100px" }}>
      <Card title="View All Customers">
        <Table
          dataSource={customers}
          columns={columns}
          locale={{
            emptyText: <Empty description="No customers found"></Empty>,
          }}
        />
      </Card>
    </div>
  );
};

export default AllCustomersScreen;

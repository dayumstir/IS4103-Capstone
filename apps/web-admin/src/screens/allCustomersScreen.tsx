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
} from "antd";
import { useNavigate } from "react-router-dom";
import { ExclamationCircleOutlined } from "@ant-design/icons";
import { useGetAllCustomersQuery, useUpdateCustomerStatusMutation } from '../redux/services/customerService';
import { ICustomer } from "../interfaces/customerInterface";

const { Search } = Input;


const AllCustomersScreen = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const { data: customers, isLoading } = useGetAllCustomersQuery(searchTerm);
  const [updateCustomer] = useUpdateCustomerStatusMutation();
  const navigate = useNavigate();

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const columns = [
    {
      title: "Name",
      dataIndex: "name",
      key: "name",
      sorter: (a: ICustomer, b: ICustomer) => a.name.localeCompare(b.name),
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
      defaultSortOrder: 'descend',
      sorter: (a: ICustomer, b: ICustomer) => a.credit_score - b.credit_score,
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
      filters: [
        { text: 'Active', value: 'ACTIVE' },
        { text: 'Suspended', value: 'SUSPENDED' },
        { text: 'Pending Email', value: 'PENDING_EMAIL_VERIFICATION' },
        { text: 'Pending Phone', value: 'PENDING_PHONE_VERIFICATION' },
      ],
      onFilter: (value: string, record: ICustomer) => record.status === value,
      render: (text: string) => {
        const formattedStatus = text.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
        let color = "geekblue";
        if (text === "ACTIVE") {
          color = "green";
        } else if (text === "SUSPENDED") {
          color = "volcano";
        }
        return <Tag color={color}>{formattedStatus}</Tag>;
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
              updateCustomer({
                customer_id: record.customer_id,
                status: record.status === "SUSPENDED" ? "ACTIVE" : "SUSPENDED"
              })
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
      <Search
          placeholder="Search by name, email, or contact"
          onChange={handleSearchChange}
          value={searchTerm}
          style={{ marginBottom: 16 }}
        />
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

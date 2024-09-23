import React, { useEffect, useState } from "react";
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

interface ICustomer {
  customer_id: string;
  name: string;
  profile_picture: Buffer;
  email: string;
  password: string;
  contact_number: string;
  address: string;
  date_of_birth: Date;
  status: string;
  credit_score: number;
  credit_tier_id: string;
}

const AllCustomersScreen: React.FC = () => {
  const [customers, setCustomers] = useState<ICustomer[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchAllCustomers = async () => {
      try {
        const jwt_token = localStorage.getItem("token");
        if (!jwt_token) {
          throw new Error("No token found");
        }

        const response = await fetch(
          "http://localhost:3000/admin/allCustomers",
          {
            method: "GET",
            headers: {
              Accept: "application/json",
              "Content-Type": "application/json",
              Authorization: `Bearer ${jwt_token}`,
            },
          },
        );

        if (!response.ok) {
          throw new Error("Failed to fetch customers");
        }

        const data = await response.json();
        setCustomers(data);
      } catch (error) {
        console.error("Failed to fetch customers:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchAllCustomers();
  }, [navigate]);

  if (loading) {
    return <Spin size="large" />;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  if (!customers || customers.length === 0) {
    return <div>No customer data available</div>;
  }

  // Function to update customer
  const updateCustomer = async (customer_id: string, newStatus: string) => {
    try {
      const jwt_token = localStorage.getItem("token");
      if (!jwt_token) {
        throw new Error("No token found");
      }

      const response = await fetch(
        `http://localhost:3000/admin/customer/${customer_id}`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ customer_id, status: newStatus }),
        },
      );

      if (!response.ok) {
        throw new Error("Failed to update customer status");
      }

      // Update frontend state to reflect status change
      setCustomers((prevCustomers) => {
        if (!prevCustomers) return prevCustomers;
        return prevCustomers.map((customer) =>
          customer.customer_id === customer_id
            ? { ...customer, status: newStatus }
            : customer,
        );
      });

      message.success(`Customer status updated to ${newStatus}.`);
    } catch (error) {
      console.error(`Failed to update customer status:`, error);
      message.error(`Failed to update customer status.`);
    }
  };

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

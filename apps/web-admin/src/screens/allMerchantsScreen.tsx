import React, { useEffect, useState } from "react";
import { Spin, Card, Empty, Table, Popconfirm, Button, Tag } from "antd";
import { useNavigate } from "react-router-dom";
import { ExclamationCircleOutlined } from "@ant-design/icons";

interface IMerchant {
  merchant_id: string;
  name: string;
  profile_picture: string;
  email: string;
  password: string;
  contact_number: string;
  address: string;
  date_of_birth: Date;
  status: string;
}

const AllMerchantsScreen: React.FC = () => {
  const [merchants, setMerchants] = useState<IMerchant[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchAllMerchants = async () => {
      try {
        const jwt_token = localStorage.getItem("token");
        if (!jwt_token) {
          throw new Error("No token found");
        }

        const response = await fetch(
          "http://localhost:3000/admin/allMerchants",
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
          throw new Error("Failed to fetch merchants");
        }

        const data = await response.json();
        setMerchants(data);
      } catch (error) {
        console.error("Failed to fetch merchants:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchAllMerchants();
  }, [navigate]);

  if (loading) {
    return <Spin size="large" />; // Display loading spinner while fetching
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  if (!merchants || merchants.length === 0) {
    return <div>No merchant data available</div>;
  }

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
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (text: string) => (
        <Tag color={text === "ACTIVE" ? "green" : "volcano"}>{text}</Tag>
      ),
    },
    {
      key: "actions",
      width: 1,
      render: (text: string, record: IMerchant) => (
        <div className="whitespace-nowrap">
          <Button
            className="mr-2"
            onClick={() => navigate(`/admin/merchant/${record.merchant_id}`)}
          >
            View Profile
          </Button>
          <Popconfirm
            title={
              record.status === "INACTIVE"
                ? "Merchant is suspended. Would you like to unsuspend the merchant?"
                : "Are you sure you would you like to suspend the merchant?"
            }
            onConfirm={() =>
              updateMerchant(
                record.merchant_id,
                record.status === "SUSPENDED" ? "ACTIVE" : "SUSPENDED", // Toggle status
              )
            }
            okText="Yes"
            cancelText="No"
          >
            <Button icon={<ExclamationCircleOutlined />} danger>
              {record.status === "SUSPENDED" ? "Unsuspend" : "Suspend"}
            </Button>
          </Popconfirm>
        </div>
      ),
    },
  ];

  return (
    <div style={{ padding: "20px 100px" }}>
      <Card title="View All Merchants">
        <Table
          dataSource={merchants}
          columns={columns}
          locale={{
            emptyText: <Empty description="No merchants found"></Empty>,
          }}
        />
      </Card>
    </div>
  );
};

export default AllMerchantsScreen;

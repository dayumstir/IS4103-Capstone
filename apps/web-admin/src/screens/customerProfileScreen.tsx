import React, { useEffect, useState } from "react";
import { Card, Typography, Spin, Avatar, Descriptions } from "antd";
import { EditOutlined, LeftOutlined } from "@ant-design/icons";
import { useParams, useNavigate } from "react-router-dom";
const { Title, Text } = Typography;

interface ICustomer {
  customer_id: string;
  name: string;
  profile_picture: string;
  email: string;
  contact_number: string;
  address: string;
  date_of_birth: Date;
  status: string;
  credit_score: number;
  credit_tier_id: string;
}

const CustomerProfileScreen: React.FC = () => {
  const { id } = useParams<{ id: string }>(); // Get customer_id from URL
  const [customer, setCustomer] = useState<ICustomer | null>(null);
  const [loading, setLoading] = useState(true);
  const [error] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCustomerProfile = async () => {
      try {
        const jwt_token = localStorage.getItem("token");
        if (!jwt_token) {
          throw new Error("No token found");
        }

        const response = await fetch(`http://localhost:3000/customer/${id}`, {
          method: "GET",
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
            Authorization: `Bearer ${jwt_token}`,
          },
        });

        if (!response.ok) {
          throw new Error("Failed to fetch customer profile");
        }

        const data = await response.json();
        setCustomer(data);
      } catch (error) {
        console.error("Failed to fetch customer profile:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchCustomerProfile();
  }, [id]);

  if (loading) {
    return <Spin size="large" />;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  if (!customer) {
    return <div>No customer profile available</div>;
  }

  return (
    <div style={{ padding: "30px" }}>
      <LeftOutlined
        style={{ fontSize: "40px" }}
        onClick={() => navigate("/admin/customers")}
      />
      <div style={{ padding: "20px 80px" }}>
        <Title level={2}>Customer Profile</Title>
        <Card
          cover={
            <Avatar
              size={100}
              src={customer.profile_picture}
              alt="Profile Picture"
            />
          }
        >
          <Descriptions bordered column={1}>
            <Descriptions.Item label="Name">{customer.name}</Descriptions.Item>
            <Descriptions.Item label="Email">
              {customer.email}
            </Descriptions.Item>
            <Descriptions.Item label="Contact">
              {customer.contact_number}
            </Descriptions.Item>
            <Descriptions.Item label="Address">
              {customer.address}
            </Descriptions.Item>
            <Descriptions.Item label="Status">
              {customer.status}
            </Descriptions.Item>
            <Descriptions.Item label="Credit Score">
              {customer.credit_score}
            </Descriptions.Item>
            <Descriptions.Item label="Credit Tier ID">
              {customer.credit_tier_id}
            </Descriptions.Item>
          </Descriptions>
        </Card>
      </div>
    </div>
  );
};

export default CustomerProfileScreen;
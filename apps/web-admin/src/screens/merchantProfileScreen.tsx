import React, { useEffect, useState } from "react";
import { Card, Typography, Spin, Avatar, Descriptions, Tag } from "antd";
import { EditOutlined, LeftOutlined, UserOutlined } from "@ant-design/icons";
import { useParams, useNavigate } from "react-router-dom";
import { IMerchant } from "@repo/interfaces";
const { Title, Text } = Typography;

const MerchantProfileScreen: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [merchant, setMerchant] = useState<IMerchant | null>(null);
  const [loading, setLoading] = useState(true);
  const [error] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchMerchantProfile = async () => {
      try {
        const jwt_token = localStorage.getItem("token");
        if (!jwt_token) {
          throw new Error("No token found");
        }

        const response = await fetch(
          `http://localhost:3000/admin/merchant/${id}`,
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
          throw new Error("Failed to fetch merchant profile");
        }

        const data = await response.json();
        if (data.profile_picture && data.profile_picture.data) {
          const base64String = btoa(
            new Uint8Array(data.profile_picture.data).reduce(
              (data, byte) => data + String.fromCharCode(byte),
              "",
            ),
          );
          data.profile_picture = `data:image/jpeg;base64,${base64String}`;
        }
        setMerchant(data);
      } catch (error) {
        console.error("Failed to fetch merchant profile:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchMerchantProfile();
  }, [id]);

  if (loading) {
    return <Spin size="large" />;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  if (!merchant) {
    return <div>No merchant profile available</div>;
  }

  return (
    <div style={{ padding: "30px" }}>
      <LeftOutlined
        style={{ fontSize: "40px" }}
        onClick={() => navigate("/admin/merchants")}
      />
      <div style={{ padding: "20px 80px" }}>
        <Title level={2}>Merchant Profile</Title>
        <Card
          cover={
            <Avatar
              size={100}
              src={
                merchant.profile_picture ? (
                  merchant.profile_picture
                ) : (
                  <Avatar
                    className="h-36 w-36 object-cover"
                    size={100}
                    icon={<UserOutlined />}
                  />
                )
              }
              alt="Merchant's Profile Picture"
            />
          }
        >
          <Descriptions bordered column={1}>
            <Descriptions.Item label="Name">{merchant.name}</Descriptions.Item>
            <Descriptions.Item label="Email">
              {merchant.email}
            </Descriptions.Item>
            <Descriptions.Item label="Contact">
              {merchant.contact_number}
            </Descriptions.Item>
            <Descriptions.Item label="Address">
              {merchant.address}
            </Descriptions.Item>
            <Descriptions.Item label="Status">
              {merchant.status}
            </Descriptions.Item>
          </Descriptions>
        </Card>
      </div>
    </div>
  );
};

export default MerchantProfileScreen;

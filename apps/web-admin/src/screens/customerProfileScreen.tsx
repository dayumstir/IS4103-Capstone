import React, { useEffect, useState } from "react";
import { Card, Typography, Spin, Avatar, Descriptions } from "antd";
import { EditOutlined, LeftOutlined, UserOutlined } from "@ant-design/icons";
import { useParams, useNavigate } from "react-router-dom";
import { useViewCustomerProfileQuery } from "../redux/services/customerService";
const { Title, Text } = Typography;

interface ICustomer {
  customer_id: string;
  name: string;
  profile_picture: Buffer;
  email: string;
  contact_number: string;
  address: string;
  date_of_birth: Date;
  status: string;
  credit_score: number;
  credit_tier_id: string;
}

export default function CustomerProfileScreen(){
  const { id } = useParams<{ id: string }>(); // Get customer_id from URL
  const { data: customer, isLoading } = useViewCustomerProfileQuery(id!);

  const navigate = useNavigate();
  

  if (isLoading) {
    return <Spin size="large" tip="Loading profile..." />;
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
              src={customer.profile_picture ? (
                customer.profile_picture
              ) : <Avatar className="h-36 w-36 object-cover" size={100} icon={<UserOutlined />} />}
              alt="Customer's Profile Picture"
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
}
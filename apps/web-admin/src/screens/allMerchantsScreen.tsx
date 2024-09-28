import React, { useEffect, useState } from "react";
import {
  Spin,
  Card,
  Empty,
  Table,
  Popconfirm,
  Button,
  Tag,
  message,
} from "antd";
import { useNavigate } from "react-router-dom";
import { ExclamationCircleOutlined } from "@ant-design/icons";
import { useGetAllMerchantsQuery, useUpdateMerchantStatusMutation } from '../redux/services/merchantService';
import { IMerchant } from "../interfaces/merchantInterface";

const AllMerchantsScreen = () => {
  const { data: merchants, isLoading } = useGetAllMerchantsQuery();
  const [updateMerchant] = useUpdateMerchantStatusMutation();
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
              record.status === "SUSPENDED"
                ? "Merchant is suspended. Would you like to unsuspend the merchant?"
                : "Are you sure you would like to suspend the merchant?"
            }
            onConfirm={() =>
              updateMerchant(
                record.merchant_id,
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

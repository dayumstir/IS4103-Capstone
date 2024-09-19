import React from "react";
import { Avatar, Button, Card, Space, Typography } from "antd";
import { UserOutlined } from "@ant-design/icons";

const HomeScreen = () => {
  const received = 100;
  const { Text } = Typography;

  return (
    <Space
      direction="vertical"
      style={{
        display: "flex",
        flexDirection: "column",
        height: window.outerHeight - 70 - 50,
        width: "100%",
      }}
      className="flex h-full w-full flex-col items-center"
    >
      <Text style={{ fontSize: 30 }}>
        Hello{" "}
        <Text strong={true} style={{ fontSize: 30 }}>
          User
        </Text>
      </Text>
      <Text>All payments have been received for this month!</Text>

      <Card
        style={{ backgroundColor: "#F5F5F5", width: 0.9 * window.outerWidth }}
      >
        <Space direction="vertical" align="center" style={{ width: "100%" }}>
          <Avatar size={64} icon={<UserOutlined />} />
          <Text strong={true} style={{ fontSize: 20 }}>
            ${received}
          </Text>
          <Text>have been received this month!</Text>
          <Button type="primary">Show my QR Code</Button>
        </Space>
      </Card>

      <Space style={{ flexGrow: 1 }}>
        <Space direction="vertical">
          <Text style={{ fontSize: 20 }}>Transactions</Text>
          <Card
            style={{
              width: 0.297 * window.outerWidth,
              backgroundColor: "#F5F5F5",
            }}
          ></Card>
        </Space>
        <Space direction="vertical">
          <Text style={{ fontSize: 20 }}>Payments</Text>
          <Card
            style={{
              width: 0.297 * window.outerWidth,
              backgroundColor: "#F5F5F5",
            }}
          ></Card>
        </Space>
        <Space direction="vertical">
          <Text style={{ fontSize: 20 }}>Cashback</Text>
          <Card
            style={{
              width: 0.297 * window.outerWidth,
              backgroundColor: "#F5F5F5",
            }}
          ></Card>
        </Space>
      </Space>
    </Space>
  );
};

export default HomeScreen;

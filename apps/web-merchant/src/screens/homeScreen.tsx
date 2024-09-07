import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams } from "react-router-dom";
import { LoadingOutlined } from "@ant-design/icons";
import { Avatar, Button, Card, Space, Spin, Typography } from "antd";
import { Alert } from "antd";
import { UserOutlined } from "@ant-design/icons";

const HomeScreen = () => {
  const received = 100;
  const { Text, Title } = Typography;

  return (
    // <Space
    //   direction="vertical"
    //   style={{ height: "100%" }}
    //   className="flex h-full w-full flex-col items-center justify-center"
    // >
    //   <Text style={{ fontSize: 30 }}>
    //     Hello{" "}
    //     <Text strong={true} style={{ fontSize: 30 }}>
    //       User
    //     </Text>
    //   </Text>
    //   <Text>All payments have been received for this month!</Text>

    //   <Card
    //     style={{ backgroundColor: "#F5F5F5", width: 0.9 * window.outerWidth }}
    //   >
    //     <Space direction="vertical" align="center" style={{ width: "100%" }}>
    //       <Avatar size={64} icon={<UserOutlined />} />
    //       <Text strong={true} style={{ fontSize: 20 }}>
    //         ${received}
    //       </Text>
    //       <Text>have been received this month!</Text>
    //       <Button type="primary">Show my QR Code</Button>
    //     </Space>
    //   </Card>
    //   <Space
    //     className="flex flex-row justify-center"
    //     style={{
    //       width: 0.9 * window.outerWidth,
    //       alignItems: "stretch",
    //       flexGrow: 1,
    //       height: "100%",
    //     }}
    //   >
    //     <Card style={{ flex: 1, backgroundColor: "#F5F5F5" }}>hehe</Card>
    //     <Card style={{ flex: 1, backgroundColor: "#F5F5F5" }}>hehe</Card>
    //     <Card style={{ flex: 1, backgroundColor: "#F5F5F5" }}>hehe</Card>
    //   </Space>
    // </Space>

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

    //   {/* <h1>Latest Products</h1>
    //     {loading ? (
    //         <Spin indicator={<LoadingOutlined spin />} size="large" />
    //     ) : error ? (
    //         <Alert message={error} type="error" />
    //     ) : (

    //     )} */}
  );
};

export default HomeScreen;

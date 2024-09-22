import React, { useEffect, useState } from "react";
import { Avatar, Button, Card, Space, Typography } from "antd";
import { UserOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { useGetProfileQuery } from "../redux/services/profile";
import { Buffer } from "buffer";

const HomeScreen = () => {
  const received = 100;
  const { Text } = Typography;
  const navigate = useNavigate();
  const merchantId = localStorage.getItem("merchantId");
  if (!merchantId) {
    navigate("/login");
    return null;
  }
  const [profilePictureDisplay, setProfilePictureDisplay] = useState("");

  const { data: profile } = useGetProfileQuery(merchantId);

  useEffect(() => {
    if (profile?.profile_picture) {
      const profilePictureBase64 = `data:image/png;base64,${Buffer.from(profile.profile_picture).toString("base64")}`;
      setProfilePictureDisplay(profilePictureBase64);
    }
  });

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
          {profile?.name}
        </Text>
      </Text>
      <Text>All payments have been received for this month!</Text>

      <Card
        style={{ backgroundColor: "#F5F5F5", width: 0.9 * window.outerWidth }}
      >
        <Space direction="vertical" align="center" style={{ width: "100%" }}>
          {profilePictureDisplay != "" ? (
            <img
              src={profilePictureDisplay}
              alt="avatar1"
              className="h-36 w-36 object-cover"
            />
          ) : (
            <Avatar
              className="h-36 w-36 object-cover"
              icon={<UserOutlined />}
            />
          )}
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

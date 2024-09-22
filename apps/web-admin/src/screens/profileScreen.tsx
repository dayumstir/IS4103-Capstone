import React, { useEffect, useState } from "react";
import { Avatar, Card, Typography, Spin, Button, Alert, Modal, Form, Input, message } from "antd";
import { useNavigate } from "react-router-dom";
import { UserOutlined } from "@ant-design/icons";
import { Buffer } from "buffer";

const { Title, Text } = Typography;

interface AdminProfileData {
  username: string;
  email: string;
  name: string;
  contact_number: string;
  address: string;
  date_of_birth: string;
  profile_picture:string;
}

const ProfileScreen: React.FC = () => {
  const [user, setUser] = useState<AdminProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [form] = Form.useForm();

  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const jwt_token = localStorage.getItem("token");
        if (!jwt_token) {
          throw new Error("No token found");
        }

        const response = await fetch("http://localhost:3000/admin/profile", {
          method: "GET",
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
            Authorization: `Bearer ${jwt_token}`,
          },
        });

        if (!response.ok) {
          throw new Error("Failed to fetch user profile");
        }

        const data = await response.json();
        setUser(data);
      } catch (error) {
        console.error("Failed to fetch user information:", error);
        setError("Could not fetch user data. Redirecting to login...");
        setTimeout(() => navigate("/login"), 3000);
      } finally {
        setLoading(false);
      }
    };

    fetchUserProfile();
  }, [navigate]);

  const showModal = () => {
    setIsModalVisible(true);
  };

  const handleOk = () => {
    setIsModalVisible(false);
  };

  const handleCancel = () => {
    setIsModalVisible(false);
    form.resetFields();
  };

  const onFinish = async (values: { oldPassword: string; newPassword: string }) => {
    const { oldPassword, newPassword } = values;

    try {
      const email = user?.email;
      const response = await fetch("http://localhost:3000/adminauth/reset-password", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, oldPassword, newPassword }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Could not update password.");
      }

      message.success("Password changed successfully!");
      handleCancel(); 
    } catch (error) {
      console.error("Error updating password:", error);
      message.error("Could not update password. Please try again.");
    }
  };

  if (loading) {
    return <Spin size="large" tip="Loading profile..." />;
  }

  if (error) {
    return <Alert message={error} type="error" showIcon />;
  }

  if (!user) {
    return <div>No user data available</div>;
  }

  return (
    <div style={{ padding: "20px" }}>
      <Card title="Admin Profile" style={{ width: 300 }}>

      <Title level={4}>Profile Picture</Title>
      {user.profile_picture ? (
          <img
            src={`data:image/png;base64,${Buffer.from(user.profile_picture).toString("base64")}`}
            alt="avatar1"
            className="h-36 w-36 object-cover"
          />
        ) : (
          <Avatar className="h-36 w-36 object-cover" icon={<UserOutlined />} />
        )}

        <Title level={4}>Username</Title>
        <Text>{user.username}</Text>
        <Title level={4}>Email</Title>
        <Text>{user.email}</Text>
        <Title level={4}>Name</Title>
        <Text>{user.name}</Text>
        <Title level={4}>Contact Number</Title>
        <Text>{user.contact_number}</Text>
        <Title level={4}>Address</Title>
        <Text>{user.address}</Text>
        <Title level={4}>Date of Birth</Title>
        <Text>{new Date(user.date_of_birth).toLocaleDateString()}</Text>

        <div>
          <Button
            type="primary"
            style={{ marginTop: 16 }}
            onClick={() => navigate("/admin/editprofile")}
          >
            Edit Profile
          </Button>
          <Button
            type="default"
            style={{ marginTop: 16, marginLeft: 8 }}
            onClick={showModal}
            aria-label="Reset Password"
          >
            Reset Password
          </Button>
        </div>
      </Card>

      <Modal
        title="Reset Password"
        visible={isModalVisible}
        onOk={handleOk}
        onCancel={handleCancel}
        footer={null}
      >
        <Form
          form={form}
          name="resetPassword"
          labelCol={{ span: 6 }}
          wrapperCol={{ span: 16 }}
          onFinish={onFinish}
          autoComplete="off"
        >
          <Form.Item
            label="Old Password"
            name="oldPassword"
            rules={[{ required: true, message: "Please input your old password" }]}
          >
            <Input.Password />
          </Form.Item>

          <Form.Item
            label="New Password"
            name="newPassword"
            rules={[
              { required: true, message: "Please input your new password" },
              {
                validator: (_, value) => {
                  const oldPassword = form.getFieldValue("oldPassword");
                  if (value && value === oldPassword) {
                    return Promise.reject(new Error("New password cannot be the same as old password"));
                  }
                  return Promise.resolve();
                },
              },
            ]}
          >
            <Input.Password />
          </Form.Item>

          <Form.Item
            label="Confirm New Password"
            name="confirmPassword"
            rules={[
              { required: true, message: "Please input your new password" },
              {
                validator: (_, value) => {
                  const newPassword = form.getFieldValue("newPassword");
                  if (value && value !== newPassword) {
                    return Promise.reject(new Error("New password fields do not match"));
                  }
                  return Promise.resolve();
                },
              },
            ]}
          >
            <Input.Password />
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit">
              Change Password
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default ProfileScreen;

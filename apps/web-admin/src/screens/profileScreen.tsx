import { useState } from "react";
import {
  Avatar,
  Card,
  Typography,
  Spin,
  Button,
  Modal,
  Form,
  Input,
  message,
} from "antd";
import { useNavigate } from "react-router-dom";
import { UserOutlined } from "@ant-design/icons";
import { Buffer } from "buffer";
import { useViewProfileQuery } from "../redux/services/adminService";
import { useResetPasswordMutation } from "../redux/services/adminAuthService";

const { Title, Text } = Typography;

export default function ProfileScreen() {
  const { data: user, isLoading } = useViewProfileQuery();
  const [resetPassword, { isLoading: isResetting }] =
    useResetPasswordMutation();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form] = Form.useForm();

  const navigate = useNavigate();

  const validatePassword = (password: string) => {
    const passwordRegex =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]{8,}$/;
    return passwordRegex.test(password);
  };

  const onFinish = async (values: {
    oldPassword: string;
    newPassword: string;
  }) => {
    const { oldPassword, newPassword } = values;

    if (!user?.email) {
      message.error("User email not available");
      return;
    }

    try {
      await resetPassword({
        email: user.email,
        oldPassword,
        newPassword,
      }).unwrap();
      message.success("Password changed successfully!");
      setIsModalOpen(false);
      form.resetFields();
    } catch (error) {
      console.error("Error updating password:", error);
      message.error("Could not update password. Please try again.");
    }
  };

  if (isLoading) {
    return <Spin size="large" tip="Loading profile..." />;
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
            onClick={() => setIsModalOpen(true)}
            aria-label="Reset Password"
          >
            Reset Password
          </Button>
        </div>
      </Card>

      <Modal
        title="Reset Password"
        open={isModalOpen}
        onOk={() => setIsModalOpen(false)}
        onCancel={() => {
          setIsModalOpen(false);
          form.resetFields();
        }}
        footer={null}
      >
        <Form
          form={form}
          name="resetPassword"
          labelCol={{ span: 8 }}
          wrapperCol={{ span: 16 }}
          onFinish={onFinish}
          autoComplete="off"
        >
          <Form.Item
            label="Old Password"
            name="oldPassword"
            rules={[
              { required: true, message: "Please input your old password" },
            ]}
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
                  const oldPassword = form.getFieldValue("oldPassword"); // Get the old password

                  // Check if the new password is the same as the old password
                  if (value === oldPassword) {
                    return Promise.reject(
                      new Error(
                        "New password cannot be the same as the old password.",
                      ),
                    );
                  }

                  // Check the password validation criteria
                  if (!validatePassword(value)) {
                    return Promise.reject(
                      new Error(
                        "New password must have at least 1 lowercase letter, 1 uppercase letter, 1 digit, 1 special character, and be at least 8 characters long.",
                      ),
                    );
                  }

                  return Promise.resolve(); // If all checks pass
                },
              },
            ]}
          >
            <Input.Password />
          </Form.Item>

          <Form.Item
            label="Confirm Password"
            name="confirmPassword"
            rules={[
              { required: true, message: "Please input your new password" },
              {
                validator: (_, value) => {
                  const newPassword = form.getFieldValue("newPassword");
                  if (value && value !== newPassword) {
                    return Promise.reject(
                      new Error("New password fields do not match"),
                    );
                  }
                  return Promise.resolve();
                },
              },
            ]}
          >
            <Input.Password />
          </Form.Item>

          <Form.Item className="flex w-full justify-end">
            <Button
              type="primary"
              htmlType="submit"
              loading={isResetting}
              disabled={isResetting}
            >
              Change Password
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}

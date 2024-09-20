import React, { useState, useEffect } from "react";
import type { FormProps } from "antd";
import { Button, Card, Form, Input, Space, Typography, message } from "antd";
import { useNavigate } from "react-router-dom";

const { Title } = Typography;

type FieldType = {
  oldPassword: string;
  newPassword: string;
};

const ResetPasswordScreen: React.FC = () => {
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);
  const [email, setEmail] = useState<string | null>(null);
  const [form] = Form.useForm();

  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        const response = await fetch("http://localhost:3000/admin/profile", {
          method: "GET",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
            "Content-Type": "application/json",
          },
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        setEmail(data.email); // Store the email for use in the request
      } catch (error) {
        console.error("Error fetching profile data:", error);
        setError("Could not fetch profile data. Please try again later.");
      }
    };

    fetchProfileData();
  }, []);

  const onFinish: FormProps<FieldType>["onFinish"] = async (values) => {
    const { oldPassword, newPassword } = values;

    try {
      const response = await fetch(
        "http://localhost:3000/adminauth/reset-password",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ email, oldPassword, newPassword }),
        },
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      // Show success message
      message.success("Password changed successfully!");
      navigate("/admin/profile");
    } catch (error) {
      console.error("Error updating profile:", error);
      setError("Could not update profile. Please try again.");
    }
  };

  const onFinishFailed: FormProps<FieldType>["onFinishFailed"] = (
    errorInfo,
  ) => {
    console.log("Failed:", errorInfo);
  };

  return (
    <Space
      direction="vertical"
      className="flex h-screen items-start justify-start pl-4 pt-4"
    >
      <Title level={3}>Reset Password</Title>
      <Card style={{ backgroundColor: "#F5F5F5" }}>
        <Form
          form={form}
          name="resetPassword"
          labelCol={{ span: 6 }}
          wrapperCol={{ span: 16 }}
          style={{ minWidth: 600 }}
          onFinish={onFinish}
          onFinishFailed={onFinishFailed}
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
                  const oldPassword = form.getFieldValue("oldPassword"); // Use the form instance to get the old password
                  if (value && value === oldPassword) {
                    return Promise.reject(
                      new Error(
                        "New password and old password cannot be the same",
                      ),
                    );
                  }
                  return Promise.resolve();
                },
              },
            ]}
          >
            <Input.Password />
          </Form.Item>

          {error && (
            <Form.Item wrapperCol={{ offset: 6, span: 16 }}>
              <span style={{ color: "red" }}>{error}</span>
            </Form.Item>
          )}

          <Form.Item wrapperCol={{ offset: 6, span: 16 }}>
            <Button type="primary" htmlType="submit">
              Change Password
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </Space>
  );
};

export default ResetPasswordScreen;

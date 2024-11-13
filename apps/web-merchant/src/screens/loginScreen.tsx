// apps/web-merchant/src/screens/loginScreen.tsx

import { LoadingOutlined } from "@ant-design/icons";
import { Button, Card, Form, Input, message, Modal, Space, Spin, Typography } from "antd";
import React, { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import logo from "../assets/pandapay_logo.png";
import PendingEmailConfirmationModal from "../components/pendingEmailConfirmationModal";
import { useLoginMutation, useResetPasswordMutation } from "../redux/services/auth";

export type LoginFormValues = {
  email?: string;
  password?: string;
};

const LoginScreen: React.FC = () => {
  const { Text, Title } = Typography;
  const [loginMutation, { isLoading }] = useLoginMutation();
  const [resetPasswordMutation, { isLoading: isResetting }] = useResetPasswordMutation();
  const navigate = useNavigate();
  const [pendingEmailConfirmationModalOpen, setPendingEmailConfirmationModalOpen] = useState(false);

  // New states for handling password reset
  const [isResetPasswordModalOpen, setIsResetPasswordModalOpen] = useState(false);
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [merchantId, setMerchantId] = useState<string>("");

  // Form instances
  const [loginForm] = Form.useForm();
  const [resetPasswordForm] = Form.useForm();

  const onFinish = async (data: LoginFormValues) => {
    try {
      const result = await loginMutation(data).unwrap();

      // Store token and merchantId
      localStorage.setItem("token", result.token);
      localStorage.setItem("merchantId", result.id);

      // Store email and password for reset
      setEmail(data.email || "");
      setPassword(data.password || "");
      setMerchantId(result.id);

      if (result.forgot_password) {
        message.info("Please reset your password.");
        setIsResetPasswordModalOpen(true);
      } else {
        navigate("/");
      }
    } catch (error: any) {
      if (error.data.error === "Email pending verification" && data.email) {
        localStorage.setItem("email", data.email);
        setPendingEmailConfirmationModalOpen(true);
      } else {
        message.error(error.data.error || "Login failed. Please try again.");
      }
    }
  };

  // Handler for resetting the password
  const handleResetPassword = async (values: { newPassword: string; confirmPassword: string }) => {
    try {
      await resetPasswordMutation({
        id: merchantId,
        body: {
          oldPassword: password,
          newPassword: values.newPassword,
        },
      }).unwrap();

      message.success("Password reset successful!");
      setIsResetPasswordModalOpen(false);
      resetPasswordForm.resetFields();

      // Clear stored credentials
      setEmail("");
      setPassword("");
      setMerchantId("");

      // Navigate to home page
      navigate("/");
    } catch (error: any) {
      message.error(error.data.error || "Password reset failed. Please try again.");
    }
  };

  return (
    <Space
      direction="vertical"
      className="flex h-screen items-center justify-center"
    >
      {pendingEmailConfirmationModalOpen && (
        <PendingEmailConfirmationModal
          isModalOpen={pendingEmailConfirmationModalOpen}
          setModalOpen={setPendingEmailConfirmationModalOpen}
        />
      )}
      <img
        src={logo}
        width="100%"
        style={{ alignSelf: "center" }}
        alt="PandaPay Logo"
      />
      <Title>PandaPay</Title>
      <Title level={3}>Your ultimate BNPL Provider</Title>
      <Card style={{ backgroundColor: "#F5F5F5" }}>
        <Form
          form={loginForm}
          name="basic"
          labelCol={{ span: 6 }}
          wrapperCol={{ span: 16 }}
          style={{ minWidth: 600 }}
          onFinish={onFinish}
          autoComplete="off"
        >
          <Form.Item<LoginFormValues>
            label="Email"
            name="email"
            rules={[
              { required: true, message: "Please input your Email!" },
              { type: "email", message: "Please enter a valid email address!" },
            ]}
          >
            <Input />
          </Form.Item>

          <Form.Item<LoginFormValues>
            label="Password"
            name="password"
            rules={[{ required: true, message: "Please input your password!" }]}
          >
            <Input.Password />
          </Form.Item>

          <Form.Item wrapperCol={{ offset: 6, span: 16 }}>
            <Button
              type="primary"
              htmlType="submit"
              loading={isLoading}
              disabled={isLoading}
            >
              {isLoading ? <Spin indicator={<LoadingOutlined spin />} /> : "Login"}
            </Button>
            <Button
              type="link"
              onClick={() => navigate("/forget-password")}
              className="ml-2"
            >
              Forget Password?
            </Button>
          </Form.Item>

          <Form.Item wrapperCol={{ offset: 6, span: 30 }}>
            <Text>
              Don't have an account yet?{" "}
              <NavLink to="/register">Click to Register</NavLink>
            </Text>
          </Form.Item>
        </Form>
      </Card>

      {/* Reset Password Modal */}
      <Modal
        title="Reset Password"
        open={isResetPasswordModalOpen}
        onCancel={() => {
          setIsResetPasswordModalOpen(false);
          resetPasswordForm.resetFields();
        }}
        footer={null}
      >
        <Form
          form={resetPasswordForm}
          name="resetPasswordForm"
          labelCol={{ span: 8 }}
          wrapperCol={{ span: 16 }}
          onFinish={handleResetPassword}
          autoComplete="off"
        >
          <Form.Item
            label="New Password"
            name="newPassword"
            rules={[
              { required: true, message: "Please input your new password" },
              {
                validator: (_, value) => {
                  if (value === password) {
                    return Promise.reject(
                      new Error("New password cannot be the same as the old password.")
                    );
                  }
                  // Add password complexity validation if needed
                  return Promise.resolve();
                },
              },
            ]}
            hasFeedback
          >
            <Input.Password />
          </Form.Item>

          <Form.Item
            label="Confirm Password"
            name="confirmPassword"
            dependencies={["newPassword"]}
            hasFeedback
            rules={[
              { required: true, message: "Please confirm your new password" },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue("newPassword") === value) {
                    return Promise.resolve();
                  }
                  return Promise.reject(new Error("Passwords do not match"));
                },
              }),
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
    </Space>
  );
};

export default LoginScreen;

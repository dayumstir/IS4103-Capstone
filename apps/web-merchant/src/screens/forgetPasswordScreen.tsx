// apps/web-merchant/src/screens/forgetPasswordScreen.tsx
import React, { useState } from "react";
import { Button, Card, Form, Input, Typography, Space, message } from "antd";
import { useNavigate } from "react-router-dom";
import logo from "../assets/pandapay_logo.png";
import { useForgetPasswordMutation } from "../redux/services/auth";

const ForgetPasswordScreen: React.FC = () => {
  const { Title } = Typography;
  const navigate = useNavigate();

  // Form instance
  const [form] = Form.useForm();

  // Mutation hook
  const [forgetPassword] = useForgetPasswordMutation();
  const [isSending, setIsSending] = useState(false);

  // Forget password handler
  const handleForgetPassword = async (values: { email: string }) => {
    setIsSending(true); // Start loading state
    const MIN_LOADING_DURATION = 2000; // Minimum loading duration in milliseconds
    const startTime = Date.now();

    try {
      await forgetPassword(values).unwrap();
    } catch {
      // Handle silently to keep consistent messaging
    } finally {
      const elapsedTime = Date.now() - startTime;
      const remainingTime = MIN_LOADING_DURATION - elapsedTime;

      // Ensure the loading state lasts at least MIN_LOADING_DURATION
      setTimeout(() => {
        setIsSending(false); // End loading state after minimum duration
        message.success(
          "A new username and password has been sent to your email. Please check your inbox."
        );
        form.resetFields(); // Reset the form fields
      }, remainingTime > 0 ? remainingTime : 0);
    }
  };

  return (
    <Space
      direction="vertical"
      className="flex h-screen items-center justify-center"
    >
      <img src={logo} width="100%" style={{ alignSelf: "center" }} alt="PandaPay Logo" />
      <Title>PandaPay</Title>
      <Title level={3}>Forget Password</Title>
      <Card style={{ backgroundColor: "#F5F5F5" }}>
        <Form
          name="forgetPasswordForm"
          form={form}
          labelCol={{ span: 6 }}
          wrapperCol={{ span: 16 }}
          style={{ minWidth: 600 }}
          onFinish={handleForgetPassword}
          autoComplete="off"
        >
          <Form.Item
            label="Email"
            name="email"
            rules={[
              { required: true, message: "Please input your email!" },
              { type: "email", message: "The input is not a valid email!" },
            ]}
            validateTrigger="onSubmit" // Trigger validation only on form submission
          >
            <Input />
          </Form.Item>

          <Form.Item wrapperCol={{ offset: 6, span: 16 }}>
            <Button
              type="primary"
              htmlType="submit"
              loading={isSending} // Show loading state while mutation is processing
              disabled={isSending}
            >
              Send Email
            </Button>
            <Button
              type="link"
              onClick={() => navigate("/login")}
              className="ml-2"
            >
              Back to Login
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </Space>
  );
};

export default ForgetPasswordScreen;

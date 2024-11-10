import { useState } from "react";
import {
  Button,
  Card,
  Form,
  Input,
  Typography,
  Space,
  Modal,
  message,
} from "antd";
import { useNavigate } from "react-router-dom";
import logo from "../assets/pandapay_logo.png";
import {
  useForgetPasswordMutation,
  useLoginMutation,
  useResetPasswordMutation,
} from "../redux/services/adminAuthService";

export default function ForgetPasswordScreen() {
  const navigate = useNavigate();
  const { Title } = Typography;

  // States
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form
  const [form] = Form.useForm();

  // Mutations
  const [forgetPassword, { isLoading: isSending }] = useForgetPasswordMutation();
  const [login, { isLoading: isLoggingIn }] = useLoginMutation();
  const [resetPassword, { isLoading: isResetting }] = useResetPasswordMutation();

  // Forget password handler
  const handleForgetPassword = async (values: { email: string }) => {
    try {
      await forgetPassword(values).unwrap();
      message.success(
        "A new username and password has been sent to your email. Please use them to log in."
      );

      setEmail(values.email);
      form.resetFields();
    } catch {
      message.error("The provided email is invalid. Please try again.");
    }
  };

  // Login handler
  const handleLogin = async (values: { username: string; password: string }) => {
    try {
      await login(values).unwrap();
      setPassword(values.password);

      message.success("Logged in successfully! Please reset your password.");
      setIsModalOpen(true);
    } catch {
      message.error("Invalid username or password. Please try again.");
    }
  };

  // Password reset handler
  const handlePasswordReset = async (values: { newPassword: string }) => {
    try {
      await resetPassword({ email, oldPassword: password, newPassword: values.newPassword }).unwrap();
      message.success("Password changed successfully!");
      setIsModalOpen(false);
      setEmail("");
      setPassword("");
      form.resetFields();
      navigate("/");
    } catch {
      message.error("Could not update password. Please try again.");
    }
  };

  return (
    <Space
      direction="vertical"
      className="flex h-screen items-center justify-center"
    >
      <img src={logo} width="100%" style={{ alignSelf: "center" }} alt="PandaPay Logo" />
      <Title>PandaPay Admin</Title>
      <Title level={3}>{!email ? "Forget Password" : "Login with Temporary Password"}</Title>
      <Card style={{ backgroundColor: "#F5F5F5" }}>
        {!email ? (
          <Form
            name="forgetPasswordForm"
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
                {
                  type: "email",
                  message: "The input is not a valid email!",
                },
              ]}
              validateTrigger="onSubmit" // Trigger validation only on form submission
            >
              <Input />
            </Form.Item>

            <Form.Item wrapperCol={{ offset: 6, span: 16 }}>
              <Button
                type="primary"
                htmlType="submit"
                loading={isSending}
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
        ) : (
          <Form
            name="loginForm"
            labelCol={{ span: 6 }}
            wrapperCol={{ span: 16 }}
            style={{ minWidth: 600 }}
            onFinish={handleLogin}
            autoComplete="off"
          >
            <Form.Item
              label="Username"
              name="username"
              rules={[{ required: true, message: "Please input your username!" }]}
              validateTrigger="onSubmit"
            >
              <Input />
            </Form.Item>
            <Form.Item
              label="Password"
              name="password"
              rules={[
                { required: true, message: "Please input your password!" },
                {
                  validator: (_, value) =>
                    value
                      ? Promise.resolve()
                      : Promise.reject(new Error("Password is required")),
                },
              ]}
              validateTrigger="onSubmit"
            >
              <Input.Password />
            </Form.Item>

            <Form.Item wrapperCol={{ offset: 6, span: 16 }}>
              <Button
                type="primary"
                htmlType="submit"
                loading={isLoggingIn}
                disabled={isLoggingIn}
              >
                Login
              </Button>
              <Button
                type="link"
                onClick={() => setEmail("")}
                className="ml-2"
              >
                Back to Email Input
              </Button>
            </Form.Item>
          </Form>
        )}
      </Card>

      {/* Reset Password Modal */}
      <Modal
        title="Reset Password"
        open={isModalOpen}
        onCancel={() => {
          setIsModalOpen(false);
          form.resetFields();
        }}
        footer={null}
      >
        <Form
          form={form}
          name="resetPasswordForm"
          labelCol={{ span: 8 }}
          wrapperCol={{ span: 16 }}
          onFinish={handlePasswordReset}
          autoComplete="off"
        >
          <Form.Item
            label="New Password"
            name="newPassword"
            rules={[
              { required: true, message: "Please input your new password" },
              {
                validator: (_, value) =>
                  value !== password
                    ? Promise.resolve()
                    : Promise.reject(
                        new Error(
                          "New password cannot be the same as the old password."
                        )
                      ),
              },
            ]}
            validateTrigger="onSubmit"
          >
            <Input.Password />
          </Form.Item>

          <Form.Item
            label="Confirm Password"
            name="confirmPassword"
            rules={[
              { required: true, message: "Please confirm your new password" },
              {
                validator: (_, value) =>
                  value === form.getFieldValue("newPassword")
                    ? Promise.resolve()
                    : Promise.reject(new Error("Passwords do not match")),
              },
            ]}
            validateTrigger="onSubmit"
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
}

// apps/web-admin/src/screens/loginScreen.tsx
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
  useLoginMutation, 
  useLogoutMutation, 
  useResetPasswordMutation 
} from "../redux/services/adminAuthService";

export default function LoginScreen() {
  const navigate = useNavigate();
  const { Text, Title } = Typography;

  // States
  const [error, setError] = useState<string | null>(null);
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form
  const [form] = Form.useForm();

  // Mutations
  const [login, { isLoading }] = useLoginMutation();
  const [logout] = useLogoutMutation();
  const [resetPassword, { isLoading: isResetting }] = useResetPasswordMutation();

  // Password validation
  const validatePassword = (password: string) =>
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]{8,}$/.test(password);

  // Login handler
  const handleLogin = async (values: { username: string; password: string }) => {
    try {
      const response = await login(values).unwrap();
      setEmail(response.email);
      setPassword(values.password);

      if (response.admin_type === "DEACTIVATED") {
        setError("Account Deactivated");
        await logout().unwrap();
        localStorage.removeItem("token");
        navigate("/login");
      } else if (response.admin_type === "UNVERIFIED") {
        setError(null);
        setIsModalOpen(true);
      } else {
        navigate("/");
      }
    } catch {
      setError("Invalid username or password. Please try again.");
    }
  };

  // Password reset handler
  const handlePasswordReset = async (values: { newPassword: string }) => {
    const { newPassword } = values;

    if (!email) {
      message.error("User email not available");
      return;
    }

    if (newPassword === password) {
      message.error("Please key in a new password");
      return;
    }

    try {
      await resetPassword({ email, oldPassword: password, newPassword }).unwrap();
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
      <Title level={3}>Staff Login</Title>
      <Card style={{ backgroundColor: "#F5F5F5" }}>
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
          >
            <Input />
          </Form.Item>

          <Form.Item
            label="Password"
            name="password"
            rules={[{ required: true, message: "Please input your password!" }]}
          >
            <Input.Password />
          </Form.Item>

          {error && (
            <Form.Item wrapperCol={{ offset: 6, span: 16 }}>
              <Text type="danger">{error}</Text>
            </Form.Item>
          )}

          <Form.Item wrapperCol={{ offset: 6, span: 16 }}>
            <Button
              type="primary"
              htmlType="submit"
              loading={isLoading}
              disabled={isLoading}
            >
              Login
            </Button>
            <Button
                type="link"
                onClick={() => navigate("/forget-password")}
                className="ml-2"
              >
                Forget Password?
              </Button>
          </Form.Item>
        </Form>
      </Card>

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
                validator: (_, value) => {
                  if (value === form.getFieldValue("oldPassword")) {
                    return Promise.reject(
                      new Error("New password cannot be the same as the old password.")
                    );
                  }
                  if (!validatePassword(value)) {
                    return Promise.reject(
                      new Error(
                        "Password must have at least 1 lowercase, 1 uppercase, 1 digit, 1 special character, and 8 characters minimum."
                      )
                    );
                  }
                  return Promise.resolve();
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
              { required: true, message: "Please confirm your new password" },
              {
                validator: (_, value) => {
                  if (value !== form.getFieldValue("newPassword")) {
                    return Promise.reject(new Error("Passwords do not match"));
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
    </Space>
  );
}

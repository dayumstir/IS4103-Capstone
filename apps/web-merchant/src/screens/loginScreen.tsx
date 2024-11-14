// apps/web-merchant/src/screens/loginScreen.tsx
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
import { useNavigate, NavLink } from "react-router-dom";
import logo from "../assets/pandapay_logo.png";
import PendingEmailConfirmationModal from "../components/pendingEmailConfirmationModal";
import {
  useLoginMutation,
  useResetPasswordMutation,
} from "../redux/services/auth";

export default function LoginScreen() {
  const navigate = useNavigate();
  const { Text, Title } = Typography;

  // States
  const [error, setError] = useState<string | null>(null);
  // const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  // const [merchantId, setMerchantId] = useState<string>("");
  const [pendingEmailConfirmationModalOpen, setPendingEmailConfirmationModalOpen] = useState(false);

  // Form instances
  const [loginForm] = Form.useForm();
  const [resetPasswordForm] = Form.useForm();

  // Mutations
  const [login, { isLoading }] = useLoginMutation();
  const [resetPassword, { isLoading: isResetting }] = useResetPasswordMutation();

  // Password validation
  const validatePassword = (password: string) =>
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]{8,}$/.test(password);

  // Login handler
  const handleLogin = async (values: { email: string; password: string }) => {
    try {
      const result = await login(values).unwrap();

      // Store token and merchantId
      localStorage.setItem("token", result.token);
      localStorage.setItem("merchantId", result.id);

      // Store email and password for reset
      setPassword(values.password);

      if (result.forgot_password) {
        setError(null);
        setIsModalOpen(true);
      } else {
        navigate("/");
      }
    } catch (error: any) {
      if (error.data.error === "Email pending verification" && values.email) {
        localStorage.setItem("email", values.email);
        setPendingEmailConfirmationModalOpen(true);
      } else {
        setError("Invalid email or password. Please try again.");
      }
    }
  };

  // Password reset handler
  const handlePasswordReset = async (values: { newPassword: string }) => {
    const { newPassword } = values;
    const merchantId = localStorage.getItem("merchantId");

    if (!merchantId) {
      message.error("Merchant ID not available");
      return;
    }

    if (newPassword === password) {
      message.error("Please key in a new password");
      return;
    }

    try {
      await resetPassword({id: merchantId,
        body: {
          oldPassword: password,
          newPassword: newPassword,
        },
      }).unwrap();

      message.success("Password changed successfully!");
      setIsModalOpen(false);
      resetPasswordForm.resetFields();

      // Clear stored credentials
      setPassword("");

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
          name="loginForm"
          labelCol={{ span: 6 }}
          wrapperCol={{ span: 16 }}
          style={{ minWidth: 600 }}
          onFinish={handleLogin}
          autoComplete="off"
        >
          <Form.Item
            label="Email"
            name="email"
            rules={[
              { required: true, message: "Please input your email!" },
              { type: "email", message: "Please enter a valid email address!" },
            ]}
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
        open={isModalOpen}
        onCancel={() => {
          setIsModalOpen(false);
          resetPasswordForm.resetFields();
        }}
        footer={null}
      >
        <Form
          form={resetPasswordForm}
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
                  if (value === password) {
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
                  if (value !== resetPasswordForm.getFieldValue("newPassword")) {
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

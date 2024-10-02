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
import { useLoginMutation } from "../redux/services/adminAuthService";
import { useLogoutMutation } from "../redux/services/adminAuthService";
import { useResetPasswordMutation } from "../redux/services/adminAuthService";

export default function LoginScreen() {
  const navigate = useNavigate();
  const { Text, Title } = Typography;
  const [error, setError] = useState<string | null>(null);
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [login, { isLoading }] = useLoginMutation();
  const [logout] = useLogoutMutation();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form] = Form.useForm();
  const [resetPassword, { isLoading: isResetting }] =
    useResetPasswordMutation();

  const validatePassword = (password: string) => {
    const passwordRegex =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]{8,}$/;
    return passwordRegex.test(password);
  };

  const onFinish = async (values: { username: string; password: string }) => {
    try {
      const response = await login(values).unwrap();
      setEmail(response.email);
      setPassword(values.password);
      const admin_type = response.admin_type;
      if (admin_type === "DEACTIVATED") {
        setError("Account Deactivated");
        await logout(response.token).unwrap();
        localStorage.removeItem("token");
        navigate("/login");
      }
      else if (admin_type === "UNVERIFIED") {
        setError("");
        setIsModalOpen(true);
      } else {
        navigate("/");
      }
    } catch (error) {
      console.error("Error:", error);
      setError("Invalid username or password. Please try again.");
    }
  };

  const onFinish2 = async (values: { newPassword: string }) => {
    const { newPassword } = values;

    if (!email) {
      message.error("User email not available");
      return;
    }
    console.log(password);
    if(newPassword==password) {
      message.error("Please key in a new password");
      return;
    }
    try {
      await resetPassword({
        email: email,
        oldPassword: password,
        newPassword,
      }).unwrap();
      message.success("Password changed successfully!");
      setIsModalOpen(false);
      setEmail("");
      setPassword("");
      form.resetFields();
      navigate("/");
    } catch (error) {
      console.error("Error updating password:", error);
      message.error("Could not update password. Please try again.");
    }
  };

  return (
    <Space
      direction="vertical"
      className="flex h-screen items-center justify-center"
    >
      <img src={logo} width="100%" style={{ alignSelf: "center" }} />
      <Title>PandaPay Admin</Title>
      <Title level={3}>Staff Login</Title>
      <Card style={{ backgroundColor: "#F5F5F5" }}>
        <Form
          name="basic"
          labelCol={{ span: 6 }}
          wrapperCol={{ span: 16 }}
          style={{ minWidth: 600 }}
          initialValues={{ remember: true }}
          onFinish={onFinish}
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
          </Form.Item>
        </Form>
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
          onFinish={onFinish2}
          autoComplete="off"
        >
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
    </Space>
  );
}

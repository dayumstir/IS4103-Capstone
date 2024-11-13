import { LoadingOutlined } from "@ant-design/icons";
import type { FormProps } from "antd";
import {
  Button,
  Card,
  Form,
  Input,
  message,
  Space,
  Spin,
  Typography,
} from "antd";
import React, { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import logo from "../assets/pandapay_logo.png";
import PendingEmailConfirmationModal from "../components/pendingEmailConfirmationModal";
import { useLoginMutation } from "../redux/services/auth";

export type LoginFormValues = {
  email?: string;
  password?: string;
};

const LoginScreen: React.FC = () => {
  const { Text, Title } = Typography;
  const [loginMutation, { isLoading }] = useLoginMutation();
  const navigate = useNavigate();
  const [
    pendingEmailConfirmationModalOpen,
    setPendingEmailConfirmationModalOpen,
  ] = useState(false);

  const onFinish: FormProps<LoginFormValues>["onFinish"] = async (data) => {
    loginMutation(data)
      .unwrap()
      .then((result) => {
        localStorage.setItem("token", result.token);
        localStorage.setItem("merchantId", result.id);
        navigate("/");
      })
      .catch((error) => {
        if (error.data.error === "Email pending verification" && data.email) {
          localStorage.setItem("email", data.email);
          setPendingEmailConfirmationModalOpen(true);
        }
        message.error(error.data.error);
      });
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
      <img src={logo} width="100%" style={{ alignSelf: "center" }} alt="PandaPay Logo" />
      <Title>PandaPay</Title>
      <Title level={3}>Your ultimate BNPL Provider</Title>
      <Card style={{ backgroundColor: "#F5F5F5" }}>
        <Form
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
            rules={[{ required: true, message: "Please input your Email!" }]}
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
            {isLoading ? (
              <Spin indicator={<LoadingOutlined spin />} />
            ) : (
              <Button type="primary" htmlType="submit">
                Login
              </Button>
            )}
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
    </Space>
  );
};

export default LoginScreen;

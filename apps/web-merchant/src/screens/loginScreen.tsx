import { LoadingOutlined } from "@ant-design/icons";
import type { FormProps } from "antd";
import { Button, Card, Form, Input, Space, Spin, Typography } from "antd";
import React, { useEffect } from "react";
import { useDispatch } from "react-redux";
import { NavLink, useNavigate } from "react-router-dom";
import logo from "../assets/pandapay_logo.png";
import { login } from "../redux/features/authSlice";
import { useLoginMutation } from "../redux/services/auth";
import { useSelector } from "react-redux";
import { RootState } from "../redux/store";
import { Alert } from "antd";

export type LoginFormValues = {
  email?: string;
  password?: string;
};

const LoginScreen: React.FC = () => {
  const { Text, Title } = Typography;
  const dispatch = useDispatch();
  const [loginMutation, { isLoading, error }] = useLoginMutation();
  const navigate = useNavigate();
  const isAuthenticated = useSelector(
    (state: RootState) => state.auth.isAuthenticated,
  );

  useEffect(() => {
    if (isAuthenticated) {
      navigate("/");
    }
  }, [isAuthenticated]);

  const onFinish: FormProps<LoginFormValues>["onFinish"] = async (data) => {
    console.log(data);
    const result = await loginMutation(data);
    if (result.data) {
      dispatch(login());
    }

    console.log("Success:", data);
  };

  return (
    <Space
      direction="vertical"
      className="flex h-screen items-center justify-center"
    >
      <img src={logo} width="100%" style={{ alignSelf: "center" }} />
      <Title>PandaPay</Title>
      <Title level={3}>Your ultimate BNPL Provider</Title>
      <Card style={{ backgroundColor: "#F5F5F5" }}>
        <Form
          name="basic"
          labelCol={{ span: 6 }}
          wrapperCol={{ span: 16 }}
          style={{ minWidth: 600 }}
          // initialValues={{ remember: true }}
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
              <Space>
                <Button type="primary" htmlType="submit">
                  Login
                </Button>
                {error ? (
                  <Alert
                    message="Login Failed. Please try again!"
                    type="error"
                    style={{ height: 35 }}
                  />
                ) : (
                  <></>
                )}
              </Space>
            )}
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

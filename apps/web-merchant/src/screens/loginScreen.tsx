import React from "react";
import type { FormProps } from "antd";
import {
  Button,
  Card,
  Checkbox,
  Form,
  Input,
  Typography,
  Space,
  Image,
} from "antd";
import { NavLink } from "react-router-dom";
import logo from "../assets/pandapay_logo.png";
// import PandaPay from "@repo/ui"

type FieldType = {
  username?: string;
  password?: string;
  remember?: string;
};

const onFinish: FormProps<FieldType>["onFinish"] = (values) => {
  console.log("Success:", values);
};

const onFinishFailed: FormProps<FieldType>["onFinishFailed"] = (errorInfo) => {
  console.log("Failed:", errorInfo);
};

const LoginScreen: React.FC = () => {
  const { Text, Title } = Typography;
  // const logo = require("../assets/pandapay_logo.png");
  const tailLayout = {
    wrapperCol: { offset: 6, span: 20 },
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
          initialValues={{ remember: true }}
          onFinish={onFinish}
          onFinishFailed={onFinishFailed}
          autoComplete="off"
        >
          <Form.Item<FieldType>
            label="Username"
            name="username"
            rules={[{ required: true, message: "Please input your username!" }]}
          >
            <Input />
          </Form.Item>

          <Form.Item<FieldType>
            label="Password"
            name="password"
            rules={[{ required: true, message: "Please input your password!" }]}
          >
            <Input.Password />
          </Form.Item>

          <Form.Item wrapperCol={{ offset: 6, span: 16 }}>
            <Button type="primary" htmlType="submit">
              Login
            </Button>
          </Form.Item>

          <Form.Item<FieldType>
            name="remember"
            valuePropName="checked"
            wrapperCol={{ offset: 6, span: 30 }}
          >
            {/* <Checkbox>Remember me</Checkbox> */}
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

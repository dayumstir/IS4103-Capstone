import React from "react";
import type { FormProps } from "antd";
import {
  Button,
  Card,
  Form,
  Input,
  Typography,
  Space,
} from "antd";
import { NavLink,useNavigate  } from "react-router-dom";
import logo from "../assets/pandapay_logo.png";

type FieldType = {
  username?: string;
  password?: string;
  remember?: string;
};


const LoginScreen: React.FC = () => {
  const navigate = useNavigate();
  const { Text, Title } = Typography;

  const onFinish: FormProps<FieldType>["onFinish"] = async (values) => {
    const { username, password } = values;
  
    try {
        const response = await fetch('http://localhost:3000/adminauth/login', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ username, password }), // Convert to JSON
        });
  
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
  
        const data = await response.json();

        localStorage.setItem('token', data.token);
        // Redirect to profile page

        navigate('/admin/profile');
      } catch (error) {
        console.error('Error:', error);
      }
  };

  const onFinishFailed: FormProps<FieldType>["onFinishFailed"] = (errorInfo) => {
    console.log("Failed:", errorInfo);
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
            {}
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
import React, { useEffect, useState } from "react";
import type { FormProps } from "antd";
import { Button, Card, Checkbox, Form, Input, Typography, Space } from "antd";
import { NavLink } from "react-router-dom";
import logo from "../assets/pandapay_logo.png";

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

const RegisterScreen: React.FC = () => {
  enum pageType {
    EmailUsername = 0,
    Password = 1,
    Details = 2,
    Documents = 3,
  }

  const { Text, Title } = Typography;
  const [pageIdx, setPageIdx] = useState(pageType.EmailUsername);

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
          {pageIdx == pageType.EmailUsername ? (
            <>
              <Form.Item
                name="email"
                label="E-mail"
                rules={[
                  {
                    type: "email",
                    message: "The input is not valid E-mail!",
                  },
                  {
                    required: true,
                    message: "Please input your E-mail!",
                  },
                ]}
              >
                <Input />
              </Form.Item>

              <Form.Item
                name="fullname"
                label="Full Name"
                rules={[
                  {
                    required: true,
                    message: "Please input your username!",
                    whitespace: true,
                  },
                ]}
              >
                <Input />
              </Form.Item>

              <Form.Item wrapperCol={{ offset: 6, span: 16 }}>
                <Button
                  type="primary"
                  htmlType="submit"
                  onClick={() => setPageIdx(pageType.Password)}
                >
                  Continue Register
                </Button>
              </Form.Item>
            </>
          ) : pageIdx == pageType.Password ? (
            <>
              <Form.Item
                name="password"
                label="Password"
                rules={[
                  {
                    required: true,
                    message: "Please input your password!",
                  },
                ]}
                hasFeedback
              >
                <Input.Password />
              </Form.Item>

              <Form.Item
                name="confirm"
                label="Confirm Password"
                dependencies={["password"]}
                hasFeedback
                rules={[
                  {
                    required: true,
                    message: "Please confirm your password!",
                  },
                  ({ getFieldValue }) => ({
                    validator(_, value) {
                      if (!value || getFieldValue("password") === value) {
                        return Promise.resolve();
                      }
                      return Promise.reject(
                        new Error(
                          "The new password that you entered do not match!",
                        ),
                      );
                    },
                  }),
                ]}
              >
                <Input.Password />
              </Form.Item>

              <Form.Item wrapperCol={{ offset: 6, span: 16 }}>
                <Button
                  type="primary"
                  htmlType="submit"
                  onClick={() => setPageIdx(pageType.EmailUsername)}
                  style={{ marginRight: 10 }}
                >
                  Back
                </Button>

                <Button
                  type="primary"
                  htmlType="submit"
                  onClick={() => setPageIdx(pageType.Documents)}
                >
                  Next
                </Button>
              </Form.Item>

              <Form.Item></Form.Item>
            </>
          ) : (
            <>
              <Form.Item wrapperCol={{ offset: 6, span: 16 }}>
                <Button
                  type="primary"
                  htmlType="submit"
                  onClick={() => setPageIdx(pageType.Password)}
                  style={{ marginRight: 10 }}
                >
                  Back
                </Button>
                <Button type="primary" htmlType="submit">
                  Register
                </Button>
              </Form.Item>
            </>
          )}
          {pageIdx == pageType.EmailUsername ? (
            <Form.Item<FieldType>
              name="remember"
              valuePropName="checked"
              wrapperCol={{ offset: 6, span: 30 }}
            >
              {/* <Checkbox>Remember me</Checkbox> */}
              <Text>
                Already have an account?{" "}
                <NavLink to="/login">Click to Login</NavLink>
              </Text>
            </Form.Item>
          ) : (
            <></>
          )}
        </Form>
      </Card>
    </Space>
  );
};

export default RegisterScreen;
